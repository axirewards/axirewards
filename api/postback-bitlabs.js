import { createClient } from '@supabase/supabase-js';

// Supabase config
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// BitLabs secret for validation (never log this!)
const BITLABS_SECRET = process.env.POSTBACK_SECRET_BITLABS;

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

  // BitLabs required params (see https://docs.bitlabs.ai/docs/postbacks)
  // uid: your user id
  // survey_id: BitLabs survey id
  // transaction_id: unique transaction id for idempotency
  // reward: points awarded (recommended: integer, but can be decimal)
  // secret: your postback secret (for validation)
  const userIdRaw = payload.uid;
  const surveyId = payload.survey_id;
  const transactionId = payload.transaction_id;
  const points = parseFloat(payload.reward || 0);
  const receivedSecret = payload.secret;
  const country = payload.geo || payload.country || 'ALL';
  const ip = payload.ip || req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '';
  const userAgent = payload.user_agent || req.headers['user-agent'] || '';
  const deviceInfo = payload.device_info || {};

  // Secret validation
  if (!BITLABS_SECRET || !receivedSecret || receivedSecret !== BITLABS_SECRET) {
    return res.status(403).json({ error: 'Invalid BitLabs secret' });
  }

  // Validate required BitLabs params
  if (!userIdRaw || !surveyId || !transactionId || isNaN(points) || points <= 0) {
    return res.status(400).json({ error: 'Missing or invalid BitLabs parameters', payload });
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

    // Fetch BitLabs partner
    const { data: partner, error: partnerError } = await supabase
      .from('partners')
      .select('*')
      .eq('code', 'bitlabs')
      .single();
    if (partnerError || !partner) {
      return res.status(404).json({ error: 'Partner not found' });
    }

    // Fetch offer (by survey_id as offer_id_partner)
    const { data: offer, error: offerError } = await supabase
      .from('offers')
      .select('*')
      .eq('offer_id_partner', surveyId)
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

    return res.status(200).json({ status: 'ok', new_balance: newBalance?.[0]?.new_balance, completion_id: completion.id });
  } catch (err) {
    console.error('BitLabs postback error:', err);
    return res.status(500).json({ error: 'Internal server error', details: err.message });
  }
}
