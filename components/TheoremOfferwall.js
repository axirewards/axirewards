import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

/**
 * TheoremReach Offerwall Component
 * - 100% per official docs: https://theoremreach.com/docs/web
 * - Uses AXI user ID as "user_id" (external identifier).
 * - iframe src: https://theoremreach.com/surveys/24198/{user_id}
 * - All UI/UX, styling, and size kept identical for provider consistency.
 */

export default function TheoremOfferwall({ appId = "24198", height = "700px" }) {
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

  // TheoremReach offerwall URL: https://theoremreach.com/surveys/{appId}/{userId}
  const theoremUrl = userId
    ? `https://theoremreach.com/surveys/${appId}/${encodeURIComponent(userId)}`
    : null

  return (
    <div className="w-full flex flex-col items-center justify-center py-2 sm:py-6">
      {/* TheoremReach branding and info */}
      <div className="flex flex-col items-center justify-center w-full max-w-2xl mb-4 px-2 sm:px-4">
        <div className="flex flex-row items-center justify-center gap-3 w-full mb-2">
          <img
            src="/icons/theoremreachlogo.png"
            alt="TheoremReach"
            className="h-10 w-auto"
            style={{ filter: 'drop-shadow(0 0 8px #60A5FA)' }}
          />
        </div>
        <div className="flex flex-row items-center justify-center w-full">
          <span className="text-xs text-gray-400 sm:text-sm text-center font-semibold mx-2">
            Complete surveys and earn premium AXI rewards.
          </span>
          <a
            href="https://theoremreach.com/"
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
            <span className="text-primary animate-pulse text-lg font-bold">Loading TheoremReach Offerwall...</span>
          </div>
        )}
        {!loading && !userId && (
          <div className="w-full flex items-center justify-center min-h-[400px]">
            <span className="text-red-500 font-bold text-md">Please log in to view offers.</span>
          </div>
        )}
        {!loading && userId && (
          <iframe
            src={theoremUrl}
            title="TheoremReach Offerwall"
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
