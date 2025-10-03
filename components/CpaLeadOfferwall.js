import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

/**
 * CPAlead Offerwall iframe component.
 * - Uses Supabase users.id as ext_user_id (if needed for tracking, future postback)
 * - Responsive, branded, production-ready UI matching AXI Rewards standard.
 */
export default function CpaLeadOfferwall({ height = "700px" }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let isMounted = true
    async function fetchUser() {
      try {
        const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser()
        if (authError || !currentUser) {
          if (isMounted) {
            setError("Please log in to view CPAlead offers.")
            setLoading(false)
          }
          return
        }
        // Get users table info
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id,email,display_name')
          .eq('email', currentUser.email)
          .single()
        if (userError || !userData?.id) {
          if (isMounted) {
            setError("User profile not found. Contact support.")
            setLoading(false)
          }
          return
        }
        if (isMounted) {
          setUser(userData)
          setLoading(false)
        }
      } catch (err) {
        if (isMounted) {
          setError("Unexpected error loading user. Try again.")
          setLoading(false)
        }
      }
    }
    fetchUser()
    return () => { isMounted = false }
  }, [])

  // CPAlead offerwall iframe URL (from your team, can be enhanced in future for tracking)
  const cpaLeadUrl = "https://www.mobtrk.link/list/Zkc2uVm"

  return (
    <div className="w-full flex flex-col items-center justify-center py-4 sm:py-6">
      {/* Branding */}
      <div className="flex flex-col items-center justify-center w-full max-w-2xl mb-3 px-2 sm:px-4">
        <div className="flex flex-row items-center justify-center gap-3 w-full mb-2">
          <img
            src="/icons/cpalead.png"
            alt="CPAlead"
            className="h-10 w-auto"
            style={{ filter: 'drop-shadow(0 0 8px #5AF599)' }}
          />
        </div>
        <div className="flex flex-row items-center justify-center w-full">
          <span className="text-xs text-gray-400 sm:text-sm text-center font-semibold mx-2">
            Complete offers and earn AXI points with CPAlead.
          </span>
          <a
            href="https://www.cpalead.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-green-500 hover:underline font-semibold ml-3"
          >
            What is this?
          </a>
        </div>
      </div>

      {/* Offerwall iframe */}
      <div
        className="w-full max-w-2xl rounded-2xl shadow-2xl border border-green-400 bg-white flex items-center justify-center"
        style={{
          minHeight: height,
          height: 'auto',
          overflow: 'hidden',
        }}
      >
        {loading ? (
          <div className="w-full flex items-center justify-center min-h-[400px]">
            <span className="text-green-400 animate-pulse text-lg font-bold">Loading CPAlead...</span>
          </div>
        ) : error ? (
          <div className="w-full flex items-center justify-center min-h-[400px]">
            <span className="text-red-500 font-bold text-md">{error}</span>
          </div>
        ) : (
          <iframe
            src={cpaLeadUrl}
            title="CPAlead Offerwall"
            width="100%"
            frameBorder="0"
            style={{
              minHeight: height,
              height: 'clamp(350px,70vh,1200px)',
              borderRadius: '1rem',
              background: '#fff',
              border: 'none',
              zoom: 1,
            }}
            allow="fullscreen"
            sandbox="allow-popups allow-same-origin allow-scripts allow-top-navigation-by-user-activation allow-popups-to-escape-sandbox"
          />
        )}
      </div>
      <style jsx>{`
        .shadow-2xl { box-shadow: 0 6px 32px 0 #5AF59922, 0 1.5px 8px 0 #5AF59933; }
        @media (max-width: 700px) {
          .max-w-2xl { max-width: 98vw !important; }
          .rounded-2xl { border-radius: 1rem !important; }
        }
      `}</style>
    </div>
  )
}
