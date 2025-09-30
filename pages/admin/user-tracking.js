import { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import { supabase } from '../../lib/supabase'

export default function AdminUserTracking() {
  const [tracking, setTracking] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [newToken, setNewToken] = useState({ user_id: '', tracking_token: '' })

  useEffect(() => {
    fetchUsers()
    fetchTracking()
  }, [])

  const fetchUsers = async () => {
    const { data, error } = await supabase.from('users').select('id,email').order('email', { ascending: true })
    if (error) console.error('Error fetching users:', error)
    else setUsers(data)
  }

  const fetchTracking = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('user_tracking')
      .select('*, user: user_id(email)')
      .order('created_at', { ascending: false })
    if (error) {
      console.error('Error fetching tracking:', error)
      setTracking([])
    } else {
      setTracking(data)
    }
    setLoading(false)
  }

  const addTracking = async () => {
    if (!newToken.user_id || !newToken.tracking_token) return
    const { error } = await supabase.from('user_tracking').insert([newToken])
    if (error) {
      console.error('Error adding tracking token:', error)
    } else {
      setNewToken({ user_id: '', tracking_token: '' })
      fetchTracking()
    }
  }

  const deleteTracking = async (id) => {
    const { error } = await supabase.from('user_tracking').delete().eq('id', id)
    if (error) console.error('Error deleting tracking token:', error)
    else fetchTracking()
  }

  return (
    <Layout admin>
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-primary mb-6">Admin User Tracking</h1>

        <div className="mb-6 bg-gray-50 dark:bg-gray-800 p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">Add New Tracking Token</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <select
              value={newToken.user_id}
              onChange={(e) => setNewToken({ ...newToken, user_id: e.target.value })}
              className="border rounded p-2 dark:bg-gray-700 dark:text-white"
            >
              <option value="">Select User</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.email}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Tracking Token"
              value={newToken.tracking_token}
              onChange={(e) => setNewToken({ ...newToken, tracking_token: e.target.value })}
              className="border rounded p-2 dark:bg-gray-700 dark:text-white"
            />
            <button
              className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700"
              onClick={addTracking}
            >
              Add
            </button>
          </div>
        </div>

        {loading ? (
          <p>Loading tracking tokens...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white dark:bg-gray-800 shadow rounded">
              <thead className="bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th className="py-2 px-4 text-left">User</th>
                  <th className="py-2 px-4 text-left">Token</th>
                  <th className="py-2 px-4 text-left">Created At</th>
                  <th className="py-2 px-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tracking.map((t) => (
                  <tr key={t.id} className="border-b border-gray-200 dark:border-gray-700">
                    <td className="py-2 px-4">{t.user?.email || 'N/A'}</td>
                    <td className="py-2 px-4">{t.tracking_token}</td>
                    <td className="py-2 px-4">{new Date(t.created_at).toLocaleString()}</td>
                    <td className="py-2 px-4">
                      <button
                        className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                        onClick={() => deleteTracking(t.id)}
                      >
                        Delete
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
