import { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import { supabase } from '../../lib/supabaseClient'

export default function AdminLedger() {
  const [ledger, setLedger] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterUser, setFilterUser] = useState('')
  const [filterKind, setFilterKind] = useState('')

  useEffect(() => {
    fetchUsers()
    fetchLedger()
  }, [filterUser, filterKind])

  const fetchUsers = async () => {
    const { data, error } = await supabase.from('users').select('id,email').order('email', { ascending: true })
    if (error) console.error('Error fetching users:', error)
    else setUsers(data)
  }

  const fetchLedger = async () => {
    setLoading(true)
    let query = supabase.from('ledger').select('*, user: user_id(email)').order('created_at', { ascending: false })

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

  return (
    <Layout admin>
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-primary mb-6">Admin Ledger</h1>

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

        {loading ? (
          <p>Loading ledger...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white dark:bg-gray-800 shadow rounded">
              <thead className="bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th className="py-2 px-4 text-left">User</th>
                  <th className="py-2 px-4 text-left">Kind</th>
                  <th className="py-2 px-4 text-left">Amount</th>
                  <th className="py-2 px-4 text-left">Balance After</th>
                  <th className="py-2 px-4 text-left">Source</th>
                  <th className="py-2 px-4 text-left">Reference ID</th>
                  <th className="py-2 px-4 text-left">Created At</th>
                </tr>
              </thead>
              <tbody>
                {ledger.map((entry) => (
                  <tr key={entry.id} className="border-b border-gray-200 dark:border-gray-700">
                    <td className="py-2 px-4">{entry.user?.email || 'N/A'}</td>
                    <td className="py-2 px-4">{entry.kind}</td>
                    <td className="py-2 px-4">{entry.amount}</td>
                    <td className="py-2 px-4">{entry.balance_after}</td>
                    <td className="py-2 px-4">{entry.source}</td>
                    <td className="py-2 px-4">{entry.reference_id}</td>
                    <td className="py-2 px-4">{new Date(entry.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  )
}
