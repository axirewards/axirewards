import { supabase } from '../../lib/supabase'

export default async function handler(req, res) {
  try {
    switch (req.method) {
      case 'GET':
        const { user_id } = req.query
        let query = supabase.from('ledger').select('*').order('created_at', { ascending: false })
        if (user_id) query = query.eq('user_id', user_id)
        const { data: ledger, error } = await query
        if (error) throw error
        return res.status(200).json(ledger)

      default:
        res.setHeader('Allow', ['GET'])
        return res.status(405).end(`Method ${req.method} Not Allowed`)
    }
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: err.message })
  }
}
