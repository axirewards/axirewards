import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Layout from '../components/Layout'
import UserStats from '../components/UserStats'
import { supabase } from '../lib/supabaseClient'
import DeleteAccountButton from '../components/DeleteAccountButton'

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

      // Fetch last 10 completions for this user, from completions table
      if (userData) {
        const { data: completionData, error: completionError } = await supabase
          .from('completions')
          .select('*')
          .eq('user_id', userData.id)
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

  return (
    <Layout>
      <div className="min-h-[80vh] flex flex-col justify-between">
        <div className="max-w-4xl mx-auto w-full p-6 space-y-8">
          <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
            <h1 className="text-3xl font-extrabold text-primary mb-3 md:mb-0">Profile</h1>
            <button
              onClick={handleLogout}
              className="rounded-lg bg-card px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-900 shadow-lg border border-gray-800"
            >
              Logout
            </button>
          </div>

          <UserStats user={user} />

          <div className="bg-card shadow-md rounded-2xl p-6 mb-2">
            <h2 className="text-xl font-semibold mb-2 text-primary">Crypto Wallet <span className="font-normal text-sm text-gray-400">(POLYGON Wallet)</span></h2>
            <div className="flex flex-col md:flex-row gap-2 items-start md:items-center">
              <input
                type="text"
                value={wallet}
                onChange={(e) => setWallet(e.target.value)}
                className="flex-1 border border-gray-700 rounded-lg p-2 bg-black text-white placeholder-gray-400"
                placeholder="Enter your Polygon wallet address"
                autoComplete="off"
              />
              <button
                onClick={handleWalletUpdate}
                disabled={saving}
                className="bg-primary text-white px-5 py-2 rounded-lg font-semibold shadow transition hover:bg-blue-700 disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
            <p className="mt-2 text-xs text-red-500 font-bold">
              * You must enter a Polygon crypto wallet address (starts with 0x...)
            </p>
            {walletError && <p className="mt-2 text-xs text-red-500">{walletError}</p>}
            {walletSuccess && <p className="mt-2 text-xs text-green-500">{walletSuccess}</p>}
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
          
          {/* Account deletion button */}
          <div className="flex justify-end">
            <DeleteAccountButton email={user.email} />
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
