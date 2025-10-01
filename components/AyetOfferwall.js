import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function AyetOfferwall({ adSlot = "23274", height = "700px" }) {
  const [userId, setUserId] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchUser() {
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      if (!currentUser) {
        setLoading(false)
        return
      }
      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('email', currentUser.email)
        .single()
      setUserId(userData?.id)
      setLoading(false)
    }
    fetchUser()
  }, [])

  // Ayet offerwall URL
  const ayetUrl = userId
    ? `https://offerwall.ayet.io/offers?adSlot=${adSlot}&externalIdentifier=${userId}`
    : null

  return (
    <div className="w-full flex flex-col items-center justify-center min-h-[400px] py-8">
      {/* Ayet branding and info */}
      <div className="flex items-center justify-between w-full max-w-2xl mb-6 px-4">
        <div className="flex items-center gap-3">
          <img
            src="https://cdn.ayetstudios.com/img/logo/ayet_logo_full.png"
            alt="Ayet Studios"
            className="h-10 w-auto"
            style={{ filter: 'drop-shadow(0 0 4px #60A5FA)' }}
          />
          <span className="text-lg font-bold text-accent drop-shadow">Offerwall by Ayet Studios</span>
        </div>
        <a
          href="https://www.ayetstudios.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-blue-500 hover:underline font-semibold"
        >
          What is this?
        </a>
      </div>
      {/* Offerwall iframe */}
      <div className="w-full max-w-2xl rounded-2xl shadow-2xl border border-accent bg-white flex items-center justify-center" style={{ minHeight: height }}>
        {loading && (
          <div className="w-full flex items-center justify-center min-h-[400px]">
            <span className="text-primary animate-pulse text-lg font-bold">Loading Ayet Offerwall...</span>
          </div>
        )}
        {!loading && !userId && (
          <div className="w-full flex items-center justify-center min-h-[400px]">
            <span className="text-red-500 font-bold text-md">Please log in to view offers.</span>
          </div>
        )}
        {!loading && userId && (
          <iframe
            src={ayetUrl}
            title="Ayet Studios Offerwall"
            className="w-full h-[700px] rounded-2xl border-0"
            style={{ minHeight: height, background: '#fff' }}
            allow="fullscreen"
          />
        )}
      </div>
      <style jsx>{`
        .bg-accent { background-color: #60A5FA; }
        .text-accent { color: #60A5FA; }
        .border-accent { border-color: #60A5FA; }
        .shadow-2xl { box-shadow: 0 6px 32px 0 #60A5fa22, 0 1.5px 8px 0 #60A5fa33; }
      `}</style>
    </div>
  )
}
