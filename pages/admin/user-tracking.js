import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Layout from '../../components/Layout'
import AdminNavbar from '../../components/AdminNavbar'
import { supabase } from '../../lib/supabaseClient'
import { isAdmin } from '../../lib/userUtils'

export default function AdminUserTracking({ setGlobalLoading }) {
  const router = useRouter()
  const [tracking, setTracking] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [user, setUser] = useState(null)
  const [userChecked, setUserChecked] = useState(false)
  const [newToken, setNewToken] = useState({ user_id: '', tracking_token: '' })
  const [searchToken, setSearchToken] = useState('')
  const [searchEmail, setSearchEmail] = useState('')

  // Admin check
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
      setUser(dbUser)
      setUserChecked(true)
      if (typeof setGlobalLoading === "function") setGlobalLoading(false)
    }
    checkAdmin()
  }, [router, setGlobalLoading])

  // Fetch users and tracking data
  useEffect(() => {
    if (!userChecked) return
    if (typeof setGlobalLoading === "function") setGlobalLoading(true)
    Promise.all([fetchUsers(), fetchTracking()]).finally(() => {
      if (typeof setGlobalLoading === "function") setGlobalLoading(false)
    })
  }, [userChecked, searchToken, searchEmail, setGlobalLoading])

  const fetchUsers = async () => {
    const { data, error } = await supabase.from('users').select('id,email').order('email', { ascending: true })
    if (error) setError('Error fetching users: ' + error.message)
    else setUsers(data)
  }

  const fetchTracking = async () => {
    setLoading(true)
    let query = supabase
      .from('user_tracking')
      .select('*, user: user_id(email)')
      .order('created_at', { ascending: false })
    if (searchToken) query = query.ilike('tracking_token', `%${searchToken}%`)
    if (searchEmail) query = query.ilike('user.email', `%${searchEmail}%`)
    const { data, error } = await query
    if (error) {
      setError('Error fetching tracking tokens: ' + error.message)
      setTracking([])
    } else {
      setTracking(data)
      setError('')
    }
    setLoading(false)
  }

  const addTracking = async () => {
    if (typeof setGlobalLoading === "function") setGlobalLoading(true)
    if (!newToken.user_id || !newToken.tracking_token) {
      setError('User and tracking token are required')
      if (typeof setGlobalLoading === "function") setGlobalLoading(false)
      return
    }
    // Check for duplicate tracking token
    const { data: existing, error: checkError } = await supabase
      .from('user_tracking')
      .select('id')
      .eq('tracking_token', newToken.tracking_token)
      .single()
    if (existing) {
      setError('Tracking token already exists!')
      if (typeof setGlobalLoading === "function") setGlobalLoading(false)
      return
    }
    const { error } = await supabase.from('user_tracking').insert([newToken])
    if (error) {
      setError('Error adding tracking token: ' + error.message)
    } else {
      setNewToken({ user_id: '', tracking_token: '' })
      fetchTracking()
      setError('')
    }
    if (typeof setGlobalLoading === "function") setGlobalLoading(false)
  }

  const deleteTracking = async (id) => {
    if (!confirm('Delete this tracking token?')) return
    if (typeof setGlobalLoading === "function") setGlobalLoading(true)
    const { error } = await supabase.from('user_tracking').delete().eq('id', id)
    if (error) setError('Error deleting tracking token: ' + error.message)
    else {
      fetchTracking()
      setError('')
    }
    if (typeof setGlobalLoading === "function") setGlobalLoading(false)
  }

  return (
    <Layout admin>
      <AdminNavbar user={user} />
      <div className="min-h-screen flex flex-col">
        <div className="max-w-6xl mx-auto p-6 flex-grow">
          <h1 className="text-3xl font-bold text-primary mb-6">Admin User Tracking</h1>
          {error && (
            <div className="mb-4 text-red-600 font-bold">{error}</div>
          )}

          {/* Add tracking token */}
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

          {/* Search/filter */}
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <input
              type="text"
              placeholder="Filter by token..."
              value={searchToken}
              onChange={e => setSearchToken(e.target.value)}
              className="border rounded p-2 dark:bg-gray-700 dark:text-white"
            />
            <input
              type="text"
              placeholder="Filter by user email..."
              value={searchEmail}
              onChange={e => setSearchEmail(e.target.value)}
              className="border rounded p-2 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {loading ? (
            <p className="animate-pulse text-primary text-center py-8">Loading tracking tokens...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white dark:bg-gray-800 shadow rounded text-sm">
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
                      <td className="py-2 px-4 font-mono text-sm">{t.tracking_token}</td>
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
                  {tracking.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-3 px-4 text-center text-gray-400">
                        No tracking tokens found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
