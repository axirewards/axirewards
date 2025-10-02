import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Layout from '../components/Layout'
import { supabase } from '../lib/supabaseClient'
import DeleteAccountButton from '../components/DeleteAccountButton'

const TIER_INFO = [
  { level: 1, name: "Bronze", color: "#A66B3B", bg: "linear-gradient(135deg,#232e40 0%,#A66B3B 120%)" },
  { level: 2, name: "Silver", color: "#bfcbdc", bg: "linear-gradient(135deg,#232e40 0%,#bfcbdc 120%)" },
  { level: 3, name: "Gold", color: "#FFD700", bg: "linear-gradient(135deg,#232e40 0%,#FFD700 120%)" },
  { level: 4, name: "Platinum", color: "#7b6cfb", bg: "linear-gradient(135deg,#232e40 0%,#7b6cfb 120%)" },
  { level: 5, name: "Diamond", color: "#8fdafd", bg: "linear-gradient(135deg,#232e40 0%,#8fdafd 120%)" },
]
const thresholds = [0, 10000, 50000, 150000, 500000, 9999999];

function getUserTier(levelpoints) {
  for (let i = thresholds.length - 1; i >= 0; i--) {
    if (levelpoints >= thresholds[i]) {
      return TIER_INFO[i] || TIER_INFO[0];
    }
  }
  return TIER_INFO[0];
}

export default function Profile({ setGlobalLoading }) {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [wallet, setWallet] = useState('')
  const [completions, setCompletions] = useState([])
  const [saving, setSaving] = useState(false)
  const [walletError, setWalletError] = useState('')
  const [walletSuccess, setWalletSuccess] = useState('')

  useEffect(() => {
    if (typeof setGlobalLoading === "function") setGlobalLoading(true)
    async function fetchUser() {
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      if (!currentUser) {
        if (typeof setGlobalLoading === "function") setGlobalLoading(false)
        return
      }

      // Fetch user details
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', currentUser.email)
        .single()
      if (userError) {
        console.error(userError)
      } else {
        setUser(userData)
        setWallet(userData.wallet_address || '')
      }

      // Fetch last 10 completions for this user using completions.user_email === users.email
      if (userData) {
        const { data: completionData, error: completionError } = await supabase
          .from('completions')
          .select('*')
          .eq('user_email', userData.email)
          .order('created_at', { ascending: false })
          .limit(10)
        if (completionError) console.error(completionError)
        else setCompletions(completionData)
      }

      if (typeof setGlobalLoading === "function") setGlobalLoading(false)
    }
    fetchUser()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleLogout = async () => {
    if (typeof setGlobalLoading === "function") setGlobalLoading(true)
    await supabase.auth.signOut()
    router.push("/")
    if (typeof setGlobalLoading === "function") setGlobalLoading(false)
  }

  const handleWalletUpdate = async () => {
    setWalletError('')
    setWalletSuccess('')
    if (!wallet || !/^0x[a-fA-F0-9]{40}$/.test(wallet)) {
      setWalletError('Wallet must be a valid Polygon (POLYGON Wallet) address starting with 0x...')
      return
    }
    setSaving(true)
    const { data, error } = await supabase
      .from('users')
      .update({ wallet_address: wallet })
      .eq('id', user.id)
      .select()
      .single()
    setSaving(false)
    if (error) {
      setWalletError('Failed to save wallet. Please try again.')
      console.error(error)
    } else {
      setUser(data)
      setWalletSuccess('Wallet saved successfully!')
    }
  }

  if (!user) return (
    <Layout>
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-center text-lg text-primary animate-pulse">Loading profile...</p>
      </div>
    </Layout>
  )

  // Calculate user tier and level
  const tier = getUserTier(user.levelpoints || 0)

  return (
    <Layout>
      <div className="min-h-[80vh] flex flex-col justify-between">
        <div className="max-w-4xl mx-auto w-full p-6 space-y-8">
          <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
            <h1 className="text-3xl font-extrabold text-primary mb-3 md:mb-0">Profile</h1>
            <div className="flex gap-3">
              <DeleteAccountButton email={user.email} />
              <button
                onClick={handleLogout}
                className="rounded-lg bg-card px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-900 shadow-lg border border-gray-800"
              >
                Logout
              </button>
            </div>
          </div>

          {/* User stats section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-card rounded-xl shadow p-5 flex flex-col items-center justify-center">
              <span className="text-xs uppercase font-bold text-gray-500 mb-2">Level</span>
              <span
                className="font-bold text-lg"
                style={{
                  color: tier.color,
                  background: tier.bg,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent"
                }}
              >
                {tier.name} (Lvl {tier.level})
              </span>
              <span className="text-xs text-gray-400 mt-1">Points: {user.levelpoints || 0}</span>
            </div>
            <div className="bg-card rounded-xl shadow p-5 flex flex-col items-center justify-center">
              <span className="text-xs uppercase font-bold text-gray-500 mb-2">Completed Offers</span>
              <span className="font-bold text-lg text-accent">{user.total_completions || 0}</span>
            </div>
            <div className="bg-card rounded-xl shadow p-5 flex flex-col items-center justify-center">
              <span className="text-xs uppercase font-bold text-gray-500 mb-2">Wallet</span>
              <span className="font-bold text-lg text-white break-all">{user.wallet_address ? user.wallet_address : "Not set"}</span>
            </div>
          </div>

          <div className="bg-card shadow-md rounded-2xl p-6 mb-4">
            <h2 className="text-xl font-semibold mb-2 text-primary">Recent Completed Offers</h2>
            {completions.length === 0 ? (
              <p className="text-gray-400">No records found.</p>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="text-accent font-bold border-b border-gray-800">
                    <th className="py-2">Offer ID</th>
                    <th className="py-2">Points</th>
                    <th className="py-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {completions.map((c) => (
                    <tr key={c.id} className="border-b border-gray-800">
                      <td className="py-2 text-white">{c.partner_callback_id}</td>
                      <td className="py-2 text-white font-bold">{parseInt(c.credited_points, 10) || 0}</td>
                      <td className="py-2 text-gray-400">{new Date(c.created_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
      {/* Footer always at bottom */}
      <style jsx>{`
        .bg-card {
          background-color: #0B0B0B;
        }
        .text-accent {
          color: #60A5FA;
        }
      `}</style>
    </Layout>
  )
}
