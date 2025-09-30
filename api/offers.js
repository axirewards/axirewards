import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' })

  const { country = 'ALL', device = 'all', status = 'active' } = req.query

  try {
    const { data: offers } = await supabase
      .from('offers')
      .select('*')
      .eq('status', status)
      .in('country', [country, 'ALL'])
      .in('device_type', [device, 'all'])
    return res.status(200).json({ offers })
  } catch (err) {
    console.error('Offers API error:', err)
    return res.status(500).json({ error: 'Internal server error', details: err.message })
  }
}
