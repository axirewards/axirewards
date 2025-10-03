import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const BITLABS_SECRET = process.env.BITLABS_SECRET;

export default async function handler(req, res) {
  let payload = {};
  console.log('--- BitLabs Postback Handler ---');
  console.log('HTTP Method:', req.method);
  try {
    if (req.method === 'POST') {
      payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    } else if (req.method === 'GET') {
      payload = req.query;
    } else {
      console.log('Method Not Allowed:', req.method);
      return res.status(405).send('Method Not Allowed');
    }
  } catch (e) {
    console.log('Payload parse error:', e, req.body);
    return res.status(400).json({ error: 'Invalid payload format' });
  }

  // BitLabs mapping
  const userId = payload.user_id;
  const creditedPointsRaw = payload.rewards;
  const moneyRaw = payload.value;
  const transactionId = payload.transaction_id;
  const hash = payload.hash;

  // Debug: parodyk visas reikšmes
  console.log('Payload params:', { userId, creditedPointsRaw, moneyRaw, transactionId, hash });
  console.log('Full payload:', payload);

  // Signature calculation (BitLabs spec: SHA1(user_id + transaction_id + rewards + value + secret))
  const sigData = `${userId}${transactionId}${creditedPointsRaw}${moneyRaw}${BITLABS_SECRET}`;
  const expectedHash = crypto.createHash('sha1').update(sigData).digest('hex');

  console.log('Signature debug:', { sigData, expectedHash, hashFromPayload: hash, BITLABS_SECRET });

  if (BITLABS_SECRET) {
    if (hash !== expectedHash) {
      console.log('Invalid hash! Comparison:', { payload, sigData, expectedHash, hashFromPayload: hash });
      return res.status(403).json({ error: 'Invalid BitLabs hash', debug: { payload, sigData, expectedHash } });
    }
  }

  // Validate required params
  const points = creditedPointsRaw !== undefined && creditedPointsRaw !== null ? parseFloat(creditedPointsRaw) : null;
  if (!userId || !transactionId || points === null || isNaN(points) || points <= 0) {
    console.log('Invalid params:', { userId, transactionId, creditedPointsRaw, points });
    return res.status(400).json({ error: 'Missing or invalid BitLabs parameters', payload });
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
      .eq('partner_callback_id', transactionId)
      .single();

    if (existing) {
      console.log('Already processed transaction:', transactionId);
      return res.status(200).json({ status: 'already_processed', completion_id: existing.id });
    }

    // Fetch user
    const { data: user } = await supabase
      .from('users').select('*').eq('id', userId).single();
    if (!user) {
      console.log('User not found:', userId);
      return res.status(404).json({ error: 'User not found' });
    }

    // Fetch BitLabs partner
    const { data: partner } = await supabase
      .from('partners').select('*').eq('code', 'bitlabs').single();
    if (!partner) {
      console.log('BitLabs partner not found');
      return res.status(404).json({ error: 'Partner not found' });
    }

    // Insert into completions
    const { data: completion, error: completionError } = await supabase
      .from('completions')
      .insert({
        user_id: user.id,
        partner_id: partner.id,
        partner_callback_id: transactionId,
        credited_points: isReversed ? -points : points,
        money: moneyRaw,
        status: isReversed ? 'reversed' : 'credited',
        title: 'Bit Labs',
        description: 'You completed an offer.'
      })
      .select()
      .single();

    if (completionError) {
      console.log('Completion insert error:', completionError);
      throw completionError;
    }

    // Deduct points for reversal events only (increment handled by trigger, do not call increment RPC!)
    if (isReversed) {
      await supabase
        .rpc('debit_user_points_for_payout', { uid: user.id, pts: points, ref_payout: completion.id });
    }
    // NOTE: Points increment is handled by a Supabase trigger automatically when a row is inserted into completions. DO NOT call increment RPC here.

    // Log postback
    await supabase
      .from('postback_logs')
      .insert({
        user_id: user.id,
        transaction_id: transactionId,
        raw_payload: payload,
        received_at: new Date().toISOString()
      });

    console.log('Postback processed OK:', transactionId);
    return res.status(200).json({ status: completion.status, completion_id: completion.id });
  } catch (err) {
    console.log('Server error:', err);
    return res.status(500).json({ error: 'Internal server error', details: err.message });
  }
}
