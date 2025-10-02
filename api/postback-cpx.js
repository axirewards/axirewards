import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  let payload = {};
  try {
    if (req.method === 'POST') {
      if (typeof req.body === 'string') {
        try {
          payload = JSON.parse(req.body);
        } catch (e) {
          payload = req.body;
        }
      } else {
        payload = req.body;
      }
    } else if (req.method === 'GET') {
      payload = req.query;
    } else {
      return res.status(405).send('Method Not Allowed');
    }
  } catch (e) {
    return res.status(400).json({ error: 'Invalid payload format' });
  }

  // Extract CPX fields
  const userIdRaw = parseInt(payload.user_id);
  const transactionId = (payload.trans_id || '').toString();
  const offerIdPartner = (payload.offer_id_partner || payload.offer_id || '').toString();
  const amountLocal = Math.floor(Number(payload.amount_local) || 0);
  const amountUsd = Number(payload.amount_usd) || 0;
  const status = String(payload.status);
  const ip = payload.ip_click || req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '';
  const country = payload.country || 'ALL';

  // Validate required CPX params
  if (
    !userIdRaw ||
    !transactionId ||
    !offerIdPartner ||
    isNaN(amountLocal) ||
    isNaN(amountUsd) ||
    !status
  ) {
    return res.status(400).json({ error: 'Missing required CPX parameters', payload });
  }

  // Insert into postback_logs
  try {
    await supabase.from('postback_logs').insert([
      {
        user_id: userIdRaw,
        transaction_id: transactionId,
        offer_id_partner: offerIdPartner,
        raw_payload: payload,
        ip,
        country,
        received_at: new Date().toISOString(),
      },
    ]);
  } catch (e) {
    console.error('Failed to log postback:', e);
  }

  try {
    // Rate limiting
    const { count: rateCount, error: rateError } = await supabase
      .from('completions')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userIdRaw)
      .gte('created_at', new Date(Date.now() - 60 * 1000).toISOString());
    if (rateError) console.error('Rate limit check failed:', rateError);
    if (rateCount !== null && rateCount > 5) {
      return res.status(429).json({ error: 'Rate limit exceeded: max 5 per minute per user.' });
    }

    // Idempotency check
    const { data: existing, error: checkError } = await supabase
      .from('completions')
      .select('*')
      .eq('partner_callback_id', transactionId)
      .single();

    if (existing && status === '2') {
      await supabase.from('completions').update({ status: 'reversed' }).eq('id', existing.id);
      const { error: rpcError } = await supabase.rpc('debit_user_points_for_payout', {
        uid: existing.user_id,
        pts: existing.credited_points,
        ref_payout: existing.id,
      });
      if (rpcError) throw rpcError;
      return res.status(200).json({ status: 'reversed', completion_id: existing.id });
    }

    if (existing) {
      return res.status(200).json({ status: 'already_processed', completion_id: existing.id });
    }

    // Fetch user
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userIdRaw)
      .single();
    if (userError || !user) return res.status(404).json({ error: 'User not found' });

    // Fetch partner (cpx)
    const { data: partner, error: partnerError } = await supabase
      .from('partners')
      .select('*')
      .eq('code', 'cpx')
      .single();
    if (partnerError || !partner) return res.status(404).json({ error: 'Partner not found' });

    // Try to find completion by offer_id_partner and user_id
    const { data: existingCompletion, error: completionFindError } = await supabase
      .from('completions')
      .select('*')
      .eq('user_id', user.id)
      .eq('offer_id_partner', offerIdPartner)
      .single();

    if (existingCompletion) {
      return res.status(200).json({ status: 'already_processed', completion_id: existingCompletion.id });
    }

    // Fetch offer for title/description
    let offerTitle = null;
    let offerDescription = null;
    try {
      const { data: offer, error: offerError } = await supabase
        .from('offers')
        .select('title, description')
        .eq('offer_id_partner', offerIdPartner)
        .single();
      if (offer && !offerError) {
        offerTitle = offer.title || null;
        offerDescription = offer.description || null;
      }
    } catch (e) {
      console.error('Failed to fetch offer for completions:', e);
    }

    // Insert credited completion with user_email, offer_id_partner, title, description
    const { data: completion, error: completionError } = await supabase
      .from('completions')
      .insert({
        user_id: user.id,
        user_email: user.email,
        offer_id_partner: offerIdPartner,
        partner_id: partner.id,
        partner_callback_id: transactionId,
        credited_points: amountLocal,
        status: status === '2' ? 'reversed' : 'credited',
        ip: ip,
        device_info: {},
        country: country,
        title: offerTitle,
        description: offerDescription,
      })
      .select()
      .single();

    if (completionError) throw completionError;

    // Credit or deduct points
    if (status === '2') {
      const { error: rpcError } = await supabase.rpc('debit_user_points_for_payout', {
        uid: user.id,
        pts: amountLocal,
        ref_payout: completion.id,
      });
      if (rpcError) throw rpcError;
      return res.status(200).json({ status: 'reversed', completion_id: completion.id });
    } else {
      const { data: newBalance, error: rpcError } = await supabase.rpc(
        'increment_user_points_and_levelpoints',
        { uid: user.id, pts: amountLocal, ref_completion: completion.id }
      );
      if (rpcError) throw rpcError;
      const creditedBalance =
        Array.isArray(newBalance) && newBalance.length > 0
          ? newBalance[0]?.new_balance
          : null;
      const creditedLevelpoints =
        Array.isArray(newBalance) && newBalance.length > 0
          ? newBalance[0]?.new_levelpoints
          : null;
      return res.status(200).json({
        status: 'credited',
        new_balance: creditedBalance,
        new_levelpoints: creditedLevelpoints,
        completion_id: completion.id,
      });
    }
  } catch (err) {
    console.error('CPX postback error:', err);
    return res.status(500).json({ error: 'Internal server error', details: err.message });
  }
}
