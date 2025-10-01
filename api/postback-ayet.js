import { createClient } from '@supabase/supabase-js';

// Supabase config
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  // Accept JSON or urlencoded
  let payload = {};
  try {
    payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  } catch (e) {
    return res.status(400).json({ error: 'Invalid payload format' });
  }

  // Ayet postback parameter mapping (accept all common variations!)
  const userIdRaw =
    payload.externalIdentifier ||
    payload.uid ||
    payload.user_id;
  const offerIdPartner =
    payload.offerIdPartner ||
    payload.offer_id_partner ||
    payload.offer_id;
  const transactionId =
    payload.partner_callback_id ||
    payload.transactionId ||
    payload.offer_callback_id ||
    payload.transaction_id;
  const points = parseFloat(
    payload.points ||
    payload.credited_points ||
    payload.currency_amount ||
    payload.currency ||
    payload.amount ||
    0
  );
  const country = payload.country || 'ALL';
  const ip = payload.ip || req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '';
  const userAgent = payload.user_agent || req.headers['user-agent'] || '';
  const deviceInfo = payload.device_info || {};

  // Validate required Ayet params
  if (!userIdRaw || !offerIdPartner || !transactionId || isNaN(points) || points <= 0) {
    return res.status(400).json({ error: 'Missing or invalid Ayet parameters', payload });
  }

  try {
    // Idempotency: don't double process
    const { data: existing, error: checkError } = await supabase
      .from('completions')
      .select('id')
      .eq('partner_callback_id', transactionId)
      .single();

    if (checkError) throw checkError;
    if (existing) {
      return res.status(200).json({ status: 'already_processed' });
    }

    // Fetch user (by id, not email!)
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userIdRaw)
      .single();
    if (userError || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Fetch Ayet partner
    const { data: partner, error: partnerError } = await supabase
      .from('partners')
      .select('*')
      .eq('code', 'ayet')
      .single();
    if (partnerError || !partner) {
      return res.status(404).json({ error: 'Partner not found' });
    }

    // Fetch offer (by offerIdPartner)
    const { data: offer, error: offerError } = await supabase
      .from('offers')
      .select('*')
      .eq('offer_id_partner', offerIdPartner)
      .eq('partner_id', partner.id)
      .single();
    if (offerError || !offer) {
      return res.status(404).json({ error: 'Offer not found' });
    }

    // Insert into completions
    const { data: completion, error: completionError } = await supabase
      .from('completions')
      .insert({
        user_id: user.id,
        offer_id: offer.id,
        partner_id: partner.id,
        partner_callback_id: transactionId,
        credited_points: points,
        status: 'credited',
        ip,
        user_agent: userAgent,
        device_info: deviceInfo,
        country
      })
      .select()
      .single();

    if (completionError) throw completionError;

    // Increment user points atomically via RPC
    const { data: newBalance, error: rpcError } = await supabase
      .rpc('increment_user_points', { uid: user.id, pts: points, ref_completion: completion.id });

    if (rpcError) throw rpcError;

    return res.status(200).json({
      status: 'ok',
      new_balance: newBalance?.[0]?.new_balance,
      completion_id: completion.id
    });
  } catch (err) {
    console.error('Ayet postback error:', err);
    return res.status(500).json({ error: 'Internal server error', details: err.message });
  }
}
