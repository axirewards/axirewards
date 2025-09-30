import '../styles/globals.css'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabaseClient'

// UserType type replacement
// Comment: we use plain JS objects instead of TypeScript types

function getEnvAdminEmail() {
  return (
    process.env.NEXT_PUBLIC_ADMIN_EMAIL ||
    process.env.ADMIN_EMAIL ||
    ''
  ).toLowerCase()
}

function isAdmin(user) {
  if (!user || !user.email) return false
  const envEmail = getEnvAdminEmail()
  return (
    (user.is_admin === true) ||
    (user.email?.toLowerCase() === envEmail)
  )
}

function isBanned(user) {
  return user?.is_banned === true
}

// Modal component for banned users
function BannedModal({ reason, date, onClose }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-md w-full p-8 border border-red-500 animate-fade-in">
        <div className="flex flex-col items-center">
          <svg
            className="w-16 h-16 text-red-600 mb-4"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
            <line x1="8" y1="8" x2="16" y2="16" stroke="currentColor" strokeWidth="2" />
            <line x1="16" y1="8" x2="8" y2="16" stroke="currentColor" strokeWidth="2" />
          </svg>
          <h1 className="text-2xl font-bold text-red-600 mb-2">YOU ARE BANNED</h1>
          <p className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
            Reason: <span className="text-red-500">{reason}</span>
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Ban Date: <span className="font-medium">{date}</span>
          </p>
          <p className="text-xs text-gray-400 mb-6 text-center">
            Contact our support if you think this is a mistake and you did not violate our guidelines.
          </p>
          <button
            className="bg-red-600 text-white px-6 py-2 rounded-lg font-bold shadow hover:bg-red-700 transition"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

function MyApp({ Component, pageProps }) {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [isAdminUser, setIsAdminUser] = useState(false)
  const [isBannedUser, setIsBannedUser] = useState(false)
  const [bannedInfo, setBannedInfo] = useState(null)
  const [showBannedModal, setShowBannedModal] = useState(false)

  useEffect(() => {
    let ignore = false
    async function checkUserStatus() {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) {
        setUser(null)
        setIsAdminUser(false)
        setIsBannedUser(false)
        setBannedInfo(null)
        setShowBannedModal(false)
        return
      }

      const { data: dbUser, error } = await supabase
        .from('users')
        .select('id,email,is_admin,is_banned,banned_reason,banned_at')
        .eq('email', authUser.email)
        .single()

      if (error || !dbUser) {
        setUser(null)
        setIsAdminUser(false)
        setIsBannedUser(false)
        setBannedInfo(null)
        setShowBannedModal(false)
        return
      }

      setUser(dbUser)

      // Admin check
      const isAdminNow = isAdmin(dbUser)
      setIsAdminUser(isAdminNow)

      // Banned check
      if (isBanned(dbUser)) {
        setIsBannedUser(true)
        setBannedInfo({
          reason: dbUser.banned_reason || 'No reason provided',
          date: dbUser.banned_at ? new Date(dbUser.banned_at).toLocaleString() : 'Unknown date',
        })
        setShowBannedModal(true)
        // Logout and reroute on banned
        await supabase.auth.signOut()
        router.replace({
          pathname: '/',
          query: { banned: 'true', reason: dbUser.banned_reason || '', date: dbUser.banned_at || '' },
        })
      } else {
        setIsBannedUser(false)
        setBannedInfo(null)
        setShowBannedModal(false)
      }
    }

    checkUserStatus()
    return () => { ignore = true }
  }, [router])

  // Show banned modal if redirected
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      if (urlParams.get('banned') === 'true') {
        const reason = urlParams.get('reason') || 'No reason provided'
        const date = urlParams.get('date')
        setBannedInfo({
          reason: reason,
          date: date ? new Date(date).toLocaleString() : 'Unknown date',
        })
        setShowBannedModal(true)
      }
    }
  }, [])

  // Modal close handler
  function handleModalClose() {
    setShowBannedModal(false)
    // Optionally redirect to support page or home
    router.replace('/')
  }

  return (
    <>
      {showBannedModal && bannedInfo && (
        <BannedModal
          reason={bannedInfo.reason || 'No reason provided'}
          date={bannedInfo.date || 'Unknown date'}
          onClose={handleModalClose}
        />
      )}
      <Component
        {...pageProps}
        supabase={supabase}
        user={user}
        isAdmin={isAdminUser}
        isBanned={isBannedUser}
        bannedInfo={bannedInfo}
      />
    </>
  )
}

export default MyApp
