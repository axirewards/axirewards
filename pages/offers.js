import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import ProviderIframe from '../components/ProviderIFrame'
import { supabase } from '../lib/supabaseClient'

export default function Offers() {
  const [offers, setOffers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchOffers() {
      try {
        // Gauti tik aktyvius offerius
        const { data: offerData, error } = await supabase
          .from('offers')
          .select('*, partners(code, name)')
          .eq('status', 'active')
          .order('created_at', { ascending: false })

        if (error) throw error
        setOffers(offerData)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchOffers()
  }, [])

  if (loading) return <Layout><p className="text-center mt-10">Loading offers...</p></Layout>

  return (
    <Layout>
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <h1 className="text-3xl font-bold text-primary">Visi pasiūlymai</h1>
        {offers.length === 0 ? (
          <p>Nėra aktyvių pasiūlymų šiuo metu</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {offers.map((offer) => (
              <div key={offer.id} className="bg-white dark:bg-gray-800 shadow-md rounded p-4">
                <h2 className="text-xl font-semibold text-primary mb-2">{offer.title}</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-2">{offer.description}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  Taškai: {offer.payout_points} | Partneris: {offer.partners?.name || offer.partner_id}
                </p>
                <ProviderIframe
                  url={offer.iframe_url || `https://example-offerwall.com/${offer.id}`}
                  height="550px"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}
