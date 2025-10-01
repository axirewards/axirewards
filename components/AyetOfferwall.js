import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

/**
 * Ayet Studios Offerwall Component
 * - Implements Ayet offerwall integration per https://docs.ayetstudios.com/v/product-docs/offerwall/web-integrations/web-offerwall
 * - Uses AXI user ID as the externalIdentifier (required for postback rewards)
 * - Uses the latest AXI adSlot: 23280 (update if Ayet dashboard changes)
 * - UI/UX, dimensions, style, branding kept identical for provider consistency
 * - Handles loading, login state, and secure user lookup
 * - 1:1 iframe URL format: https://offerwall.ayet.io/offers?adSlot=23280&externalIdentifier={YOUR_USER_IDENTIFIER}
 */

export default function AyetOfferwall({ adSlot = "23280", height = "700px" }) {
  const [userId, setUserId] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchUser() {
      // Get current logged in user from Supabase Auth
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      if (!currentUser) {
        setLoading(false)
        return
      }
      // Find user's AXI id in DB by email
      const { data: userData, error } = await supabase
        .from('users')
        .select('id')
        .eq('email', currentUser.email)
        .single()
      if (error || !userData?.id) {
        setLoading(false)
        return
      }
      setUserId(userData.id)
      setLoading(false)
    }
    fetchUser()
  }, [])

  // Ayet offerwall URL per docs: https://offerwall.ayet.io/offers?adSlot=23280&externalIdentifier={userId}
  const ayetUrl = userId
    ? `https://offerwall.ayet.io/offers?adSlot=${adSlot}&externalIdentifier=${encodeURIComponent(userId)}`
    : null

  return (
    <div className="w-full flex flex-col items-center justify-center py-2 sm:py-6">
      {/* Ayet branding and info */}
      <div className="flex flex-col items-center justify-center w-full max-w-2xl mb-4 px-2 sm:px-4">
        <div className="flex flex-row items-center justify-center gap-3 w-full mb-2">
          <img
            src="/icons/ayetlogodark.png"
            alt="Ayet Studios"
            className="h-10 w-auto"
            style={{ filter: 'drop-shadow(0 0 8px #60A5FA)' }}
          />
        </div>
        <div className="flex flex-row items-center justify-center w-full">
          <span className="text-xs text-gray-400 sm:text-sm text-center font-semibold mx-2">
            Complete surveys, apps and tasks for premium AXI rewards.
          </span>
          <a
            href="https://www.ayetstudios.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-500 hover:underline font-semibold ml-3"
          >
            What is this?
          </a>
        </div>
      </div>

      {/* Offerwall iframe */}
      <div
        className="w-full max-w-2xl rounded-2xl shadow-2xl border border-accent bg-white flex items-center justify-center"
        style={{
          minHeight: height,
          height: 'auto',
          overflow: 'hidden',
        }}
      >
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
            className="w-full"
            style={{
              minHeight: height,
              height: 'clamp(350px,70vh,850px)',
              borderRadius: '1rem',
              background: '#fff',
              border: 'none',
              zoom: 1,
            }}
            allow="fullscreen"
            sandbox="allow-top-navigation allow-scripts allow-same-origin allow-forms"
          />
        )}
      </div>
      <style jsx>{`
        .bg-accent { background-color: #60A5FA; }
        .text-accent { color: #60A5FA; }
        .border-accent { border-color: #60A5FA; }
        .shadow-2xl { box-shadow: 0 6px 32px 0 #60A5fa22, 0 1.5px 8px 0 #60A5fa33; }
        @media (max-width: 700px) {
          .max-w-2xl { max-width: 98vw !important; }
          .rounded-2xl { border-radius: 1rem !important; }
        }
      `}</style>
    </div>
  )
}
