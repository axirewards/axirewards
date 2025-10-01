import { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import { supabase } from '../../lib/supabaseClient'
import Footer from '../../components/Footer'

export default function AdminPayout({ setGlobalLoading }) {
  const [payouts, setPayouts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedPayout, setSelectedPayout] = useState(null)
  const [markingPaid, setMarkingPaid] = useState(false)
  const [markPaidError, setMarkPaidError] = useState('')
  const [markPaidSuccess, setMarkPaidSuccess] = useState('')
  const [userMap, setUserMap] = useState({})
  const [refresh, setRefresh] = useState(0)

  // Fetch payouts on mount and when refresh
  useEffect(() => {
    if (typeof setGlobalLoading === "function") setGlobalLoading(true)
    setLoading(true)
    setError('')
    async function fetchPayouts() {
      try {
        // Get all payout requests (live)
        const { data: payoutList, error: payoutsErr } = await supabase
          .from('payouts')
          .select('*')
          .order('requested_at', { ascending: false })
        if (payoutsErr) throw payoutsErr

        // Get users for mapping user info
        const userIds = Array.from(new Set(payoutList.map(p => p.user_id))).filter(Boolean)
        let userMapObj = {}
        if (userIds.length > 0) {
          const { data: usersData, error: usersErr } = await supabase
            .from('users')
            .select('*')
            .in('id', userIds)
          if (!usersErr && usersData) {
            usersData.forEach(u => { userMapObj[u.id] = u })
          }
        }

        setPayouts(payoutList)
        setUserMap(userMapObj)
      } catch (err) {
        setError(err.message || 'Unknown error while loading payouts')
      } finally {
        setLoading(false)
        if (typeof setGlobalLoading === "function") setGlobalLoading(false)
      }
    }
    fetchPayouts()
  }, [setGlobalLoading, refresh])

  // Mark payout as paid (and log admin action!)
  const handleMarkPaid = async (payout) => {
    setMarkingPaid(true)
    setMarkPaidError('')
    setMarkPaidSuccess('')
    try {
      // Update payout status
      const { error: payoutError } = await supabase
        .from('payouts')
        .update({
          status: 'paid',
          processed_at: new Date().toISOString(),
          completed_at: new Date().toISOString()
        })
        .eq('id', payout.id)
      if (payoutError) throw payoutError

      // Log admin action
      await supabase.from('admin_logs').insert({
        admin_user: 'admin', // can replace with logged in admin email
        action: 'payout_paid',
        details: { payout_id: payout.id, user_id: payout.user_id, amount: payout.points_amount },
        created_at: new Date().toISOString()
      })

      setMarkPaidSuccess('Payout marked as paid.')
      setTimeout(() => setMarkPaidSuccess(''), 1200)
      setSelectedPayout(null)
      setRefresh(r => r + 1)
    } catch (err) {
      setMarkPaidError('Error: ' + (err.message || 'Unknown'))
    }
    setMarkingPaid(false)
  }

  // UI helpers
  const payoutRowClass = "border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900 transition"
  const cardClass = "bg-white dark:bg-gray-800 p-4 rounded shadow flex flex-col items-center"
  const modalClass = "bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-lg w-full p-8 border border-blue-600 relative animate-fade-in"

  return (
    <Layout admin>
      <div className="min-h-screen flex flex-col justify-between">
        <div className="max-w-7xl mx-auto w-full p-6 flex-grow">
          <h1 className="text-3xl font-bold text-primary mb-6">Admin Payout Management</h1>
          {loading ? (
            <p className="animate-pulse text-primary text-center">Loading payout requests...</p>
          ) : error ? (
            <p className="text-red-600 font-bold text-center">{error}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white dark:bg-gray-800 shadow rounded">
                <thead className="bg-gray-100 dark:bg-gray-700">
                  <tr>
                    <th className="py-2 px-4 text-left">User</th>
                    <th className="py-2 px-4 text-left">Points</th>
                    <th className="py-2 px-4 text-left">Crypto</th>
                    <th className="py-2 px-4 text-left">Wallet</th>
                    <th className="py-2 px-4 text-left">Status</th>
                    <th className="py-2 px-4 text-left">Requested</th>
                    <th className="py-2 px-4 text-left">Processed</th>
                    <th className="py-2 px-4 text-left">TXID</th>
                  </tr>
                </thead>
                <tbody>
                  {payouts.map(p => (
                    <tr
                      key={p.id}
                      className={payoutRowClass}
                      onClick={() => setSelectedPayout(p)}
                    >
                      <td>
                        {userMap[p.user_id]?.email || p.user_id}
                        <span className="block text-xs text-gray-500">{userMap[p.user_id]?.wallet_address}</span>
                      </td>
                      <td>{p.points_amount}</td>
                      <td>
                        {p.crypto_amount ? `${p.crypto_amount} ${p.crypto_currency}` : p.crypto_currency}
                        {p.fee_amount ? <span className="block text-xs text-red-500">Fee: {p.fee_amount}</span> : null}
                      </td>
                      <td className="font-mono text-xs break-all">{p.wallet_address}</td>
                      <td>
                        <span className={`px-2 py-1 rounded text-white ${p.status === 'paid' ? 'bg-green-600' : p.status === 'pending' ? 'bg-yellow-600' : 'bg-gray-500'}`}>
                          {p.status}
                        </span>
                      </td>
                      <td>{p.requested_at ? new Date(p.requested_at).toLocaleString() : '-'}</td>
                      <td>{p.processed_at ? new Date(p.processed_at).toLocaleString() : '-'}</td>
                      <td className="font-mono text-xs break-all">{p.txid || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {payouts.length === 0 && (
                <div className="text-gray-500 text-center py-6">No payout requests found.</div>
              )}
            </div>
          )}
        </div>
        <Footer />
        {/* Modal payout info */}
        {selectedPayout && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
            <div className={modalClass}>
              <button
                className="absolute top-3 right-4 text-3xl text-blue-600 font-bold hover:text-blue-800"
                onClick={() => setSelectedPayout(null)}
                aria-label="Close"
              >×</button>
              <h2 className="text-2xl font-bold text-blue-700 mb-4 text-center">Payout Info</h2>
              <div className="space-y-2 mb-4">
                <div>
                  <span className="font-semibold">User:</span> {userMap[selectedPayout.user_id]?.email || selectedPayout.user_id}
                </div>
                <div>
                  <span className="font-semibold">Wallet:</span> <span className="font-mono">{selectedPayout.wallet_address}</span>
                </div>
                <div>
                  <span className="font-semibold">Points:</span> {selectedPayout.points_amount}
                </div>
                <div>
                  <span className="font-semibold">Crypto:</span> {selectedPayout.crypto_amount ? `${selectedPayout.crypto_amount} ${selectedPayout.crypto_currency}` : selectedPayout.crypto_currency}
                </div>
                <div>
                  <span className="font-semibold">Fee:</span> {selectedPayout.fee_amount || 0}
                </div>
                <div>
                  <span className="font-semibold">Status:</span> <span className={`font-bold ${selectedPayout.status === 'paid' ? 'text-green-600' : selectedPayout.status === 'pending' ? 'text-yellow-600' : 'text-gray-500'}`}>{selectedPayout.status}</span>
                </div>
                <div>
                  <span className="font-semibold">Requested:</span> {selectedPayout.requested_at ? new Date(selectedPayout.requested_at).toLocaleString() : '-'}
                </div>
                <div>
                  <span className="font-semibold">Processed:</span> {selectedPayout.processed_at ? new Date(selectedPayout.processed_at).toLocaleString() : '-'}
                </div>
                <div>
                  <span className="font-semibold">TXID:</span> <span className="font-mono">{selectedPayout.txid || '-'}</span>
                </div>
                <div>
                  <span className="font-semibold">Admin Note:</span> <span>{selectedPayout.admin_note || '-'}</span>
                </div>
              </div>
              {selectedPayout.status !== 'paid' && (
                <button
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg shadow mt-4 transition disabled:opacity-50"
                  onClick={() => handleMarkPaid(selectedPayout)}
                  disabled={markingPaid}
                >
                  {markingPaid ? "Marking as Paid..." : "Mark as Paid"}
                </button>
              )}
              {markPaidError && <p className="text-red-600 mt-4 font-bold text-center">{markPaidError}</p>}
              {markPaidSuccess && <p className="text-green-600 mt-4 font-bold text-center">{markPaidSuccess}</p>}
            </div>
          </div>
        )}
      </div>
      <style jsx>{`
        .animate-fade-in { animation: fadeInModal 0.22s cubic-bezier(.23,1,.32,1); }
        @keyframes fadeInModal {
          from { opacity:0; transform:scale(.98);}
          to { opacity:1; transform:scale(1);}
        }
      `}</style>
    </Layout>
  )
}
