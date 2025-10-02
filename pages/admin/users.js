import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Layout from '../../components/Layout'
import AdminNavbar from '../../components/AdminNavbar'
import { supabase } from '../../lib/supabaseClient'
import {
  isAdmin,
  isBanned,
  banUserByEmail,
  unbanUserByEmail,
  getUserByEmail
} from '../../lib/userUtils'

export default function AdminUsers({ setGlobalLoading }) {
  const router = useRouter()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedUser, setSelectedUser] = useState(null)
  const [showUserModal, setShowUserModal] = useState(false)
  const [banReason, setBanReason] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [adminUser, setAdminUser] = useState(null)
  const [emailEditLoading, setEmailEditLoading] = useState(false)
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
  }, [search, userChecked, setGlobalLoading])

  // Show user modal
  const openUserModal = async (user) => {
    try {
      if (typeof setGlobalLoading === "function") setGlobalLoading(true)
      const userData = await getUserByEmail(user.email)
      setSelectedUser(userData)
      setBanReason('')
      setEditEmail(userData.email)
      setShowUserModal(true)
      if (typeof setGlobalLoading === "function") setGlobalLoading(false)
    } catch (err) {
      alert('Failed to fetch user: ' + err.message)
      if (typeof setGlobalLoading === "function") setGlobalLoading(false)
    }
  }

  const closeUserModal = () => {
    setShowUserModal(false)
    setSelectedUser(null)
    setBanReason('')
    setEditEmail('')
    setEmailEditLoading(false)
  }

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

  // Ban logic
  const handleBanUser = async () => {
    if (!banReason.trim()) {
      alert('Please enter ban reason!')
      return
    }
    if (!isAdmin(adminUser)) {
      alert('Only admin can ban users!')
      return
    }
    try {
      if (typeof setGlobalLoading === "function") setGlobalLoading(true)
      await banUserByEmail(selectedUser.email, banReason, adminUser.email)
      await reloadSelectedUser(selectedUser.email)
      fetchUsers()
      closeUserModal()
      if (typeof setGlobalLoading === "function") setGlobalLoading(false)
    } catch (err) {
      alert('Ban error: ' + err.message)
      if (typeof setGlobalLoading === "function") setGlobalLoading(false)
    }
  }

  // Unban logic
  const handleUnbanUser = async () => {
    if (!banReason.trim()) {
      alert('Please enter unban reason!')
      return
    }
    if (!isAdmin(adminUser)) {
      alert('Only admin can unban users!')
      return
    }
    try {
      if (typeof setGlobalLoading === "function") setGlobalLoading(true)
      await unbanUserByEmail(selectedUser.email, adminUser.email)
      await reloadSelectedUser(selectedUser.email)
      fetchUsers()
      closeUserModal()
      if (typeof setGlobalLoading === "function") setGlobalLoading(false)
    } catch (err) {
      alert('Unban error: ' + err.message)
      if (typeof setGlobalLoading === "function") setGlobalLoading(false)
    }
  }

  // Email edit logic
  const handleEditEmail = async () => {
    if (!editEmail.trim()) {
      alert('Please enter a valid email!')
      return
    }
    setEmailEditLoading(true)
    if (typeof setGlobalLoading === "function") setGlobalLoading(true)
    try {
      const { error } = await supabase
        .from('users')
        .update({ email: editEmail })
        .eq('id', selectedUser.id)
      if (error) throw error
      await reloadSelectedUser(editEmail)
      fetchUsers()
      closeUserModal()
      if (typeof setGlobalLoading === "function") setGlobalLoading(false)
    } catch (err) {
      alert('Failed to update email: ' + err.message)
      if (typeof setGlobalLoading === "function") setGlobalLoading(false)
    }
    setEmailEditLoading(false)
  }

  // Reload selected user info
  const reloadSelectedUser = async (email) => {
    try {
      const userData = await getUserByEmail(email)
      setSelectedUser(userData)
    } catch (err) {
      // do nothing
    }
  }

  const toggleKyc = async (userId, currentStatus) => {
    if (typeof setGlobalLoading === "function") setGlobalLoading(true)
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
    if (typeof setGlobalLoading === "function") setGlobalLoading(false)
  }

  return (
    <Layout admin>
      <AdminNavbar user={adminUser} />
      <div className="min-h-screen flex flex-col">
        <div className="max-w-6xl mx-auto p-6 flex-grow">
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
            <p className="animate-pulse text-primary text-center py-8">Loading users...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white dark:bg-gray-800 shadow rounded text-sm">
                <thead className="bg-gray-100 dark:bg-gray-700">
                  <tr>
                    <th>Email</th>
                    <th>Tier</th>
                    <th>Points</th>
                    <th>KYC</th>
                    <th>Last Login</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900"
                      onClick={() => openUserModal(user)}
                    >
                      <td>{user.email}</td>
                      <td>{user.tier}</td>
                      <td>{user.points_balance}</td>
                      <td>{user.kyc_status}</td>
                      <td>
                        {user.last_login ? new Date(user.last_login).toLocaleString() : '-'}
                      </td>
                      <td>
                        {user.is_banned
                          ? <span className="text-red-600 font-bold">BANNED</span>
                          : <span className="text-green-600 font-bold">ACTIVE</span>
                        }
                      </td>
                      <td>
                        <button
                          className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                          onClick={e => {
                            e.stopPropagation()
                            toggleKyc(user.id, user.kyc_status)
                          }}
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

          {/* User info modal */}
          {showUserModal && selectedUser && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-lg w-full p-8 border">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-primary">User Details</h2>
                  <button
                    className="text-gray-400 hover:text-gray-600 text-xl"
                    onClick={closeUserModal}
                  >×</button>
                </div>
                <div className="mb-3">
                  <span className="font-semibold">Email:</span>{' '}
                  <input
                    type="text"
                    value={editEmail}
                    onChange={e => setEditEmail(e.target.value)}
                    className="border rounded p-1 ml-2 w-2/3 dark:bg-gray-800 dark:text-white"
                    disabled={emailEditLoading}
                  />
                  <button
                    className="ml-2 bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600"
                    onClick={handleEditEmail}
                    disabled={emailEditLoading || !editEmail.trim()}
                  >
                    Change Email
                  </button>
                </div>
                <div><span className="font-semibold">Tier:</span> {selectedUser.tier}</div>
                <div><span className="font-semibold">Points:</span> {selectedUser.points_balance}</div>
                <div><span className="font-semibold">KYC:</span> {selectedUser.kyc_status}</div>
                <div><span className="font-semibold">Last Login:</span> {selectedUser.last_login ? new Date(selectedUser.last_login).toLocaleString() : '-'}</div>
                <div><span className="font-semibold">Status:</span>{' '}
                  {selectedUser.is_banned
                    ? <span className="text-red-600 font-bold">BANNED</span>
                    : <span className="text-green-600 font-bold">ACTIVE</span>
                  }
                </div>
                <div className="mt-3">
                  <span className="font-semibold">Ban Reason:</span>{' '}
                  <input
                    type="text"
                    placeholder="Enter reason"
                    value={banReason}
                    onChange={e => setBanReason(e.target.value)}
                    className="border rounded p-1 w-2/3 dark:bg-gray-800 dark:text-white"
                  />
                </div>
                <div className="mt-6 flex gap-4">
                  {selectedUser.is_banned ? (
                    <button
                      className={`bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 font-bold ${
                        !banReason.trim() ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      onClick={handleUnbanUser}
                      disabled={!banReason.trim()}
                    >
                      Unban
                    </button>
                  ) : (
                    <button
                      className={`bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 font-bold ${
                        !banReason.trim() ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      onClick={handleBanUser}
                      disabled={!banReason.trim()}
                    >
                      Ban
                    </button>
                  )}
                  <button
                    className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
                    onClick={closeUserModal}
                  >
                    Close
                  </button>
                </div>
                {selectedUser.is_banned && (
                  <div className="mt-3 text-xs text-red-500">
                    Banned at: {selectedUser.banned_at ? new Date(selectedUser.banned_at).toLocaleString() : '-'}
                    <br />
                    Reason: {selectedUser.banned_reason || '-'}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
