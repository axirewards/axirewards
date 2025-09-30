import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

export default async function handler(req, res) {
  const { id } = req.query

  if (!id) return res.status(400).json({ error: 'User ID is required' })

  try {
    if (req.method === 'GET') {
      const { data: user } = await supabase
        .from('users')
        .select('id,email,wallet_address,kyc_status,tier,points_balance,created_at,last_login')
        .eq('id', id)
        .single()
      if (!user) return res.status(404).json({ error: 'User not found' })
      return res.status(200).json({ user })
    }

    if (req.method === 'PUT') {
      const updates = req.body
      const { data: updatedUser } = await supabase
        .from('users')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      return res.status(200).json({ user: updatedUser })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (err) {
    console.error('User API error:', err)
    return res.status(500).json({ error: 'Internal server error', details: err.message })
  }
}
