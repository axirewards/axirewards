/**
 * CPAlead Offerwall Postback Handler for AXI Rewards
 * - Handles CPAlead offerwall conversions and credits user points in Supabase/Postgres DB.
 * - Taškai visada imami iš virtual_currency (jei yra), arba tiesiog iš payout (jei nėra virtual_currency), be jokių daugiklių!
 * - Idempotency: tikrina pagal user_id + offer_id_partner.
 * - completions.partner_callback_id = completions.offer_id_partner.
 * - Visada kviečia Supabase RPC, kad pridėtų taškus.
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

  // Taškai: virtual_currency, o payout naudoti TIK jei virtual_currency NĖRA, be jokių daugiklių!
  let amountLocal = 0
  if (
    payload.virtual_currency !== undefined &&
    payload.virtual_currency !== null &&
    !isNaN(Number(payload.virtual_currency)) &&
    Number(payload.virtual_currency) > 0
  ) {
    amountLocal = Math.floor(Number(payload.virtual_currency))
  } else if (
    payload.payout !== undefined &&
    payload.payout !== null &&
    !isNaN(Number(payload.payout)) &&
    Number(payload.payout) > 0
  ) {
    amountLocal = Math.floor(Number(payload.payout))
  }
  if (amountLocal <= 0) {
    return res.status(400).json({ error: 'Missing or invalid points (virtual_currency/payout)', payload })
  }

  const ip = payload.ip_address || req.headers['x-forwarded-for'] || req.socket?.remoteAddress || ''
  const country = payload.country_iso || payload.country || payload.geo || 'ALL'
  const status = 'credited'
  const offerTitle = "CPA Lead"
  const offerDescription = "You completed an offer."

  // Validate required params
  if (!userIdRaw || !offerIdPartner) {
    return res.status(400).json({ error: 'Missing required CPAlead parameters', payload })
  }

  // Log raw postback (never throw error on log)
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
    // Idempotency: block only if completions with same user_id + offer_id_partner exists
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

    // Fetch user
    const { data: userData, error: userError } = await supabase
      .from('users').select('id,email').eq('id', userIdRaw)
    const user = Array.isArray(userData) && userData.length > 0 ? userData[0] : null
    if (userError || !user) return res.status(404).json({ error: 'User not found' })

    // Fetch partner (cpalead)
    const { data: partnerData, error: partnerError } = await supabase
      .from('partners').select('id').eq('code', 'cpalead')
    const partner = Array.isArray(partnerData) && partnerData.length > 0 ? partnerData[0] : null
    if (partnerError || !partner) return res.status(404).json({ error: 'Partner not found' })

    // Insert credited completion (credited_points always set correctly)
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

    // Credit points with Supabase RPC after completion is inserted!
    const { data: newBalance, error: rpcError } = await supabase.rpc(
      'increment_user_points',
      { uid: user.id, pts: amountLocal, ref_completion: completion.id }
    )
    if (rpcError) throw rpcError
    const creditedBalance =
      Array.isArray(newBalance) && newBalance.length > 0
        ? newBalance[0]?.new_balance ?? newBalance[0]?.cur_balance ?? null
        : null

    return res.status(200).json({
      status: 'credited',
      credited_points: amountLocal,
      new_balance: creditedBalance,
      completion_id: completion.id,
    })
  } catch (err) {
    console.error('CPAlead postback error:', err)
    return res.status(500).json({ error: 'Internal server error', details: err.message })
  }
}
