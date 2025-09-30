import { supabase } from '../../lib/supabase'

export default async function handler(req, res) {
  try {
    switch (req.method) {
      case 'GET':
        const { data: partners, error: getError } = await supabase
          .from('partners')
          .select('*')
        if (getError) throw getError
        return res.status(200).json(partners)

      case 'POST':
        const { code, name, revenue_share, net_terms, callback_secret } = req.body
        if (!code || !name) return res.status(400).json({ error: 'Missing required fields' })
        const { data: newPartner, error: insertError } = await supabase
          .from('partners')
          .insert({ code, name, revenue_share, net_terms, callback_secret })
          .select()
          .single()
        if (insertError) throw insertError
        return res.status(201).json(newPartner)

      default:
        res.setHeader('Allow', ['GET', 'POST'])
        return res.status(405).end(`Method ${req.method} Not Allowed`)
    }
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: err.message })
  }
}
