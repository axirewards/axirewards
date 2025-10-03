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

  // BitLabs mapping (MUST match exactly as BitLabs docs: uid, tx, val, raw, hash)
  const uid = payload.uid;
  const tx = payload.tx;
  const val = payload.val;
  const raw = payload.raw;
  const hash = payload.hash;

  // SHA1 hash generation: SHA1(uid + tx + val + raw + secret)
  const sigData = `${uid}${tx}${val}${raw}${BITLABS_SECRET}`;
  const expectedHash = crypto.createHash('sha1').update(sigData).digest('hex');

  if (BITLABS_SECRET) {
    if (hash !== expectedHash) {
      return res.status(403).json({ error: 'Invalid BitLabs hash' });
    }
  }

  // Validate required params
  const points = val !== undefined && val !== null ? parseFloat(val) : null;
  if (!uid || !tx || points === null || isNaN(points) || points <= 0) {
    return res.status(400).json({ error: 'Missing or invalid BitLabs parameters' });
  }

  // Check for status param for reversal
  const isReversed = payload.status && (
    payload.status.toLowerCase() === 'reversed' ||
    payload.status.toLowerCase() === 'chargeback'
  );

  try {
    // Idempotency
    const { data: existing } = await supabase
      .from('completions')
      .select('id')
      .eq('partner_callback_id', tx)
      .single();

    if (existing) {
      return res.status(200).json({ status: 'already_processed', completion_id: existing.id });
    }

    // Fetch user
    const { data: user } = await supabase
      .from('users').select('*').eq('id', uid).single();
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Fetch BitLabs partner
    const { data: partner } = await supabase
      .from('partners').select('*').eq('code', 'bitlabs').single();
    if (!partner) {
      return res.status(404).json({ error: 'Partner not found' });
    }

    // Insert into completions
    const { data: completion, error: completionError } = await supabase
      .from('completions')
      .insert({
        user_id: user.id,
        partner_id: partner.id,
        partner_callback_id: tx,
        credited_points: isReversed ? -points : points,
        money: raw,
        status: isReversed ? 'reversed' : 'credited',
        title: 'Bit Labs',
        description: 'You completed an offer.'
      })
      .select()
      .single();

    if (completionError) {
      throw completionError;
    }

    // Deduct points for reversal events only (increment handled by trigger, do not call increment RPC!)
    if (isReversed) {
      await supabase
        .rpc('debit_user_points_for_payout', { uid: user.id, pts: points, ref_payout: completion.id });
    }
    // NOTE: Points increment is handled by a Supabase trigger automatically when a row is inserted into completions.

    // Log postback
    await supabase
      .from('postback_logs')
      .insert({
        user_id: user.id,
        transaction_id: tx,
        raw_payload: payload,
        received_at: new Date().toISOString()
      });

    return res.status(200).json({ status: completion.status, completion_id: completion.id });
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error', details: err.message });
  }
}
