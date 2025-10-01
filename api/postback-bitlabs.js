import { createClient } from '@supabase/supabase-js';

// Supabase config
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// BitLabs secret for validation (never log this!)
const BITLABS_SECRET = process.env.BITLABS_SECRET;

export default async function handler(req, res) {
  // Accept BOTH GET and POST for BitLabs testing
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

  // BitLabs required parameters (1:1 su jų dokumentacija)
  const userId = payload.user_id;
  const transactionId = payload.transaction_id;
  const rewardRaw = payload.reward;
  const offerId = payload.offer_id;
  const status = payload.status;
  const currency = payload.currency;
  const surveyId = payload.survey_id;
  const offerType = payload.offer_type;
  const country = payload.country || payload.geo || 'ALL';
  const ip = payload.ip || req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '';
  const userAgent = payload.user_agent || req.headers['user-agent'] || '';
  const deviceInfo = payload.device_info || {};
  const signature = payload.signature;

  // Signature validation (SHA256 su secret)
  if (BITLABS_SECRET) {
    const sigData = `${userId}${transactionId}${rewardRaw}${BITLABS_SECRET}`;
    const expectedSignature = require('crypto').createHash('sha256').update(sigData).digest('hex');
    if (signature !== expectedSignature) {
      return res.status(403).json({ error: 'Invalid BitLabs signature' });
    }
  }

  // Validate required params
  const points = rewardRaw !== undefined && rewardRaw !== null ? parseFloat(rewardRaw) : null;
  if (!userId || !transactionId || points === null || isNaN(points) || points <= 0) {
    return res.status(400).json({ error: 'Missing or invalid BitLabs parameters', payload });
  }

  try {
    // Idempotency: don't double process
    const { data: existing } = await supabase
      .from('completions')
      .select('id')
      .eq('partner_callback_id', transactionId)
      .single();

    if (existing) {
      return res.status(200).json({ status: 'already_processed' });
    }

    // Fetch user
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Fetch BitLabs partner
    const { data: partner } = await supabase
      .from('partners')
      .select('*')
      .eq('code', 'bitlabs')
      .single();
    if (!partner) {
      return res.status(404).json({ error: 'Partner not found' });
    }

    // Fetch offer (by offer_id_partner)
    const { data: offer } = await supabase
      .from('offers')
      .select('*')
      .eq('offer_id_partner', offerId)
      .eq('partner_id', partner.id)
      .single();

    // Insert into completions
    const { data: completion, error: completionError } = await supabase
      .from('completions')
      .insert({
        user_id: user.id,
        offer_id: offer ? offer.id : null,
        partner_id: partner.id,
        partner_callback_id: transactionId,
        credited_points: points,
        status: status || 'credited',
        ip,
        user_agent: userAgent,
        device_info: deviceInfo,
        country,
        completion_steps: surveyId || offerType
          ? JSON.stringify({ survey_id: surveyId, offer_type: offerType })
          : null
      })
      .select()
      .single();

    if (completionError) throw completionError;

    // Increment user points atomically via RPC (jei turi funkciją)
    if (status === 'completed') {
      await supabase
        .rpc('increment_user_points', { uid: user.id, pts: points, ref_completion: completion.id });
    }

    // Log postback (jei turi lentelę postback_logs)
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

    return res.status(200).json({ status: 'ok', completion_id: completion.id });
  } catch (err) {
    console.error('BitLabs postback error:', err);
    return res.status(500).json({ error: 'Internal server error', details: err.message });
  }
}
