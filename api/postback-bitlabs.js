/**
 * BitLabs Postback Endpoint
 * Pilnai pritaikyta tavo DB struktūrai, BitLabs offerwall ir survey integracijai.
 * Endpoint: GET /api/postback-bitlabs
 * Payload loguojamas, taškai pridedami, statusas apdorojamas, saugumas užtikrinamas.
 */

const express = require('express');
const router = express.Router();
const crypto = require('crypto');

// --- Import ORM modelius, priderintus prie tavo DB ---
const { Users, Offers, Partners, Completions, Ledger, PostbackLogs } = require('../models'); // pakeisk kelią jei reikia

// --- CONFIG: Saugumo secret BitLabs postbackams ---
const BITLABS_SECRET = process.env.BITLABS_SECRET || 'TAVO_BITLABS_SECRET';

// --- Main handler ---
router.get('/postback-bitlabs', async (req, res) => {
  try {
    // --- 1. Extract all BitLabs params ---
    const {
      user_id,                  // tavosios users.id
      transaction_id,           // BitLabs unikalus ID
      reward,                   // taškai už survey/offer
      offer_id,                 // BitLabs offer ID (offers.offer_id_partner)
      status,                   // completed, rejected, chargeback, ir t.t.
      currency,                 // points, USD, EUR
      survey_id,                // survey ID jei yra
      offer_type,               // survey arba offer
      country,                  // šalies kodas
      ip,                       // vartotojo IP
      signature,                // BitLabs parašas
      user_agent,               // papildoma: vartotojo agentas
      device_info               // papildoma: įrenginio info
    } = req.query;

    // --- 2. Signature validation ---
    if (BITLABS_SECRET) {
      // BitLabs parašo algoritmas: SHA256(user_id+transaction_id+reward+secret)
      const sigData = `${user_id}${transaction_id}${reward}${BITLABS_SECRET}`;
      const expectedSignature = crypto.createHash('sha256').update(sigData).digest('hex');
      if (signature !== expectedSignature) {
        await PostbackLogs.create({
          user_id: user_id || null,
          transaction_id,
          offer_id_partner: offer_id,
          raw_payload: req.query,
          ip,
          country,
          received_at: new Date()
        });
        return res.status(403).send('Invalid signature');
      }
    }

    // --- 3. Find user ---
    const user = await Users.findOne({ where: { id: user_id } });
    if (!user) return res.status(404).send('User not found');

    // --- 4. Find offer ---
    const offer = await Offers.findOne({ where: { offer_id_partner: offer_id } });

    // --- 5. Create completion record ---
    const completion = await Completions.create({
      user_id: user.id,
      offer_id: offer ? offer.id : null,
      partner_id: offer ? offer.partner_id : null,
      partner_callback_id: transaction_id,
      credited_points: reward,
      status,
      ip,
      user_agent: user_agent || null,
      device_info: device_info ? JSON.stringify(device_info) : null,
      country,
      completion_steps: survey_id || offer_type
        ? JSON.stringify({ survey_id, offer_type })
        : null
    });

    // --- 6. Update user points if status == completed ---
    if (status === 'completed') {
      user.points_balance = Number(user.points_balance) + Number(reward);
      await user.save();

      // --- Ledger entry ---
      await Ledger.create({
        user_id: user.id,
        kind: 'credit',
        amount: reward,
        balance_after: user.points_balance,
        source: 'bitlabs',
        reference_id: completion.id,
        created_at: new Date()
      });
    }

    // --- 7. Log postback ---
    await PostbackLogs.create({
      user_id: user.id,
      transaction_id,
      offer_id_partner: offer_id,
      raw_payload: req.query,
      ip,
      country,
      received_at: new Date()
    });

    // --- 8. Respond 200 OK, ready for BitLabs postback tester ---
    return res.status(200).send('OK');
  } catch (err) {
    console.error('[BitLabs Postback Error]', err);
    return res.status(500).send('Error');
  }
});

module.exports = router;

/**
 * Naudojimas Express app:
 * const postbackBitlabs = require('./api/postback-bitlabs');
 * app.use('/api', postbackBitlabs);
 */
