import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

// Paprasta admin autentifikacija per env key (production patartina naudoti JWT / session)
const ADMIN_KEY = process.env.ADMIN_KEY

export default async function handler(req, res) {
  const adminKey = req.headers['x-admin-key']
  if (!adminKey || adminKey !== ADMIN_KEY) {
    return res.status(403).json({ error: 'Unauthorized' })
  }

  try {
    if (req.method === 'GET') {
      // Fetch recent completions
      const { data: completions } = await supabase
        .from('completions')
        .select('id,user_id,offer_id,partner_id,credited_points,status,created_at,updated_at')
        .order('created_at', { ascending: false })
        .limit(50)

      // Fetch pending payouts
      const { data: payouts } = await supabase
        .from('payouts')
        .select('*')
        .eq('status', 'pending')
        .order('requested_at', { ascending: false })

      // Fetch users stats
      const { data: users } = await supabase
        .from('users')
        .select('id,email,points_balance,kyc_status,tier,created_at,last_login')
        .order('created_at', { ascending: false })
        .limit(50)

      // Fetch partners
      const { data: partners } = await supabase
        .from('partners')
        .select('*')
        .order('id', { ascending: true })

      return res.status(200).json({ completions, payouts, users, partners })
    }

    if (req.method === 'POST') {
      const { action, payload } = req.body

      if (action === 'approve_payout') {
        const { payout_id, txid } = payload
        if (!payout_id || !txid) return res.status(400).json({ error: 'Missing payout_id or txid' })

        // Update payout status to approved
        const { data: payout, error } = await supabase
          .from('payouts')
          .update({ status: 'approved', txid, processed_at: new Date().toISOString() })
          .eq('id', payout_id)
          .select()
          .single()
        if (error) throw error

        // Log admin action
        await supabase.from('admin_logs').insert({
          admin_user: 'admin',
          action: 'approve_payout',
          details: { payout_id, txid },
          created_at: new Date().toISOString()
        })

        return res.status(200).json({ status: 'ok', payout })
      }

      return res.status(400).json({ error: 'Unknown action' })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (err) {
    console.error('Admin dashboard error:', err)
    return res.status(500).json({ error: 'Internal server error', details: err.message })
  }
}
