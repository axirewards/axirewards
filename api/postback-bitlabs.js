import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Secret must match the one set in BitLabs dashboard (Settings > Security)
const BITLABS_SECRET = process.env.BITLABS_SECRET;

// BitLabs offers both GET and POST callback, so support both
export default async function handler(req, res) {
  let payload = {};

  // Accept both GET and POST
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

  // BitLabs docs: always expect these params (https://developer.bitlabs.ai/docs/callback-parameters)
  const uid = payload.uid; // user's ID in your system
  const tx = payload.tx;   // transaction id (unique for event)
  const val = payload.val; // reward value (your currency/points)
  const raw = payload.raw; // reward value (USD)
  const hash = payload.hash; // hash for verification
  const status = payload.status ? payload.status.toLowerCase() : undefined; // can be 'credited', 'reversed', 'chargeback' etc.

  // Secure callback: SHA1(uid + tx + val + raw + secret)
  // See: https://developer.bitlabs.ai/docs/securing-callbacks-through-hashing
  if (!uid || !tx || !val || !raw || !hash) {
    return res.status(400).json({ error: 'Missing required BitLabs callback parameters', payload });
  }
  const sigData = `${uid}${tx}${val}${raw}${BITLABS_SECRET}`;
  const expectedHash = crypto.createHash('sha1').update(sigData).digest('hex');
  if (hash !== expectedHash) {
    return res.status(403).json({ error: 'Invalid BitLabs hash' });
  }

  // Validate reward value
  const points = parseFloat(val);
  if (!Number.isFinite(points) || points <= 0) {
    return res.status(400).json({ error: 'Invalid reward value', payload });
  }

  // Check for reversal/chargeback
  const isReversed =
    status === 'reversed' ||
    status === 'chargeback' ||
    points < 0; // BitLabs can send negative value on reversal

  try {
    // Idempotency: don't process the same tx twice
    const { data: existing } = await supabase
      .from('completions')
      .select('id')
      .eq('partner_callback_id', tx)
      .single();
    if (existing) {
      return res.status(200).json({ status: 'already_processed', completion_id: existing.id });
    }

    // Find the user
    const { data: user } = await supabase
      .from('users').select('*').eq('id', uid).single();
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Find BitLabs partner
    const { data: partner } = await supabase
      .from('partners').select('*').eq('code', 'bitlabs').single();
    if (!partner) {
      return res.status(404).json({ error: 'Partner not found' });
    }

    // Insert event to completions table
    const { data: completion, error: completionError } = await supabase
      .from('completions')
      .insert({
        user_id: user.id,
        partner_id: partner.id,
        partner_callback_id: tx,
        credited_points: isReversed ? -Math.abs(points) : points,
        money: raw,
        status: isReversed ? 'reversed' : 'credited',
        title: 'BitLabs Offer',
        description: isReversed
          ? 'Your offer was reversed/chargebacked by partner.'
          : 'You completed a BitLabs offer.'
      })
      .select()
      .single();

    if (completionError) throw completionError;

    // If reversal, deduct points (increment handled by DB trigger on insert, do NOT manually increment here)
    if (isReversed) {
      await supabase
        .rpc('debit_user_points_for_payout', { uid: user.id, pts: Math.abs(points), ref_payout: completion.id });
    }

    // Log the postback event for auditing
    await supabase
      .from('postback_logs')
      .insert({
        user_id: user.id,
        transaction_id: tx,
        raw_payload: payload,
        received_at: new Date().toISOString()
      });

    // Respond with status
    return res.status(200).json({ status: completion.status, completion_id: completion.id });
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error', details: err.message });
  }
}
