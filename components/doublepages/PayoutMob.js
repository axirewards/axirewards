import { useEffect, useState } from 'react'
import Layout from '../Layout'
import { supabase } from '../../lib/supabaseClient'
import { pointsToCurrency } from '../../lib/pointsConversion'

export default function PayoutMob({ setGlobalLoading, router }) {
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
      <div className="min-h-[80vh] flex flex-col justify-between bg-card">
        <div className="max-w-md mx-auto w-full px-2 py-7 space-y-7 relative">
          <h1 className="text-2xl font-extrabold text-white text-center mb-6 drop-shadow">Payout</h1>
          <div className="bg-card shadow-xl rounded-2xl p-4 space-y-6 relative">
            {/* Minimum withdrawal badge - INSIDE CONTAINER */}
            <div className="absolute top-2 right-2 z-10">
              <span className="bg-white px-2 py-1 rounded-lg shadow text-xs font-bold text-red-600 border border-red-300 select-none">
                Min: 10000 points
              </span>
            </div>
            <div>
              <p className="text-base font-semibold text-accent mb-2">Your Points</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-extrabold text-white">{user.points_balance || 0}</span>
                <span className="text-sm text-gray-300">points</span>
              </div>
              <div className="mt-1 text-xs text-accent">
                ≈ <span className="font-bold">{balanceUsd} USD</span> / <span className="font-bold">{balanceEur} EUR</span>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <div>
                <label className="text-xs font-semibold text-white mb-1 block">Your Wallet (POLYGON)</label>
                <input
                  type="text"
                  value={wallet}
                  readOnly
                  disabled
                  className="w-full border border-gray-700 rounded-lg p-2 bg-black text-white opacity-80 cursor-not-allowed text-xs"
                  placeholder="Save wallet in Profile"
                />
                {walletMsg && (
                  <span className="text-red-500 text-xs mt-1 block">{walletMsg}</span>
                )}
              </div>
              <div>
                <label className="text-xs font-semibold text-white mb-1 block">Points to Redeem</label>
                <input
                  type="number"
                  min={10000}
                  max={user.points_balance || 0}
                  placeholder="Enter points amount"
                  className="w-full border border-gray-700 rounded-lg p-2 bg-black text-white text-xs"
                  value={pointsToRedeem}
                  onChange={(e) => setPointsToRedeem(e.target.value)}
                  disabled={!wallet}
                  autoComplete="off"
                />
                {pointsError && (
                  <span className="text-red-500 text-xs mt-1 block">{pointsError}</span>
                )}
                <div className="mt-1 text-xs text-accent">
                  {pointsInputNum > 0 && (
                    <>
                      ≈ <span className="font-bold">{inputUsd} USD</span> / <span className="font-bold">{inputEur} EUR</span>
                    </>
                  )}
                </div>
              </div>
              <button
                className={`bg-accent text-white px-4 py-2 rounded-lg font-bold shadow transition hover:bg-blue-700 disabled:opacity-50 mt-2 text-sm`}
                onClick={handleRequestPayout}
                disabled={submitting || !wallet || !user?.points_balance || !pointsToRedeem}
              >
                {submitting ? 'Sending...' : 'Request Payout'}
              </button>
            </div>
          </div>

          <div className="bg-card shadow-xl rounded-2xl p-4">
            <h2 className="text-base font-bold mb-2 text-white">Recent Payouts</h2>
            {payouts.length === 0 ? (
              <p className="text-gray-400 text-sm">No records found.</p>
            ) : (
              <ul className="space-y-2">
                {payouts.map((p) => {
                  const { usd, eur } = pointsToCurrency(p.points_amount)
                  return (
                    <li key={p.id} className="border-b border-gray-900 py-2">
                      <p className="text-white font-semibold text-sm">
                        {p.points_amount} pts
                        <span className="text-xs text-accent ml-2">
                          (≈ {usd} USD / {eur} EUR)
                        </span>
                        {" | Crypto: "}{p.crypto_currency}
                      </p>
                      <p className="text-accent text-xs">Status: <span className="capitalize">{p.status}</span></p>
                      <p className="text-gray-300 text-xs">Wallet: {p.wallet_address}</p>
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
