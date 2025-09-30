import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { supabase } from '../lib/supabase'

export default function Payout() {
  const [user, setUser] = useState(null)
  const [wallet, setWallet] = useState('')
  const [pointsToRedeem, setPointsToRedeem] = useState('')
  const [payouts, setPayouts] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    async function fetchData() {
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      if (!currentUser) return

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', currentUser.email)
        .single()

      if (userError) console.error(userError)
      else {
        setUser(userData)
        setWallet(userData.wallet_address || '')
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
    }

    fetchData()
  }, [])

  const handleRequestPayout = async () => {
    if (!wallet || !pointsToRedeem) return
    const pointsNum = parseFloat(pointsToRedeem)
    if (isNaN(pointsNum) || pointsNum <= 0 || pointsNum > user.points_balance) {
      alert('Neteisingas taškų kiekis')
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

      // Debituoti user points via RPC
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
      alert('Payout request submitted!')
    } catch (err) {
      console.error(err)
      alert('Klaida siunčiant payout request')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <Layout><p className="text-center mt-10">Loading...</p></Layout>

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <h1 className="text-3xl font-bold text-primary">Payout</h1>

        <div className="bg-white dark:bg-gray-800 shadow-md rounded p-4 space-y-4">
          <p>Taškai balanse: <span className="font-semibold">{user.points_balance}</span></p>
          <input
            type="text"
            placeholder="Įveskite wallet adresą"
            className="w-full border border-gray-300 rounded p-2 dark:bg-gray-700 dark:text-white"
            value={wallet}
            onChange={(e) => setWallet(e.target.value)}
          />
          <input
            type="number"
            placeholder="Taškai konvertuoti į crypto"
            className="w-full border border-gray-300 rounded p-2 dark:bg-gray-700 dark:text-white"
            value={pointsToRedeem}
            onChange={(e) => setPointsToRedeem(e.target.value)}
          />
          <button
            className="bg-primary text-white px-4 py-2 rounded hover:bg-blue-700"
            onClick={handleRequestPayout}
            disabled={submitting}
          >
            {submitting ? 'Sending...' : 'Request Payout'}
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow-md rounded p-4">
          <h2 className="text-xl font-semibold mb-2 text-primary">Paskutiniai payout requestai</h2>
          {payouts.length === 0 ? (
            <p>Nėra įrašų</p>
          ) : (
            <ul className="space-y-2">
              {payouts.map((p) => (
                <li key={p.id} className="border-b border-gray-200 dark:border-gray-700 py-2">
                  <p>Taškai: {p.points_amount} | Crypto: {p.crypto_currency}</p>
                  <p>Status: <span className="capitalize">{p.status}</span></p>
                  <p>Wallet: {p.wallet_address}</p>
                  <p className="text-xs text-gray-400">{new Date(p.requested_at).toLocaleString()}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Layout>
  )
}
