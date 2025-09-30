import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const PROVIDER_SECRETS = {
  ayet: process.env.POSTBACK_SECRET_AYET,
  cpx: process.env.POSTBACK_SECRET_CPX,
  lootably: process.env.POSTBACK_SECRET_LOOTABLY,
  adgem: process.env.POSTBACK_SECRET_ADGEM
};

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const provider = (req.query.provider || req.body.provider || '').toLowerCase();
  if (!provider || !PROVIDER_SECRETS[provider]) return res.status(400).send('Unknown provider');

  const secret = PROVIDER_SECRETS[provider];

  // Universalūs parametrai
  const userId = req.query.userID || req.body.userID || req.query.external_identifier || req.body.external_identifier;
  const offerId = req.query.offerID || req.body.offerID || req.query.offer_id || req.body.offer_id;
  const offerName = req.query.offerName || req.body.offerName || req.query.offer_name;
  const points = req.query.points || req.body.points || req.query.reward_amount || req.body.reward_amount;
  const revenue = req.query.revenue || req.body.revenue || 0;
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const hash = req.query.hash || req.body.hash;

  if (!userId || !offerId || !points || !hash) return res.status(400).send('Missing parameters');

  // Hash validation
  const dataString = `${userId}${offerId}${points}${revenue}${secret}`;
  const computedHash = crypto.createHash('sha256').update(dataString).digest('hex');
  if (computedHash !== hash) return res.status(400).send('Invalid hash');

  try {
    await supabase.from('postbacks').insert([{
      provider,
      user_id: userId,
      offer_id: offerId,
      points,
      revenue,
      ip,
      raw_payload: req.query || req.body
    }]);

    await supabase.from('transactions').insert([{
      user_id: userId,
      offer_id: offerId,
      provider,
      points,
      revenue,
      status: 'approved'
    }]);

    return res.status(200).send('1');
  } catch (err) {
    console.error(err);
    return res.status(500).send('Server error');
  }
}
