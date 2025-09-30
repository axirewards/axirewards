import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import UserStats from '../components/UserStats'
import ProviderIframe from '../components/ProviderIframe'
import { supabase } from '../lib/supabaseClient'

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [offers, setOffers] = useState([])

  useEffect(() => {
    async function fetchData() {
      // Get current user from Supabase auth
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      if (!currentUser) return

      // Fetch user details from users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', currentUser.email)
        .single()
      if (userError) console.error(userError)
      else setUser(userData)

      // Fetch active offers
      const { data: offerData, error: offerError } = await supabase
        .from('offers')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
      if (offerError) console.error(offerError)
      else setOffers(offerData)
    }

    fetchData()
  }, [])

  if (!user) return <Layout><p className="text-center mt-10">Loading...</p></Layout>

  return (
    <Layout>
      <UserStats user={user} />

      <h2 className="text-2xl font-bold text-primary mb-4">Pasiūlymai</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {offers.map((offer) => (
          <ProviderIframe
            key={offer.id}
            url={offer.iframe_url || `https://example-offerwall.com/${offer.id}`}
            height="650px"
          />
        ))}
      </div>
    </Layout>
  )
}
