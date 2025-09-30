import { supabase } from '../../lib/supabase'

export default async function handler(req, res) {
  try {
    switch (req.method) {
      case 'GET':
        const { user_id } = req.query
        let query = supabase.from('user_tracking').select('*').order('created_at', { ascending: false })
        if (user_id) query = query.eq('user_id', user_id)
        const { data: tracking, error } = await query
        if (error) throw error
        return res.status(200).json(tracking)

      case 'POST':
        const { user_id: uid, tracking_token } = req.body
        if (!uid || !tracking_token) return res.status(400).json({ error: 'Missing required fields' })
        const { data: newTrack, error: insertError } = await supabase
          .from('user_tracking')
          .insert({ user_id: uid, tracking_token })
          .select()
          .single()
        if (insertError) throw insertError
        return res.status(201).json(newTrack)

      default:
        res.setHeader('Allow', ['GET', 'POST'])
        return res.status(405).end(`Method ${req.method} Not Allowed`)
    }
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: err.message })
  }
}
