import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const BITLABS_SECRET = process.env.BITLABS_SECRET;

export default async function handler(req, res) {
  let payload = {};
  if (req.method === 'POST') {
    try {
      payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    } catch (e) {
      return res.status(400).json({ error: 'Invalid payload format' });
    }
  } else if (req.method === 'GET') {
    payload = req.query;
  } else {
    return res.status(405).send('Method Not Allowed');
  }

  // Map params to completions fields
  const userId = payload.user_id || payload.uid;
  const transactionId = payload.transaction_id || payload.tx;
  const creditedPointsRaw = payload.reward || payload.val;
  const moneyRaw = payload.value || payload.raw; // USD value, can be null
  const status = payload.status;
  const currency = payload.currency;
  const offerId = payload.offer_id;
  const surveyId = payload.survey_id;
  const offerType = payload.offer_type;
  const country = payload.country || payload.geo || 'ALL';
  const ip = payload.ip || req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '';
  const userAgent = payload.user_agent || req.headers['user-agent'] || '';
  const deviceInfo = payload.device_info || {};
  const signature = payload.signature;

  // Signature calculation (user_id + transaction_id + reward + value + secret)
  const sigData = `${userId}${transactionId}${creditedPointsRaw}${moneyRaw}${BITLABS_SECRET}`;
  const expectedSignature = crypto.createHash('sha256').update(sigData).digest('hex');
  if (BITLABS_SECRET) {
    if (signature !== expectedSignature) {
      return res.status(403).json({ error: 'Invalid BitLabs signature', debug: { payload, sigData, expectedSignature } });
    }
  }

  // Validate required params
  const points = creditedPointsRaw !== undefined && creditedPointsRaw !== null ? parseFloat(creditedPointsRaw) : null;
  if (!userId || !transactionId || points === null || isNaN(points) || points <= 0) {
    return res.status(400).json({ error: 'Missing or invalid BitLabs parameters', payload });
  }

  try {
    // Idempotency
    const { data: existing } = await supabase
      .from('completions')
      .select('id')
      .eq('partner_callback_id', transactionId)
      .single();

    if (existing) {
      return res.status(200).json({ status: 'already_processed', completion_id: existing.id });
    }

    // Fetch user
    const { data: user } = await supabase
      .from('users').select('*').eq('id', userId).single();
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Fetch BitLabs partner
    const { data: partner } = await supabase
      .from('partners').select('*').eq('code', 'bitlabs').single();
    if (!partner) return res.status(404).json({ error: 'Partner not found' });

    // Insert into completions
    const { data: completion, error: completionError } = await supabase
      .from('completions')
      .insert({
        user_id: user.id,
        partner_id: partner.id,
        partner_callback_id: transactionId,
        credited_points: points,
        money: moneyRaw,
        currency,
        offer_id: offerId,
        survey_id: surveyId,
        offer_type: offerType,
        country,
        ip,
        user_agent: userAgent,
        device_info: deviceInfo,
        status: status === 'chargeback' ? 'reversed' : (status === 'completed' ? 'credited' : status || 'credited'),
        title: 'Bit Labs',
        description: 'You completed an offer.'
      })
      .select()
      .single();

    if (completionError) throw completionError;

    // Only deduct points if reversed, increment handled by trigger
    if (completion.status === 'reversed') {
      await supabase
        .rpc('debit_user_points_for_payout', { uid: user.id, pts: points, ref_payout: completion.id });
    }

    // Log postback
    await supabase
      .from('postback_logs')
      .insert({
        user_id: user.id,
        transaction_id: transactionId,
        offer_id_partner: offerId,
        raw_payload: payload,
        ip,
        country,
        received_at: new Date().toISOString()
      });

    return res.status(200).json({ status: completion.status, completion_id: completion.id });
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error', details: err.message });
  }
}
