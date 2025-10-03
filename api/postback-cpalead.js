/**
 * CPAlead Offerwall Postback Handler for AXI Rewards
 * - Handles CPAlead offerwall conversions and credits user points in Supabase/Postgres DB.
 * - Maps CPAlead macros to parameters:
 *   subid           → userId,
 *   virtual_currency → points,
 *   campaign_id     → offer_id_partner (and partner_callback_id, both identical),
 *   country_iso     → country.
 * - Always logs full raw payload for auditing.
 * - Title always "CPA Lead", description always "You completed an offer."
 * - Compatible with AXI Rewards schema.
 * - Idempotency: checks completions by user_id + offer_id_partner (allows new unique offers per user, prevents duplicate for same user).
 * - completions.partner_callback_id = completions.offer_id_partner (always identical).
 * - **NEKVIEČIA RPC, taškai pridedami per triggerį!**
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

export default async function handler(req, res) {
  let payload = {}
  try {
    if (req.method === 'POST') {
      if (typeof req.body === 'string') {
        try { payload = JSON.parse(req.body) } catch (e) { payload = req.body }
      } else {
        payload = req.body
      }
    } else if (req.method === 'GET') {
      payload = req.query
    } else {
      return res.status(405).send('Method Not Allowed')
    }
  } catch (e) {
    return res.status(400).json({ error: 'Invalid payload format' })
  }

  // CPAlead macros → parameters
  const userIdRaw = parseInt(payload.subid)
  const offerIdPartner = (payload.campaign_id || payload.offer_id || '').toString()
  const transactionId = offerIdPartner
  let amountLocal = 0
  if (payload.virtual_currency !== undefined && payload.virtual_currency !== null && !isNaN(Number(payload.virtual_currency))) {
    amountLocal = Math.floor(Number(payload.virtual_currency))
  } else if (payload.payout !== undefined && !isNaN(Number(payload.payout))) {
    amountLocal = Math.floor(Number(payload.payout) * 700)
  }
  if (amountLocal <= 0) {
    return res.status(400).json({ error: 'Missing or invalid points (virtual_currency/payout)', payload })
  }

  const ip = payload.ip_address || req.headers['x-forwarded-for'] || req.socket?.remoteAddress || ''
  const country = payload.country_iso || payload.country || payload.geo || 'ALL'
  const status = 'credited'
  const offerTitle = "CPA Lead"
  const offerDescription = "You completed an offer."

  if (!userIdRaw || !offerIdPartner) {
    return res.status(400).json({ error: 'Missing required CPAlead parameters', payload })
  }

  try {
    await supabase.from('postback_logs').insert([{
      user_id: userIdRaw,
      transaction_id: transactionId,
      offer_id_partner: offerIdPartner,
      raw_payload: payload,
      ip,
      country,
      received_at: new Date().toISOString(),
    }])
  } catch (e) {
    console.error('Failed to log postback:', e)
  }

  try {
    const { data: existingCompletions, error: checkError } = await supabase
      .from('completions')
      .select('id')
      .eq('user_id', userIdRaw)
      .eq('offer_id_partner', offerIdPartner)

    if (checkError) {
      console.error('Completions check error:', checkError)
      return res.status(500).json({ error: 'Internal server error', details: checkError.message })
    }
    if (Array.isArray(existingCompletions) && existingCompletions.length > 0) {
      return res.status(200).json({ status: 'already_processed', completion_id: existingCompletions[0].id })
    }

    const { data: userData, error: userError } = await supabase
      .from('users').select('id,email').eq('id', userIdRaw)
    const user = Array.isArray(userData) && userData.length > 0 ? userData[0] : null
    if (userError || !user) return res.status(404).json({ error: 'User not found' })

    const { data: partnerData, error: partnerError } = await supabase
      .from('partners').select('id').eq('code', 'cpalead')
    const partner = Array.isArray(partnerData) && partnerData.length > 0 ? partnerData[0] : null
    if (partnerError || !partner) return res.status(404).json({ error: 'Partner not found' })

    const { data: completionInsertData, error: completionError } = await supabase
      .from('completions')
      .insert({
        user_id: user.id,
        user_email: user.email,
        offer_id_partner: offerIdPartner,
        partner_id: partner.id,
        partner_callback_id: transactionId,
        credited_points: amountLocal,
        status: status,
        ip: ip,
        device_info: {},
        country: country,
        title: offerTitle,
        description: offerDescription,
      })
      .select()
    if (completionError) throw completionError
    const completion = Array.isArray(completionInsertData) && completionInsertData.length > 0
      ? completionInsertData[0]
      : completionInsertData

    // **NEKVIEČIA increment_user_points** – tai padaro triggeris!
    // const { data: newBalance, error: rpcError } = await supabase.rpc(
    //   'increment_user_points',
    //   { uid: user.id, pts: amountLocal, ref_completion: completion.id }
    // )
    // if (rpcError) throw rpcError

    return res.status(200).json({
      status: 'credited',
      credited_points: amountLocal,
      completion_id: completion.id,
    })
  } catch (err) {
    console.error('CPAlead postback error:', err)
    return res.status(500).json({ error: 'Internal server error', details: err.message })
  }
}
