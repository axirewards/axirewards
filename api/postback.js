import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const PROVIDERS = {
  ayet: {
    secret: process.env.POSTBACK_SECRET_AYET
  },
  cpx: {
    secret: process.env.POSTBACK_SECRET_CPX
  },
  offertoro: {
    secret: process.env.POSTBACK_SECRET_OFFERTORO
  }
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const payload = req.body;

  const providerCode = payload.provider?.toLowerCase();
  if (!providerCode || !PROVIDERS[providerCode]) {
    return res.status(400).json({ error: 'Unknown provider' });
  }

  const providerSecret = PROVIDERS[providerCode].secret;
  const receivedSecret = payload.secret;

  if (!receivedSecret || receivedSecret !== providerSecret) {
    return res.status(403).json({ error: 'Invalid secret' });
  }

  const partnerCallbackId = payload.offer_callback_id;
  const userEmail = payload.user_email;
  const offerIdPartner = payload.offer_id_partner;
  const points = parseFloat(payload.points || 0);
  const country = payload.country || 'ALL';
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const userAgent = req.headers['user-agent'] || '';

  if (!userEmail || !partnerCallbackId || !offerIdPartner || points <= 0) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  try {
    // Check if completion already exists (idempotency)
    const { data: existing, error: checkError } = await supabase
      .from('completions')
      .select('*')
      .eq('partner_callback_id', partnerCallbackId)
      .single();

    if (existing) {
      return res.status(200).json({ status: 'already_processed' });
    }

    // Fetch user
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('email', userEmail)
      .single();

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Fetch partner
    const { data: partner } = await supabase
      .from('partners')
      .select('*')
      .eq('code', providerCode)
      .single();

    if (!partner) {
      return res.status(404).json({ error: 'Partner not found' });
    }

    // Fetch offer
    const { data: offer } = await supabase
      .from('offers')
      .select('*')
      .eq('offer_id_partner', offerIdPartner)
      .eq('partner_id', partner.id)
      .single();

    if (!offer) {
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
        status: 'credited',
        ip: ip,
        user_agent: userAgent,
        device_info: payload.device_info || {},
        country: country
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
