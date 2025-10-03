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

  // Extract offer title/description from CPX payload or set fallback
  const offerTitle = (payload.title && typeof payload.title === "string" && payload.title.trim().length > 0)
    ? payload.title.trim()
    : "CPX Offer";
  const offerDescription = (payload.description && typeof payload.description === "string" && payload.description.trim().length > 0)
    ? payload.description.trim()
    : "You completed an offer.";

  // Validate required CPX params (be very strict)
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

  // Insert into postback_logs (always try, log errors only)
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
    // Rate limiting (strict, per user, max 5 per minute)
    const { count: rateCount, error: rateError } = await supabase
      .from('completions')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userIdRaw)
      .gte('created_at', new Date(Date.now() - 60 * 1000).toISOString());
    if (rateError) console.error('Rate limit check failed:', rateError);
    if (rateCount !== null && rateCount > 5) {
      return res.status(429).json({ error: 'Rate limit exceeded: max 5 per minute per user.' });
    }

    // Idempotency: check by partner_callback_id (transactionId)
    const { data: existing, error: checkError } = await supabase
      .from('completions')
      .select('*')
      .eq('partner_callback_id', transactionId);
    // Supabase grąžina masyvą!
    const existingCompletion = Array.isArray(existing) && existing.length > 0 ? existing[0] : null;

    if (checkError) {
      console.error('Idempotency check error:', checkError);
      return res.status(500).json({ error: 'Internal server error', details: checkError.message });
    }

    if (existingCompletion && status === '2') {
      await supabase.from('completions').update({ status: 'reversed' }).eq('id', existingCompletion.id);
      const { error: rpcError } = await supabase.rpc('debit_user_points_for_payout', {
        uid: existingCompletion.user_id,
        pts: existingCompletion.credited_points,
        ref_payout: existingCompletion.id,
      });
      if (rpcError) throw rpcError;
      return res.status(200).json({ status: 'reversed', completion_id: existingCompletion.id });
    }

    if (existingCompletion) {
      return res.status(200).json({ status: 'already_processed', completion_id: existingCompletion.id });
    }

    // Fetch user
    const { data: userData, error: userError } = await supabase
      .from('users').select('*').eq('id', userIdRaw);

    const user = Array.isArray(userData) && userData.length > 0 ? userData[0] : null;
    if (userError || !user) return res.status(404).json({ error: 'User not found' });

    // Fetch partner (cpx)
    const { data: partnerData, error: partnerError } = await supabase
      .from('partners').select('*').eq('code', 'cpx');
    const partner = Array.isArray(partnerData) && partnerData.length > 0 ? partnerData[0] : null;
    if (partnerError || !partner) return res.status(404).json({ error: 'Partner not found' });

    // Try to find completion by offer_id_partner and user_id (extra safety)
    const { data: completionFindData, error: completionFindError } = await supabase
      .from('completions')
      .select('*')
      .eq('user_id', user.id)
      .eq('offer_id_partner', offerIdPartner);

    const alreadyCompletion = Array.isArray(completionFindData) && completionFindData.length > 0 ? completionFindData[0] : null;

    if (completionFindError) {
      console.error('Completion find error:', completionFindError);
      return res.status(500).json({ error: 'Internal server error', details: completionFindError.message });
    }

    if (alreadyCompletion) {
      return res.status(200).json({ status: 'already_processed', completion_id: alreadyCompletion.id });
    }

    // Insert credited completion (always fill title/description from CPX or fallback)
    const { data: completionInsertData, error: completionError } = await supabase
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
      .select();

    if (completionError) throw completionError;

    // Įrašyta completion – iš masyvo paimti pirmą elementą!
    const completion = Array.isArray(completionInsertData) && completionInsertData.length > 0
      ? completionInsertData[0]
      : completionInsertData;

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
        'increment_user_points',
        { uid: user.id, pts: amountLocal, ref_completion: completion.id }
      );
      if (rpcError) throw rpcError;
      // newBalance is array with user's new points balance
      const creditedBalance =
        Array.isArray(newBalance) && newBalance.length > 0
          ? newBalance[0]?.new_balance ?? newBalance[0]?.cur_balance ?? null
          : null;
      return res.status(200).json({
        status: 'credited',
        new_balance: creditedBalance,
        completion_id: completion.id,
      });
    }
  } catch (err) {
    console.error('CPX postback error:', err);
    return res.status(500).json({ error: 'Internal server error', details: err.message });
  }
}
