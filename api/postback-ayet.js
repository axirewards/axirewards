import { createClient } from '@supabase/supabase-js';

// Supabase config
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Ayet Studios Postback Handler
 * - 100% as per official Ayet docs: https://docs.ayetstudios.com/v/product-docs/offerwall/postback-integration
 * - Handles all validated postbacks, auto-creates offer if missing, credits user, logs everything.
 */

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

  // Ayet postback param mapping (per doc)
  const userIdRaw =
    payload.externalIdentifier ||
    payload.uid ||
    payload.user_id;
  const offerIdPartner =
    payload.offer_id ||
    payload.offerIdPartner ||
    payload.offer_id_partner ||
    payload.campaign_id; // fallback
  const transactionId =
    payload.transaction_id ||
    payload.tx ||
    payload.offer_callback_id ||
    payload.partner_callback_id;
  const points = parseFloat(
    payload.reward ||
    payload.points ||
    payload.val ||
    payload.credited_points ||
    payload.currency_amount ||
    payload.amount ||
    payload.currency || // fallback for Ayet, sometimes currency is points
    0
  );
  const country = payload.country || payload.geo || 'ALL';
  const ip = payload.ip || req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '';
  const userAgent = payload.user_agent || req.headers['user-agent'] || '';
  const deviceInfo = payload.device_info || {};

  // === DEBUG LOGS, can be removed in production ===
  console.log("------ Ayet Postback Debug ------");
  console.log("payload:", payload);
  console.log("userIdRaw:", userIdRaw);
  console.log("offerIdPartner:", offerIdPartner);
  console.log("transactionId:", transactionId);
  console.log("points:", points);
  console.log("country:", country);
  console.log("ip:", ip);

  // Validate required Ayet params, per official docs
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
      return res.status(200).json({ status: 'already_processed', completion_id: existing.id });
    }

    // Fetch user by AXI ID
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

    // Fetch offer (by offerIdPartner, auto-create if missing)
    let { data: offer, error: offerError } = await supabase
      .from('offers')
      .select('*')
      .eq('offer_id_partner', offerIdPartner)
      .eq('partner_id', partner.id)
      .single();

    if (offerError || !offer) {
      // Create offer automatically if missing (per CPX/BitLabs logic)
      const { data: createdOffer, error: createOfferError } = await supabase
        .from('offers')
        .insert({
          partner_id: partner.id,
          offer_id_partner: offerIdPartner,
          title: `Ayet offer ${offerIdPartner}`,
          country: country,
          status: 'active',
        })
        .select()
        .single();
      if (createOfferError || !createdOffer) {
        return res.status(500).json({ error: 'Failed to create offer automatically', details: createOfferError?.message });
      }
      offer = createdOffer;
    }

    // Insert completion
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

    // REMOVE increment_user_points RPC call, now handled by trigger
    // const { data: newBalance, error: rpcError } = await supabase
    //   .rpc('increment_user_points', { uid: user.id, pts: points, ref_completion: completion.id });
    // if (rpcError) throw rpcError;

    // Log postback for audit
    await supabase
      .from('postback_logs')
      .insert({
        user_id: user.id,
        transaction_id: transactionId,
        offer_id_partner: offerIdPartner,
        raw_payload: payload,
        ip,
        country,
        received_at: new Date().toISOString()
      });

    return res.status(200).json({
      status: 'ok',
      completion_id: completion.id
    });
  } catch (err) {
    console.error('Ayet postback error:', err);
    return res.status(500).json({ error: 'Internal server error', details: err.message });
  }
}
