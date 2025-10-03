import { useEffect, useState } from 'react'
import Layout from '../Layout'
import { supabase } from '../../lib/supabaseClient'
import { pointsToCurrency } from '../../lib/pointsConversion'

export default function PayoutPc({ setGlobalLoading, router }) {
  const [user, setUser] = useState(null)
  const [wallet, setWallet] = useState('')
  const [pointsToRedeem, setPointsToRedeem] = useState('')
  const [payouts, setPayouts] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [walletMsg, setWalletMsg] = useState('')
  const [pointsError, setPointsError] = useState('')

  useEffect(() => {
    if (typeof setGlobalLoading === "function") setGlobalLoading(true)
    async function fetchData() {
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      if (!currentUser) {
        router.push('/index')
        return
      }
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', currentUser.email)
        .single()

      if (userError) {
        console.error(userError)
        setLoading(false)
        if (typeof setGlobalLoading === "function") setGlobalLoading(false)
        return
      }

      setUser(userData)
      setWallet(userData.wallet_address || '')
      if (!userData.wallet_address) {
        setWalletMsg('Save your Polygon wallet in Profile section first.')
      } else {
        setWalletMsg('')
      }

      const { data: payoutData, error: payoutError } = await supabase
        .from('payouts')
        .select('*')
        .eq('user_id', userData.id)
        .order('requested_at', { ascending: false })
        .limit(10)

      if (payoutError) console.error(payoutError)
      else setPayouts(payoutData)

      setLoading(false)
      if (typeof setGlobalLoading === "function") setGlobalLoading(false)
    }

    fetchData()
  }, [router, setGlobalLoading])

  const handleRequestPayout = async () => {
    setPointsError('')
    if (!wallet || !user || !user.wallet_address) {
      setWalletMsg('Save your Polygon wallet in Profile section first.')
      return
    }
    const pointsNum = parseFloat(pointsToRedeem)
    if (
      isNaN(pointsNum) ||
      pointsNum < 10000 ||
      pointsNum > user.points_balance
    ) {
      setPointsError('Invalid points amount')
      return
    }

    setSubmitting(true)
    try {
      const { data: payout, error } = await supabase
        .from('payouts')
        .insert({
          user_id: user.id,
          points_amount: pointsNum,
          crypto_currency: 'USDT',
          wallet_address: wallet,
          status: 'pending'
        })
        .select()
        .single()

      if (error) throw error

      const { data: newBalance, error: rpcError } = await supabase
        .rpc('debit_user_points_for_payout', {
          uid: user.id,
          pts: pointsNum,
          ref_payout: payout.id
        })

      if (rpcError) throw rpcError

      setUser(prev => ({ ...prev, points_balance: newBalance[0].new_balance }))
      setPayouts(prev => [payout, ...prev])
      setPointsToRedeem('')
    } catch (err) {
      console.error(err)
      setPointsError('Error submitting payout request')
    } finally {
      setSubmitting(false)
    }
  }

  // Calculate points to currency for input field and user's balance
  const pointsInputNum = parseFloat(pointsToRedeem) || 0
  const { usd: inputUsd, eur: inputEur } = pointsToCurrency(pointsInputNum)
  const { usd: balanceUsd, eur: balanceEur } = pointsToCurrency(user?.points_balance || 0)

  if (loading)
    return (
      <Layout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <p className="text-center text-lg text-primary animate-pulse">Loading payout...</p>
        </div>
      </Layout>
    )

  return (
    <Layout>
      {/* ZOOM OUT effect for PC */}
      <div className="min-h-[80vh] flex flex-col justify-between" style={{ zoom: 0.93 }}>
        <div className="max-w-5xl mx-auto w-full px-8 py-12 space-y-12 relative">
          <h1 className="text-5xl font-extrabold text-white text-center mb-10 drop-shadow">Payout</h1>
          <div className="bg-card shadow-2xl rounded-3xl p-10 space-y-10 relative">
            {/* Minimum withdrawal badge - INSIDE CONTAINER */}
            <div className="absolute top-5 right-6 z-10">
              <span className="bg-white px-4 py-2 rounded-xl shadow text-sm font-bold text-red-600 border border-red-300 select-none">
                Minimum withdrawal amount = 10000 points
              </span>
            </div>
            <div>
              <p className="text-2xl font-semibold text-accent mb-3">Your Points Balance</p>
              <div className="flex items-baseline gap-5">
                <span className="text-5xl font-extrabold text-white">{user.points_balance || 0}</span>
                <span className="text-lg text-gray-300">points</span>
              </div>
              <div className="mt-2 text-lg text-accent">
                ≈ <span className="font-bold">{balanceUsd} USD</span> / <span className="font-bold">{balanceEur} EUR</span>
              </div>
            </div>
            <div className="flex flex-col gap-5">
              <div>
                <label className="text-lg font-semibold text-white mb-2 block">Your Wallet (POLYGON network payouts)</label>
                <input
                  type="text"
                  value={wallet}
                  readOnly
                  disabled
                  className="w-full border border-gray-700 rounded-xl p-3 bg-black text-white opacity-80 cursor-not-allowed text-lg"
                  placeholder="Save your Polygon wallet in Profile"
                />
                {walletMsg && (
                  <span className="text-red-500 text-sm mt-2 block">{walletMsg}</span>
                )}
              </div>
              <div>
                <label className="text-lg font-semibold text-white mb-2 block">Points to Redeem</label>
                <input
                  type="number"
                  min={10000}
                  max={user.points_balance || 0}
                  placeholder="Enter points amount"
                  className="w-full border border-gray-700 rounded-xl p-3 bg-black text-white text-lg"
                  value={pointsToRedeem}
                  onChange={(e) => setPointsToRedeem(e.target.value)}
                  disabled={!wallet}
                  autoComplete="off"
                />
                {pointsError && (
                  <span className="text-red-500 text-sm mt-2 block">{pointsError}</span>
                )}
                <div className="mt-3 text-md text-accent">
                  {pointsInputNum > 0 && (
                    <>
                      ≈ <span className="font-bold">{inputUsd} USD</span> / <span className="font-bold">{inputEur} EUR</span>
                    </>
                  )}
                </div>
              </div>
              <button
                className={`bg-accent text-white px-8 py-3 rounded-xl font-bold shadow-lg transition hover:bg-blue-700 disabled:opacity-50 mt-2 text-lg`}
                onClick={handleRequestPayout}
                disabled={submitting || !wallet || !user?.points_balance || !pointsToRedeem}
              >
                {submitting ? 'Sending...' : 'Request Payout'}
              </button>
            </div>
          </div>

          <div className="bg-card shadow-2xl rounded-3xl p-10">
            <h2 className="text-2xl font-bold mb-6 text-white">Recent Payout Requests</h2>
            {payouts.length === 0 ? (
              <p className="text-gray-400">No records found.</p>
            ) : (
              <ul className="space-y-3">
                {payouts.map((p) => {
                  const { usd, eur } = pointsToCurrency(p.points_amount)
                  return (
                    <li key={p.id} className="border-b border-gray-900 py-3">
                      <p className="text-white font-semibold text-lg">
                        {p.points_amount} points
                        <span className="text-sm text-accent ml-3">
                          (≈ {usd} USD / {eur} EUR)
                        </span>
                        {" | Crypto: "}{p.crypto_currency}
                      </p>
                      <p className="text-accent text-md">Status: <span className="capitalize">{p.status}</span></p>
                      <p className="text-gray-300 text-md">Wallet: {p.wallet_address}</p>
                      <p className="text-xs text-gray-500">{new Date(p.requested_at).toLocaleString()}</p>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
      <style jsx>{`
        .bg-card { background-color: #0B0B0B; }
      `}</style>
    </Layout>
  )
}
