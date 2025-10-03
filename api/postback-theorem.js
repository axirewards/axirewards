import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const THEOREM_SECRET = process.env.THEOREM_SECRET;

/**
 * TheoremReach Postback Handler
 * - Follows official docs: https://theoremreach.com/docs/server2server
 * - HMAC SHA-1 hash validation, debug/test callback support, idempotency, auto-offer creation, all param mapping.
 */

function createTheoremHash(baseUrl, secretKey) {
  // RFC 2014-compliant HMAC SHA-1, with base64 and substitutions
  const hmac = crypto.createHmac('sha1', secretKey);
  hmac.update(baseUrl, 'utf8');
  const base64 = hmac.digest('base64');
  // Substitute per TheoremReach instructions
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=|\n/g, '');
}

export default async function handler(req, res) {
  // Accept GET and POST
  let params = {};
  if (req.method === 'POST') {
    try {
      params = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    } catch (e) {
      return res.status(400).json({ error: 'Invalid payload format' });
    }
  } else if (req.method === 'GET') {
    params = req.query;
  } else {
    return res.status(405).send('Method Not Allowed');
  }

  // Ignore debug callbacks (TheoremReach spec)
  if (params.debug === 'true') {
    return res.status(200).json({ status: 'debug_callback_ignored' });
  }

  // TheoremReach postback param mapping
  const reward = parseFloat(params.reward || 0);
  const currency = parseFloat(params.currency || 0);
  const userId = params.user_id || params.external_identifier;
  const txId = params.tx_id || params.transaction_id;
  const hash = params.hash;
  const offerIdPartner = params.offer_id || params.survey_id;
  const offerName = params.offer_name;
  const ip = params.ip || req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '';
  const country = params.country || 'ALL';
  const reversal = params.reversal === 'true';
  const screenout = params.screenout === '1';
  const profiler = params.profiler === '1';
  const offer = params.offer === 'true';
  const placementId = params.placement_id;
  const partnerId = params.partner_id;
  const router = params.router === 'true';
  const totalPayment = parseFloat(params.total_payment || 0);

  // Build the base URL for hash validation (exclude "hash" param)
  // The base URL must include all query params except hash, in original order!
  const originalUrl = req.originalUrl || req.url; // Next.js API uses req.url
  let urlForHash = `${req.protocol || 'https'}://${req.headers.host}${originalUrl}`;
  // Remove &hash=... from URL for hash calculation
  urlForHash = urlForHash.replace(/([&?])hash=[^&]+(&|$)/, '$1').replace(/[\?&]$/, '');

  // Validate TheoremReach hash
  if (THEOREM_SECRET) {
    const expectedHash = createTheoremHash(urlForHash, THEOREM_SECRET);
    if (hash !== expectedHash) {
      return res.status(403).json({
        error: 'Invalid TheoremReach hash',
        debug: { urlForHash, expectedHash, receivedHash: hash, params }
      });
    }
  }

  // Validate required params
  if (!userId || !txId || isNaN(reward)) {
    return res.status(400).json({ error: 'Missing or invalid TheoremReach parameters', params });
  }

  try {
    // Idempotency: don't double process
    const { data: existing } = await supabase
      .from('completions')
      .select('id')
      .eq('partner_callback_id', txId)
      .single();

    if (existing) {
      return res.status(200).json({ status: 'already_processed', completion_id: existing.id });
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

    // Fetch TheoremReach partner
    const { data: partner } = await supabase
      .from('partners')
      .select('*')
      .eq('code', 'theorem')
      .single();
    if (!partner) {
      return res.status(404).json({ error: 'Partner not found' });
    }

    // Fetch offer (by offerIdPartner, auto-create if missing!)
    let { data: offer, error: offerError } = await supabase
      .from('offers')
      .select('*')
      .eq('offer_id_partner', offerIdPartner)
      .eq('partner_id', partner.id)
      .single();

    if (offerError || !offer) {
      // Create offer automatically if missing
      const { data: createdOffer, error: createError } = await supabase
        .from('offers')
        .insert({
          partner_id: partner.id,
          offer_id_partner: offerIdPartner,
          title: offerName ? `Theorem: ${offerName}` : `Theorem offer ${offerIdPartner}`,
          country: country,
          status: 'active',
        })
        .select()
        .single();
      if (createError || !createdOffer) {
        return res.status(500).json({ error: 'Failed to create offer automatically', details: createError?.message });
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
        partner_callback_id: txId,
        credited_points: reversal ? -reward : reward,
        currency: currency,
        ip,
        country,
        status: reversal ? 'reversed' : 'credited',
        screenout,
        profiler,
        offer,
        offer_name: offerName,
        placement_id: placementId,
        partner_id_external: partnerId,
        router,
        total_payment: totalPayment,
        // ADDED FIELDS
        title: "Theorem Reach",
        description: "You completed an offer."
      })
      .select()
      .single();

    if (completionError) throw completionError;

    // Increment user points atomically via RPC (skip if reversal)
    if (!reversal) {
      await supabase.rpc('increment_user_points', {
        uid: user.id,
        pts: reward,
        ref_completion: completion.id
      });
    } else {
      await supabase.rpc('debit_user_points_for_payout', {
        uid: user.id,
        pts: reward,
        ref_payout: completion.id
      });
    }

    // Log postback for audit
    await supabase
      .from('postback_logs')
      .insert({
        user_id: user.id,
        transaction_id: txId,
        offer_id_partner: offerIdPartner,
        raw_payload: params,
        ip,
        country,
        received_at: new Date().toISOString()
      });

    return res.status(200).json({
      status: reversal ? 'reversed' : 'ok',
      completion_id: completion.id
    });
  } catch (err) {
    console.error('TheoremReach postback error:', err);
    return res.status(500).json({ error: 'Internal server error', details: err.message });
  }
}
