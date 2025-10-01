import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * CPX Research-specific postback endpoint
 * Accepts GET or POST, parses CPX parameters, handles reversals & frauds per CPX docs:
 * https://cpx-research.com/docs/postback-integration
 */
export default async function handler(req, res) {
  // Accept both GET and POST for CPX compatibility
  const method = req.method;
  let payload = {};
  if (method === 'POST') {
    payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  } else if (method === 'GET') {
    payload = req.query;
  } else {
    return res.status(405).send('Method Not Allowed');
  }

  // Required fields from CPX:
  // status, trans_id, user_id, amount_local, amount_usd, offer_id
  const userIdRaw = payload.user_id;
  const transactionId = payload.trans_id;
  const offerIdPartner = payload.offer_id;
  const amountLocal = parseFloat(payload.amount_local || 0);
  const amountUsd = parseFloat(payload.amount_usd || 0);
  const status = payload.status; // 1 = pending/credited, 2 = reversed
  const ip = payload.ip_click || req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '';
  const secureHash = payload.hash || '';
  const country = payload.country || 'ALL';

  if (!userIdRaw || !transactionId || !offerIdPartner || !amountLocal || !amountUsd || !status) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  try {
    // Check for idempotency (transaction can be reversed later)
    const { data: existing, error: checkError } = await supabase
      .from('completions')
      .select('*')
      .eq('partner_callback_id', transactionId)
      .single();

    // If status=2 (reversed), update completion and deduct points
    if (existing && String(status) === '2') {
      // Mark as reversed and deduct points
      await supabase
        .from('completions')
        .update({ status: 'reversed' })
        .eq('id', existing.id);

      // Deduct points via RPC (you may want a dedicated function for reversals)
      const { error: rpcError } = await supabase
        .rpc('decrement_user_points', { uid: existing.user_id, pts: existing.credited_points, ref_completion: existing.id });

      if (rpcError) throw rpcError;

      return res.status(200).json({ status: 'reversed', completion_id: existing.id });
    }

    // If already credited and not reversal, just acknowledge
    if (existing) {
      return res.status(200).json({ status: 'already_processed', completion_id: existing.id });
    }

    // Fetch user
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userIdRaw)
      .single();

    if (userError || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Fetch partner (cpx)
    const { data: partner, error: partnerError } = await supabase
      .from('partners')
      .select('*')
      .eq('code', 'cpx')
      .single();

    if (partnerError || !partner) {
      return res.status(404).json({ error: 'Partner not found' });
    }

    // Fetch offer (by partner offer id)
    const { data: offer, error: offerError } = await supabase
      .from('offers')
      .select('*')
      .eq('offer_id_partner', offerIdPartner)
      .eq('partner_id', partner.id)
      .single();

    if (offerError || !offer) {
      return res.status(404).json({ error: 'Offer not found' });
    }

    // Calculate points to credit (use amount_local or amount_usd, per your business rules)
    // Here we use amount_local, adjust if needed
    const points = amountLocal;

    // Insert credited completion
    const { data: completion, error: completionError } = await supabase
      .from('completions')
      .insert({
        user_id: user.id,
        offer_id: offer.id,
        partner_id: partner.id,
        partner_callback_id: transactionId,
        credited_points: points,
        status: String(status) === '2' ? 'reversed' : 'credited',
        ip: ip,
        device_info: {},
        country: country
      })
      .select()
      .single();

    if (completionError) throw completionError;

    // Credit or deduct points atomically based on status
    if (String(status) === '2') {
      // Reversed: Deduct
      const { error: rpcError } = await supabase
        .rpc('decrement_user_points', { uid: user.id, pts: points, ref_completion: completion.id });
      if (rpcError) throw rpcError;
      return res.status(200).json({ status: 'reversed', completion_id: completion.id });
    } else {
      // Credited: Add
      const { data: newBalance, error: rpcError } = await supabase
        .rpc('increment_user_points', { uid: user.id, pts: points, ref_completion: completion.id });
      if (rpcError) throw rpcError;
      return res.status(200).json({ status: 'credited', new_balance: newBalance[0].new_balance, completion_id: completion.id });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error', details: err.message });
  }
}
