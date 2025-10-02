import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Layout from '../../components/Layout'
import AdminNavbar from '../../components/AdminNavbar'
import { supabase } from '../../lib/supabaseClient'
import { pointsToCurrency } from '../../lib/pointsConversion'
import { isAdmin } from '../../lib/userUtils'

export default function AdminLedger({ setGlobalLoading }) {
  const router = useRouter()
  const [ledger, setLedger] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterUser, setFilterUser] = useState('')
  const [filterKind, setFilterKind] = useState('')
  const [userDetailsMap, setUserDetailsMap] = useState({})
  const [payoutsMap, setPayoutsMap] = useState({})
  const [pointsInput, setPointsInput] = useState('')
  const [selectedUser, setSelectedUser] = useState(null)
  const [selectedLedger, setSelectedLedger] = useState(null)
  const [showUserModal, setShowUserModal] = useState(false)
  const [showLedgerModal, setShowLedgerModal] = useState(false)
  const [copyStatus, setCopyStatus] = useState('')
  const [payingOut, setPayingOut] = useState(false)
  const [payError, setPayError] = useState('')
  const [adminUser, setAdminUser] = useState(null)
  const [userChecked, setUserChecked] = useState(false)

  // Admin check on mount
  useEffect(() => {
    async function checkAdmin() {
      if (typeof setGlobalLoading === "function") setGlobalLoading(true)
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser || !authUser.email) {
        router.replace('/index')
        if (typeof setGlobalLoading === "function") setGlobalLoading(false)
        return
      }
      const { data: dbUser, error: dbError } = await supabase
        .from('users')
        .select('*')
        .eq('email', authUser.email)
        .single()
      if (dbError || !dbUser || !isAdmin(dbUser)) {
        router.replace('/dashboard')
        if (typeof setGlobalLoading === "function") setGlobalLoading(false)
        return
      }
      setAdminUser(dbUser)
      setUserChecked(true)
      if (typeof setGlobalLoading === "function") setGlobalLoading(false)
    }
    checkAdmin()
  }, [router, setGlobalLoading])

  useEffect(() => {
    if (!userChecked) return
    if (typeof setGlobalLoading === "function") setGlobalLoading(true)
    fetchUsers().finally(() => {
      if (typeof setGlobalLoading === "function") setGlobalLoading(false)
    })
  }, [userChecked, setGlobalLoading])

  useEffect(() => {
    if (users.length) {
      fetchUserDetailsMap(users)
      fetchPayoutsMap(users)
    }
  }, [users])

  useEffect(() => {
    if (!userChecked) return
    if (typeof setGlobalLoading === "function") setGlobalLoading(true)
    fetchLedger().finally(() => {
      if (typeof setGlobalLoading === "function") setGlobalLoading(false)
    })
  }, [filterUser, filterKind, userChecked, setGlobalLoading])

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from('users')
      .select('id,email,tier,points_balance,kyc_status,wallet_address,is_banned,banned_reason,banned_at,last_login')
      .order('email', { ascending: true })
    if (error) console.error('Error fetching users:', error)
    else setUsers(data || [])
  }

  const fetchUserDetailsMap = async (usersArr) => {
    const map = {}
    usersArr.forEach(u => {
      map[u.id] = u
    })
    setUserDetailsMap(map)
  }

  const fetchPayoutsMap = async (usersArr) => {
    const userIds = usersArr.map(u => u.id)
    if (userIds.length === 0) {
      setPayoutsMap({})
      return
    }
    const { data, error } = await supabase
      .from('payouts')
      .select('*')
      .in('user_id', userIds)
    if (error) {
      setPayoutsMap({})
      return
    }
    const payoutsGrouped = {}
    data.forEach(p => {
      if (!payoutsGrouped[p.user_id]) payoutsGrouped[p.user_id] = []
      payoutsGrouped[p.user_id].push(p)
    })
    setPayoutsMap(payoutsGrouped)
  }

  const fetchLedger = async () => {
    setLoading(true)
    let query = supabase
      .from('ledger')
      .select('*, user: user_id(email)')
      .order('created_at', { ascending: false })

    if (filterUser) query = query.eq('user_id', filterUser)
    if (filterKind) query = query.eq('kind', filterKind)

    const { data, error } = await query
    if (error) {
      console.error('Error fetching ledger:', error)
      setLedger([])
    } else {
      setLedger(data)
    }
    setLoading(false)
  }

  const getUserPayoutSummary = (userId) => {
    const payouts = payoutsMap[userId] || []
    if (payouts.length === 0) return '-'
    const totalRequested = payouts.reduce((sum, p) => sum + Number(p.points_amount || 0), 0)
    const lastReq = payouts[0]
    return (
      <div>
        <div><span className="font-semibold">Total Requested:</span> {totalRequested}</div>
        <div><span className="font-semibold">Last Request:</span> {lastReq ? new Date(lastReq.requested_at).toLocaleString() : '-'}</div>
        <div><span className="font-semibold">Last Status:</span> {lastReq ? lastReq.status : '-'}</div>
        <div><span className="font-semibold">Last Wallet:</span> {lastReq ? lastReq.wallet_address : '-'}</div>
      </div>
    )
  }

  const renderPointsCalculator = () => {
    let points = parseInt(pointsInput) || 0
    const { usd, eur } = pointsToCurrency(points)
    return (
      <div className="bg-blue-50 dark:bg-gray-800 rounded p-4 mb-6 flex items-center justify-between shadow">
        <div className="flex flex-col md:flex-row gap-4 w-full items-center">
          <div className="text-lg font-semibold text-primary">Points Calculator</div>
          <input
            type="number"
            placeholder="Enter points amount..."
            value={pointsInput}
            onChange={e => setPointsInput(e.target.value)}
            className="border rounded p-2 w-36 dark:bg-gray-700 dark:text-white"
            min={0}
          />
          <div className="flex flex-col gap-1 text-md text-gray-800 dark:text-gray-200 font-medium">
            <span>{points} points = <span className="text-green-600">{usd} USD</span> / <span className="text-blue-700">{eur} EUR</span></span>
            <span className="text-xs text-gray-500">1 point = $0.01</span>
          </div>
        </div>
      </div>
    )
  }

  const openUserModal = (user) => {
    setSelectedUser(user)
    setShowUserModal(true)
    setCopyStatus('')
  }
  const closeUserModal = () => {
    setShowUserModal(false)
    setSelectedUser(null)
    setCopyStatus('')
  }

  const openLedgerModal = (entry) => {
    setSelectedLedger(entry)
    setShowLedgerModal(true)
    setCopyStatus('')
    setPayError('')
  }
  const closeLedgerModal = () => {
    setShowLedgerModal(false)
    setSelectedLedger(null)
    setCopyStatus('')
    setPayError('')
  }

  const handleCopyWallet = (wallet) => {
    if (!wallet) return
    navigator.clipboard.writeText(wallet)
      .then(() => setCopyStatus('Wallet copied!'))
      .catch(() => setCopyStatus('Copy failed'))
    setTimeout(() => setCopyStatus(''), 1500)
  }

  // Handle payout done (admin confirms payout is transferred)
  const handleMarkPaidOut = async () => {
    if (!selectedLedger) return
    setPayingOut(true)
    setPayError('')
    if (typeof setGlobalLoading === "function") setGlobalLoading(true)
    try {
      // Find related payout request
      const { data: payout } = await supabase
        .from('payouts')
        .select('*')
        .eq('user_id', selectedLedger.user_id)
        .eq('points_amount', selectedLedger.amount)
        .eq('status', 'pending')
        .order('requested_at', { ascending: false })
        .limit(1)
        .single()
      if (!payout) throw new Error('Payout request not found!')

      // Update payout status to "paid"
      const { error: payoutError } = await supabase
        .from('payouts')
        .update({ status: 'paid', processed_at: new Date().toISOString() })
        .eq('id', payout.id)
      if (payoutError) throw payoutError

      // Update user points_balance
      const user = userDetailsMap[selectedLedger.user_id]
      const newBalance = Number(user.points_balance) - Number(selectedLedger.amount)
      if (newBalance < 0) throw new Error('User does not have enough points!')
      const { error: userError } = await supabase
        .from('users')
        .update({ points_balance: newBalance })
        .eq('id', user.id)
      if (userError) throw userError

      // Add ledger entry for debit (for transparency)
      const { error: ledgerError } = await supabase
        .from('ledger')
        .insert({
          user_id: user.id,
          kind: 'debit',
          amount: selectedLedger.amount,
          balance_after: newBalance,
          source: 'admin payout',
          reference_id: payout.id,
          created_at: new Date().toISOString()
        })
      if (ledgerError) throw ledgerError

      // Log admin action
      await supabase.from('admin_logs').insert({
        admin_user: adminUser?.email || 'admin',
        action: 'payout_paid',
        details: { user_id: user.id, payout_id: payout.id, amount: selectedLedger.amount },
        created_at: new Date().toISOString(),
      })

      await fetchUsers()
      await fetchLedger()
      await fetchPayoutsMap(users)
      closeLedgerModal()
    } catch (err) {
      setPayError('Error: ' + (err.message || 'Unknown'))
    }
    setPayingOut(false)
    if (typeof setGlobalLoading === "function") setGlobalLoading(false)
  }

  // User modal
  const UserInfoModal = () => {
    if (!selectedUser) return null
    const { usd, eur } = pointsToCurrency(selectedUser.points_balance)
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-lg w-full p-8 border">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-primary">User Info</h2>
            <button className="text-gray-400 hover:text-gray-600 text-xl" onClick={closeUserModal}>×</button>
          </div>
          <div className="mb-3"><span className="font-semibold">Email:</span> {selectedUser.email}</div>
          <div><span className="font-semibold">Tier:</span> {selectedUser.tier}</div>
          <div><span className="font-semibold">Points:</span> {selectedUser.points_balance} ({usd} USD / {eur} EUR)</div>
          <div><span className="font-semibold">KYC:</span> {selectedUser.kyc_status}</div>
          <div>
            <span className="font-semibold">Wallet:</span>
            <span className="ml-2 break-all bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded font-mono select-all cursor-pointer"
              title="Click to copy"
              onClick={() => handleCopyWallet(selectedUser.wallet_address)}>
              {selectedUser.wallet_address || '-'}
            </span>
            {copyStatus && <span className="ml-2 text-green-600 text-xs">{copyStatus}</span>}
          </div>
          <div><span className="font-semibold">Last Login:</span> {selectedUser.last_login ? new Date(selectedUser.last_login).toLocaleString() : '-'}</div>
          <div>
            <span className="font-semibold">Status:</span> {selectedUser.is_banned ? <span className="text-red-600 font-bold">BANNED</span> : <span className="text-green-600 font-bold">ACTIVE</span>}
            {selectedUser.is_banned && (
              <div className="text-xs text-red-500">
                Reason: {selectedUser.banned_reason || '-'}<br />
                When: {selectedUser.banned_at ? new Date(selectedUser.banned_at).toLocaleString() : '-'}
              </div>
            )}
          </div>
          <div className="mt-3">
            <span className="font-semibold">Payouts:</span>
            <div>{getUserPayoutSummary(selectedUser.id)}</div>
          </div>
        </div>
      </div>
    )
  }

  // Ledger modal
  const LedgerInfoModal = () => {
    if (!selectedLedger) return null
    const { usd, eur } = pointsToCurrency(selectedLedger.amount)
    const user = userDetailsMap[selectedLedger.user_id]
    const isPayout = selectedLedger.kind === 'payout'
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-lg w-full p-8 border">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-primary">Ledger Entry Info</h2>
            <button className="text-gray-400 hover:text-gray-600 text-xl" onClick={closeLedgerModal}>×</button>
          </div>
          <div>
            <span className="font-semibold">User:</span> {user?.email || selectedLedger.user?.email || 'N/A'}
          </div>
          <div>
            <span className="font-semibold">Wallet:</span>
            <span className="ml-2 break-all bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded font-mono select-all cursor-pointer"
              title="Click to copy"
              onClick={() => handleCopyWallet(user?.wallet_address)}>
              {user?.wallet_address || '-'}
            </span>
            {copyStatus && <span className="ml-2 text-green-600 text-xs">{copyStatus}</span>}
          </div>
          <div><span className="font-semibold">Kind:</span> {selectedLedger.kind}</div>
          <div><span className="font-semibold">Amount:</span> {selectedLedger.amount} ({usd} USD / {eur} EUR)</div>
          <div><span className="font-semibold">Balance After:</span> {selectedLedger.balance_after}</div>
          <div><span className="font-semibold">Source:</span> {selectedLedger.source}</div>
          <div><span className="font-semibold">Reference ID:</span> {selectedLedger.reference_id}</div>
          <div><span className="font-semibold">Created At:</span> {new Date(selectedLedger.created_at).toLocaleString()}</div>
          {isPayout && (
            <div className="mt-6 flex flex-col gap-2">
              <button
                className={`bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 font-bold ${payingOut ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={handleMarkPaidOut}
                disabled={payingOut}
              >
                Mark as Paid Out
              </button>
              {payError && <span className="text-red-500">{payError}</span>}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <Layout admin>
      <AdminNavbar user={adminUser} />
      <div className="min-h-screen flex flex-col">
        <div className="max-w-7xl mx-auto p-6 flex-grow">
          <h1 className="text-3xl font-bold text-primary mb-6">Admin Ledger</h1>
          {renderPointsCalculator()}

          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <select
              className="border rounded p-2 dark:bg-gray-800 dark:text-white"
              value={filterUser}
              onChange={(e) => setFilterUser(e.target.value)}
            >
              <option value="">All Users</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.email}
                </option>
              ))}
            </select>
            <select
              className="border rounded p-2 dark:bg-gray-800 dark:text-white"
              value={filterKind}
              onChange={(e) => setFilterKind(e.target.value)}
            >
              <option value="">All Types</option>
              <option value="credit">Credit</option>
              <option value="debit">Debit</option>
              <option value="payout">Payout</option>
              <option value="payout_fee">Payout Fee</option>
            </select>
          </div>

          {/* Users summary table */}
          <div className="mb-10">
            <h2 className="text-xl font-semibold mb-2 text-primary">Users Overview</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm bg-white dark:bg-gray-800 shadow rounded mb-2">
                <thead className="bg-gray-100 dark:bg-gray-700">
                  <tr>
                    <th>Email</th>
                    <th>Tier</th>
                    <th>Points</th>
                    <th>KYC</th>
                    <th>Wallet</th>
                    <th>Banned</th>
                    <th>Last Login</th>
                    <th>Payouts</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="text-center py-8 text-primary animate-pulse">
                        Loading users...
                      </td>
                    </tr>
                  ) : users.map(user => {
                    const { usd, eur } = pointsToCurrency(user.points_balance)
                    return (
                      <tr
                        key={user.id}
                        className="border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900"
                        onClick={() => openUserModal(user)}
                      >
                        <td>{user.email}</td>
                        <td>{user.tier}</td>
                        <td>
                          {user.points_balance}
                          <span className="block text-xs text-gray-500">
                            ({usd} USD / {eur} EUR)
                          </span>
                        </td>
                        <td>{user.kyc_status}</td>
                        <td>
                          <span
                            className="break-all bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded font-mono select-all cursor-pointer"
                            title="Click to copy"
                            onClick={e => { e.stopPropagation(); handleCopyWallet(user.wallet_address) }}>
                            {user.wallet_address || '-'}
                          </span>
                          {copyStatus && <span className="ml-2 text-green-600 text-xs">{copyStatus}</span>}
                        </td>
                        <td>
                          {user.is_banned
                            ? <span className="text-red-600 font-bold">BANNED</span>
                            : <span className="text-green-600 font-bold">ACTIVE</span>
                          }
                          {user.is_banned && (
                            <div className="text-xs text-red-500">
                              Reason: {user.banned_reason || '-'}<br />
                              When: {user.banned_at ? new Date(user.banned_at).toLocaleString() : '-'}
                            </div>
                          )}
                        </td>
                        <td>
                          {user.last_login ? new Date(user.last_login).toLocaleString() : '-'}
                        </td>
                        <td>
                          {getUserPayoutSummary(user.id)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Ledger entries table */}
          <div className="overflow-x-auto">
            <h2 className="text-xl font-semibold mb-2 text-primary">Ledger Entries</h2>
            <table className="min-w-full text-sm bg-white dark:bg-gray-800 shadow rounded">
              <thead className="bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th>User</th>
                  <th>Kind</th>
                  <th>Amount</th>
                  <th>Amount (USD/EUR)</th>
                  <th>Balance After</th>
                  <th>Source</th>
                  <th>Reference ID</th>
                  <th>Created At</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-primary animate-pulse">
                      Loading ledger...
                    </td>
                  </tr>
                ) : ledger.map((entry) => {
                  const { usd, eur } = pointsToCurrency(entry.amount)
                  const user = userDetailsMap[entry.user_id]
                  return (
                    <tr
                      key={entry.id}
                      className="border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900"
                      onClick={() => openLedgerModal(entry)}
                    >
                      <td>
                        {user?.email || entry.user?.email || 'N/A'}
                        <div className="text-xs text-gray-500">
                          Wallet: <span
                            className="break-all bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded font-mono select-all cursor-pointer"
                            title="Click to copy"
                            onClick={e => { e.stopPropagation(); handleCopyWallet(user?.wallet_address) }}>
                            {user?.wallet_address || '-'}
                          </span>
                          {copyStatus && <span className="ml-2 text-green-600 text-xs">{copyStatus}</span>}
                        </div>
                      </td>
                      <td>{entry.kind}</td>
                      <td>{entry.amount}</td>
                      <td>
                        <span className="text-green-700">{usd} USD</span> / <span className="text-blue-700">{eur} EUR</span>
                      </td>
                      <td>{entry.balance_after}</td>
                      <td>{entry.source}</td>
                      <td>{entry.reference_id}</td>
                      <td>{new Date(entry.created_at).toLocaleString()}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Modals */}
          {showUserModal && <UserInfoModal />}
          {showLedgerModal && <LedgerInfoModal />}
        </div>
      </div>
    </Layout>
  )
}
