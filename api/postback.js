import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const PROVIDERS = {
  ayet: {
    secret: process.env.POSTBACK_SECRET_AYET,
    getUserId: payload => payload.externalIdentifier, // Ayet: user.id
    getOfferId: payload => payload.offerIdPartner || payload.offer_id_partner,
    getPoints: payload => parseFloat(payload.points || payload.credited_points || 0),
    getCallbackId: payload => payload.partner_callback_id || payload.transactionId || payload.offer_callback_id,
    map: payload => ({
      country: payload.country || 'ALL',
      device_info: payload.device_info || {},
      status: 'credited',
      user_agent: payload.user_agent || '',
      ip: payload.ip || '',
    }),
  },
  bitlabs: {
    secret: process.env.POSTBACK_SECRET_BITLABS,
    getUserId: payload => payload.uid, // BitLabs: user.id
    getOfferId: payload => payload.survey_id || payload.offer_id_partner || null,
    getPoints: payload => parseFloat(payload.points || payload.credited_points || payload.reward || 0),
    getCallbackId: payload => payload.transaction_id || payload.partner_callback_id || payload.offer_callback_id,
    map: payload => ({
      country: payload.country || payload.geo || 'ALL',
      device_info: payload.device_info || {},
      status: 'credited',
      user_agent: payload.user_agent || '',
      ip: payload.ip || '',
    }),
  },
  cpx: {
    secret: process.env.POSTBACK_SECRET_CPX,
    // TODO: add mapping if/when needed
  },
  offertoro: {
    secret: process.env.POSTBACK_SECRET_OFFERTORO,
    // TODO: add mapping if/when needed
  }
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  // Accept JSON or urlencoded
  const payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

  // Detect provider: get from payload.provider or fallback to referer checks
  const providerCode = (payload.provider || payload.source || '').toLowerCase();
  if (!providerCode || !PROVIDERS[providerCode]) {
    return res.status(400).json({ error: 'Unknown provider' });
  }

  const provider = PROVIDERS[providerCode];

  // Secret validation
  const providerSecret = provider.secret;
  const receivedSecret = payload.secret;
  if (!providerSecret || !receivedSecret || receivedSecret !== providerSecret) {
    return res.status(403).json({ error: 'Invalid secret' });
  }

  // --- Unified multiprovider extraction ---
  const userIdRaw = provider.getUserId(payload);
  const offerIdPartner = provider.getOfferId(payload);
  const points = provider.getPoints(payload);
  const partnerCallbackId = provider.getCallbackId(payload);
  const extra = provider.map(payload);

  // Validate required fields
  if (!userIdRaw || !partnerCallbackId || !offerIdPartner || points <= 0) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  try {
    // Check idempotency: completions.partner_callback_id
    const { data: existing, error: checkError } = await supabase
      .from('completions')
      .select('id')
      .eq('partner_callback_id', partnerCallbackId)
      .single();

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

    // Fetch partner
    const { data: partner, error: partnerError } = await supabase
      .from('partners')
      .select('*')
      .eq('code', providerCode)
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

    // Insert into completions
    const { data: completion, error: completionError } = await supabase
      .from('completions')
      .insert({
        user_id: user.id,
        offer_id: offer.id,
        partner_id: partner.id,
        partner_callback_id: partnerCallbackId,
        credited_points: points,
        status: extra.status,
        ip: extra.ip || req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '',
        user_agent: extra.user_agent || req.headers['user-agent'] || '',
        device_info: extra.device_info,
        country: extra.country
      })
      .select()
      .single();

    if (completionError) throw completionError;

    // Increment user points atomically via RPC
    const { data: newBalance, error: rpcError } = await supabase
      .rpc('increment_user_points', { uid: user.id, pts: points, ref_completion: completion.id });

    if (rpcError) throw rpcError;

    return res.status(200).json({ status: 'ok', new_balance: newBalance[0].new_balance });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error', details: err.message });
  }
}
