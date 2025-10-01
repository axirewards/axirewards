import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

/**
 * CPX Research Offerwall iframe component.
 * - Uses Supabase users.id as ext_user_id (unique per user, mandatory)
 * - Uses Supabase email and display_name for username/email
 * - Secure hash is calculated as md5(`${userId}-${process.env.NEXT_PUBLIC_CPX_SECURE_HASH}`)
 *   You should set NEXT_PUBLIC_CPX_SECURE_HASH in your .env with your CPX secret hash.
 * - All recommended info (username, email) sent to CPX for best UX and revenue.
 * - Responsive, branded, production-ready UI.
 */
export default function CpxOfferwall({ appId = "29422", height = "900px" }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [secureHash, setSecureHash] = useState("")

  useEffect(() => {
    let isMounted = true
    async function fetchUser() {
      try {
        const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser()
        if (authError || !currentUser) {
          if (isMounted) {
            setError("Please log in to view CPX surveys.")
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

        // Calculate secure hash (md5 of `${userId}-${cpx_secure_hash}`)
        // You need to set NEXT_PUBLIC_CPX_SECURE_HASH in your .env!
        const cpxSecret = process.env.CPX_SECURE_HASH || ""
        if (userData?.id && cpxSecret) {
          // Import crypto only in browser
          import('crypto-js/md5').then(md5 => {
            setSecureHash(md5.default(`${userData.id}-${cpxSecret}`).toString())
          }).catch(() => setSecureHash(""))
        } else {
          setSecureHash("")
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

  // Construct CPX offerwall URL (replace all recommended params)
  const cpxUrl = user
    ? `https://offers.cpx-research.com/index.php?app_id=${appId}` +
      `&ext_user_id=${user.id}` +
      `&secure_hash=${secureHash}` +
      `&username=${encodeURIComponent(user.display_name || "")}` +
      `&email=${encodeURIComponent(user.email || "")}` +
      `&subid_1=&subid_2=`
    : null

  return (
    <div className="w-full flex flex-col items-center justify-center py-4 sm:py-6">
      {/* Branding */}
      <div className="flex flex-col items-center justify-center w-full max-w-2xl mb-3 px-2 sm:px-4">
        <div className="flex flex-row items-center justify-center gap-3 w-full mb-2">
          <img
            src="/icons/cpxlogo.png"
            alt="CPX Research"
            className="h-10 w-auto"
            style={{ filter: 'drop-shadow(0 0 8px #5AF599)' }}
          />
        </div>
        <div className="flex flex-row items-center justify-center w-full">
          <span className="text-xs text-gray-400 sm:text-sm text-center font-semibold mx-2">
            Complete surveys and earn AXI points with CPX Research.
          </span>
          <a
            href="https://cpx-research.com/"
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
            <span className="text-green-400 animate-pulse text-lg font-bold">Loading CPX Research...</span>
          </div>
        ) : error ? (
          <div className="w-full flex items-center justify-center min-h-[400px]">
            <span className="text-red-500 font-bold text-md">{error}</span>
          </div>
        ) : (
          <iframe
            src={cpxUrl}
            title="CPX Research Offerwall"
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
