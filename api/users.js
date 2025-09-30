import { supabase } from '../../lib/supabase'

export default async function handler(req, res) {
  try {
    switch (req.method) {
      case 'GET':
        const { data: users, error: getError } = await supabase
          .from('users')
          .select('*')
        if (getError) throw getError
        return res.status(200).json(users)

      case 'POST':
        const { email, password_hash, wallet_address } = req.body
        if (!email || !password_hash) {
          return res.status(400).json({ error: 'Missing required fields' })
        }
        const { data: newUser, error: insertError } = await supabase
          .from('users')
          .insert({ email, password_hash, wallet_address })
          .select()
          .single()
        if (insertError) throw insertError
        return res.status(201).json(newUser)

      default:
        res.setHeader('Allow', ['GET', 'POST'])
        return res.status(405).end(`Method ${req.method} Not Allowed`)
    }
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: err.message })
  }
}
