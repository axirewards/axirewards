import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' })

  const { user_email, points, wallet_address, crypto_currency = 'USDT' } = req.body

  if (!user_email || !points || !wallet_address) {
    return res.status(400).json({ error: 'Missing required parameters' })
  }

  try {
    // Fetch user
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('email', user_email)
      .single()
    if (!user) return res.status(404).json({ error: 'User not found' })

    // Create payout request in pending state
    const { data: payout } = await supabase
      .from('payouts')
      .insert({
        user_id: user.id,
        points_amount: points,
        wallet_address,
        crypto_currency,
        status: 'pending',
        requested_at: new Date().toISOString()
      })
      .select()
      .single()

    // Debit points via RPC
    const { data: newBalance, error: debitError } = await supabase.rpc(
      'debit_user_points_for_payout',
      { uid: user.id, pts: points, ref_payout: payout.id }
    )
    if (debitError) throw debitError

    // Log to admin_logs
    await supabase.from('admin_logs').insert({
      admin_user: 'system',
      action: 'payout_requested',
      details: { user_id: user.id, payout_id: payout.id, points, wallet_address, crypto_currency },
      created_at: new Date().toISOString()
    })

    return res.status(200).json({ status: 'ok', payout_id: payout.id, new_balance: newBalance[0].new_balance })
  } catch (err) {
    console.error('Payout error:', err)
    await supabase.from('admin_logs').insert({
      admin_user: 'system',
      action: 'payout_error',
      details: { error: err.message, payload: req.body },
      created_at: new Date().toISOString()
    })
    return res.status(500).json({ error: 'Internal server error', details: err.message })
  }
}
