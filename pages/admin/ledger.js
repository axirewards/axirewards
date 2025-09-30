import { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import { supabase } from '../../lib/supabaseClient'
import { pointsToCurrency } from '../../lib/pointsConversion'

export default function AdminLedger() {
  const [ledger, setLedger] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterUser, setFilterUser] = useState('')
  const [filterKind, setFilterKind] = useState('')
  const [userDetailsMap, setUserDetailsMap] = useState({})
  const [payoutsMap, setPayoutsMap] = useState({})
  const [pointsInput, setPointsInput] = useState('')

  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
    if (users.length) {
      fetchUserDetailsMap(users)
      fetchPayoutsMap(users)
    }
  }, [users])

  useEffect(() => {
    fetchLedger()
  }, [filterUser, filterKind])

  // Get all users with all info and wallet
  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from('users')
      .select('id,email,tier,points_balance,kyc_status,wallet_address,is_banned,banned_reason,banned_at,last_login')
      .order('email', { ascending: true })
    if (error) console.error('Error fetching users:', error)
    else setUsers(data || [])
  }

  // Prepare map for user info by id for quick lookup
  const fetchUserDetailsMap = async (usersArr) => {
    const map = {}
    usersArr.forEach(u => {
      map[u.id] = u
    })
    setUserDetailsMap(map)
  }

  // Prepare payouts Map: {userId: [payouts]}
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
    // Group by user_id
    const payoutsGrouped = {}
    data.forEach(p => {
      if (!payoutsGrouped[p.user_id]) payoutsGrouped[p.user_id] = []
      payoutsGrouped[p.user_id].push(p)
    })
    setPayoutsMap(payoutsGrouped)
  }

  // Ledger entries
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

  // Helper: show payout summary for user
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

  // Mini points-to-currency calculator
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

  return (
    <Layout admin>
      <div className="max-w-7xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-primary mb-6">Admin Ledger</h1>

        {/* Points calculator */}
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
            <table className="min-w-full bg-white dark:bg-gray-800 shadow rounded mb-2">
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
                {users.map(user => (
                  <tr key={user.id} className="border-b border-gray-200 dark:border-gray-700">
                    <td>{user.email}</td>
                    <td>{user.tier}</td>
                    <td>
                      {user.points_balance}
                      <span className="block text-xs text-gray-500">
                        ({pointsToCurrency(user.points_balance).usd} USD / {pointsToCurrency(user.points_balance).eur} EUR)
                      </span>
                    </td>
                    <td>{user.kyc_status}</td>
                    <td>{user.wallet_address || '-'}</td>
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
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Ledger entries table */}
        <div className="overflow-x-auto">
          <h2 className="text-xl font-semibold mb-2 text-primary">Ledger Entries</h2>
          <table className="min-w-full bg-white dark:bg-gray-800 shadow rounded">
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
              {ledger.map((entry) => {
                const { usd, eur } = pointsToCurrency(entry.amount)
                return (
                  <tr key={entry.id} className="border-b border-gray-200 dark:border-gray-700">
                    <td>
                      {userDetailsMap[entry.user_id]?.email || entry.user?.email || 'N/A'}
                      <div className="text-xs text-gray-500">
                        Wallet: {userDetailsMap[entry.user_id]?.wallet_address || '-'}
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
      </div>
    </Layout>
  )
}
