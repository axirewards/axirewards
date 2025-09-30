import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import ProviderIframe from '../components/ProviderIFrame'
import { supabase } from '../lib/supabaseClient'

export default function Offers({ setGlobalLoading }) {
  const [offers, setOffers] = useState([])
  const [loading, setLoading] = useState(true)
  const [providers, setProviders] = useState([])
  const [selectedProvider, setSelectedProvider] = useState('all')

  // Fetch providers on mount
  useEffect(() => {
    async function fetchProviders() {
      const { data, error } = await supabase
        .from('partners')
        .select('id, code, name')
        .order('name', { ascending: true })
      if (!error) setProviders(data || [])
    }
    fetchProviders()
  }, [])

  // Fetch offers
  useEffect(() => {
    if (typeof setGlobalLoading === "function") setGlobalLoading(true)
    async function fetchOffers() {
      try {
        let query = supabase
          .from('offers')
          .select('*, partners(code, name)')
          .eq('status', 'active')
          .order('created_at', { ascending: false })

        if (selectedProvider !== 'all') {
          query = query.eq('partner_id', selectedProvider)
        }

        const { data: offerData, error } = await query
        if (error) throw error
        setOffers(offerData)
      } catch (err) {
        console.error('Error loading offers:', err)
        setOffers([])
      } finally {
        setLoading(false)
        if (typeof setGlobalLoading === "function") setGlobalLoading(false)
      }
    }
    fetchOffers()
  }, [selectedProvider])

  // UI constants
  const cardClass = "bg-card rounded-2xl shadow-lg flex flex-col items-center border border-gray-900 animate-fade-in"
  const gridClass = "flex gap-6 pb-2 min-w-[300px] snap-x snap-mandatory overflow-x-auto scrollbar-thin scrollbar-thumb-accent scrollbar-track-card"

  if (loading)
    return (
      <Layout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <p className="text-center text-lg text-primary animate-pulse">Loading offers...</p>
        </div>
      </Layout>
    )

  return (
    <Layout>
      <div className="min-h-[80vh] flex flex-col justify-between">
        <div className="max-w-7xl mx-auto w-full px-2 sm:px-4 md:px-6 lg:px-8 py-8 space-y-8">
          <h1 className="text-3xl font-extrabold text-white text-center mb-8 drop-shadow">Offers</h1>
          {/* Provider Filter Bar */}
          <div className="flex flex-row items-center justify-center gap-4 mb-8">
            <label className="text-accent font-semibold text-sm">Filter by Provider:</label>
            <select
              className="bg-card border border-gray-800 rounded-lg px-4 py-2 text-white accent-accent outline-none font-semibold shadow"
              value={selectedProvider}
              onChange={e => setSelectedProvider(e.target.value)}
            >
              <option value="all">All Providers</option>
              {providers.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.code})
                </option>
              ))}
            </select>
          </div>
          {offers.length === 0 ? (
            <div className="flex flex-col items-center justify-center">
              <p className="text-gray-400 text-lg">No active offers right now. Check back later!</p>
            </div>
          ) : (
            <div className={gridClass} tabIndex={0} style={{ WebkitOverflowScrolling: "touch" }}>
              {offers.map((offer, idx) => (
                <div
                  key={offer.id}
                  className={
                    "snap-start min-w-[320px] max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl " +
                    cardClass + " p-0"
                  }
                >
                  <div className="p-5 border-b border-gray-800 w-full">
                    <h2 className="text-xl font-bold text-accent mb-2">{offer.title}</h2>
                    <p className="text-base text-white/90 mb-2">{offer.description}</p>
                    <div className="flex flex-row gap-2 items-center mb-1">
                      <span className="text-sm text-accent font-semibold">
                        Points: <span className="font-bold">{offer.payout_points}</span>
                      </span>
                      <span className="text-xs text-gray-400 px-2 py-0.5 rounded bg-black/30">
                        Provider: {offer.partners?.name || offer.partner_id}
                      </span>
                    </div>
                  </div>
                  <ProviderIframe
                    url={offer.iframe_url || `https://example-offerwall.com/${offer.id}`}
                    height="400px"
                    className="rounded-b-2xl bg-black"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <style jsx>{`
        .bg-card { background-color: #0B0B0B; }
        .scrollbar-thin { scrollbar-width: thin; }
        .scrollbar-thumb-accent { scrollbar-color: #60A5FA #0B0B0B; }
        .scrollbar-track-card::-webkit-scrollbar { background: #0B0B0B; }
        .scrollbar-thumb-accent::-webkit-scrollbar-thumb { background: #60A5FA; }
        .scrollbar-thin::-webkit-scrollbar { height: 8px; }
        @media (max-width: 640px) {
          .snap-x { scroll-snap-type: x mandatory; }
          .snap-start { scroll-snap-align: start; }
        }
      `}</style>
    </Layout>
  )
}
