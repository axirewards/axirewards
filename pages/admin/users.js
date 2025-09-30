import { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import { supabase } from '../../lib/supabaseClient'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchUsers()
  }, [search])

  const fetchUsers = async () => {
    setLoading(true)
    let query = supabase.from('users').select('*').order('created_at', { ascending: false })

    if (search) {
      query = query.ilike('email', `%${search}%`)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching users:', error)
      setUsers([])
    } else {
      setUsers(data)
    }

    setLoading(false)
  }

  const toggleKyc = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'approved' ? 'pending' : 'approved'
    const { error } = await supabase
      .from('users')
      .update({ kyc_status: newStatus })
      .eq('id', userId)

    if (error) {
      console.error('Error updating KYC:', error)
    } else {
      fetchUsers()
    }
  }

  return (
    <Layout admin>
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-primary mb-6">Admin Users</h1>

        <div className="mb-4">
          <input
            type="text"
            placeholder="Search by email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border rounded p-2 w-full md:w-1/3 dark:bg-gray-800 dark:text-white"
          />
        </div>

        {loading ? (
          <p>Loading users...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white dark:bg-gray-800 shadow rounded">
              <thead className="bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th className="py-2 px-4 text-left">Email</th>
                  <th className="py-2 px-4 text-left">Tier</th>
                  <th className="py-2 px-4 text-left">Points</th>
                  <th className="py-2 px-4 text-left">KYC</th>
                  <th className="py-2 px-4 text-left">Last Login</th>
                  <th className="py-2 px-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-gray-200 dark:border-gray-700">
                    <td className="py-2 px-4">{user.email}</td>
                    <td className="py-2 px-4">{user.tier}</td>
                    <td className="py-2 px-4">{user.points_balance}</td>
                    <td className="py-2 px-4">{user.kyc_status}</td>
                    <td className="py-2 px-4">
                      {user.last_login ? new Date(user.last_login).toLocaleString() : '-'}
                    </td>
                    <td className="py-2 px-4">
                      <button
                        className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                        onClick={() => toggleKyc(user.id, user.kyc_status)}
                      >
                        {user.kyc_status === 'approved' ? 'Revoke' : 'Approve'}
                      </button>
                    </td>
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
