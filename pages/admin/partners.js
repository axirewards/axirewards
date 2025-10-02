import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Layout from '../../components/Layout'
import AdminNavbar from '../../components/AdminNavbar'
import { supabase } from '../../lib/supabaseClient'
import { isAdmin } from '../../lib/userUtils'

export default function AdminPartners() {
  const router = useRouter()
  const [partners, setPartners] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [user, setUser] = useState(null)
  const [userChecked, setUserChecked] = useState(false)
  const [filter, setFilter] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [newPartner, setNewPartner] = useState({
    code: '',
    name: '',
    revenue_share: 50,
    net_terms: 30,
    callback_secret: ''
  })
  const [editingId, setEditingId] = useState(null)
  const [editingData, setEditingData] = useState({})

  // Admin check on mount
  useEffect(() => {
    async function checkAdmin() {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser || !authUser.email) {
        router.replace('/index')
        return
      }
      const { data: dbUser, error: dbError } = await supabase
        .from('users')
        .select('*')
        .eq('email', authUser.email)
        .single()
      if (dbError || !dbUser || !isAdmin(dbUser)) {
        router.replace('/dashboard')
        return
      }
      setUser(dbUser)
      setUserChecked(true)
    }
    checkAdmin()
  }, [router])

  useEffect(() => {
    if (!userChecked) return
    fetchPartners()
  }, [userChecked, filter])

  const fetchPartners = async () => {
    setLoading(true)
    let query = supabase.from('partners').select('*').order('created_at', { ascending: false })
    if (filter) {
      query = query.ilike('name', `%${filter}%`)
    }
    const { data, error } = await query
    if (error) {
      setError('Error fetching partners: ' + error.message)
      setPartners([])
    } else {
      setPartners(data)
      setError('')
    }
    setLoading(false)
  }

  const addPartner = async () => {
    if (!newPartner.code || !newPartner.name) {
      setError('Code and Name are required')
      return
    }
    const { error } = await supabase.from('partners').insert([newPartner])
    if (error) {
      setError('Error adding partner: ' + error.message)
    } else {
      setShowCreate(false)
      setNewPartner({ code: '', name: '', revenue_share: 50, net_terms: 30, callback_secret: '' })
      fetchPartners()
      setError('')
    }
  }

  const startEdit = (p) => {
    setEditingId(p.id)
    setEditingData({
      code: p.code,
      name: p.name,
      revenue_share: p.revenue_share,
      net_terms: p.net_terms,
      callback_secret: p.callback_secret
    })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditingData({})
  }

  const saveEdit = async () => {
    const { error } = await supabase
      .from('partners')
      .update(editingData)
      .eq('id', editingId)
    if (error) setError('Error updating partner: ' + error.message)
    else {
      setEditingId(null)
      setEditingData({})
      fetchPartners()
      setError('')
    }
  }

  const deletePartner = async (id) => {
    if (!confirm('Delete this partner? All related offers will lose their partner!')) return
    const { error } = await supabase.from('partners').delete().eq('id', id)
    if (error) setError('Error deleting partner: ' + error.message)
    else fetchPartners()
  }

  // Enable/Disable partner
  const togglePartnerEnabled = async (id, enabled) => {
    const { error } = await supabase.from('partners').update({ is_enabled: enabled }).eq('id', id)
    if (error) setError('Error updating partner status: ' + error.message)
    fetchPartners()
  }

  return (
    <Layout admin>
      <AdminNavbar user={user} />
      <div className="min-h-screen flex flex-col">
        <div className="max-w-7xl mx-auto p-6 flex-grow">
          <h1 className="text-3xl font-bold text-primary mb-6">Admin Partners</h1>
          {error && (
            <div className="mb-4 text-red-600 font-bold">{error}</div>
          )}
          <div className="flex flex-col md:flex-row gap-4 items-center mb-5">
            <input
              type="text"
              placeholder="Search partners by name..."
              value={filter}
              onChange={e => setFilter(e.target.value)}
              className="border rounded p-2 w-full md:w-64 dark:bg-gray-700 dark:text-white"
            />
            <button
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              onClick={() => setShowCreate(true)}
            >
              + Add Partner
            </button>
          </div>
          {showCreate && (
            <div className="fixed z-40 left-0 top-0 w-full h-full bg-black bg-opacity-40 flex items-center justify-center">
              <div className="bg-white p-6 rounded shadow-xl min-w-[350px] relative">
                <button
                  className="absolute top-2 right-3 text-xl"
                  onClick={() => setShowCreate(false)}
                >✕</button>
                <h2 className="text-lg mb-3 font-bold">New Partner</h2>
                <div className="flex flex-col gap-3">
                  <input
                    type="text"
                    placeholder="Code"
                    value={newPartner.code}
                    onChange={(e) => setNewPartner({ ...newPartner, code: e.target.value })}
                    className="border rounded p-2"
                  />
                  <input
                    type="text"
                    placeholder="Name"
                    value={newPartner.name}
                    onChange={(e) => setNewPartner({ ...newPartner, name: e.target.value })}
                    className="border rounded p-2"
                  />
                  <input
                    type="number"
                    placeholder="Revenue %"
                    value={newPartner.revenue_share}
                    min={0}
                    max={100}
                    onChange={(e) =>
                      setNewPartner({ ...newPartner, revenue_share: parseFloat(e.target.value) })
                    }
                    className="border rounded p-2"
                  />
                  <input
                    type="number"
                    placeholder="Net Terms"
                    value={newPartner.net_terms}
                    min={0}
                    onChange={(e) =>
                      setNewPartner({ ...newPartner, net_terms: parseInt(e.target.value) })
                    }
                    className="border rounded p-2"
                  />
                  <input
                    type="text"
                    placeholder="Callback Secret"
                    value={newPartner.callback_secret}
                    onChange={(e) =>
                      setNewPartner({ ...newPartner, callback_secret: e.target.value })}
                    className="border rounded p-2"
                  />
                  <button
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 mt-2"
                    onClick={addPartner}
                  >
                    Create Partner
                  </button>
                </div>
              </div>
            </div>
          )}
          {loading ? (
            <p className="text-primary animate-pulse py-12 text-center">Loading partners...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white dark:bg-gray-800 shadow rounded text-sm">
                <thead className="bg-gray-100 dark:bg-gray-700">
                  <tr>
                    <th className="py-2 px-4 text-left">Code</th>
                    <th className="py-2 px-4 text-left">Name</th>
                    <th className="py-2 px-4 text-left">Revenue %</th>
                    <th className="py-2 px-4 text-left">Net Terms</th>
                    <th className="py-2 px-4 text-left">Callback Secret</th>
                    <th className="py-2 px-4 text-left">Enabled</th>
                    <th className="py-2 px-4 text-left">Created</th>
                    <th className="py-2 px-4 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {partners.map((p) => (
                    <tr key={p.id} className="border-b border-gray-200 dark:border-gray-700">
                      <td className="py-2 px-4 font-bold">{p.code}</td>
                      <td className="py-2 px-4">{editingId === p.id ?
                        <input
                          type="text"
                          value={editingData.name}
                          onChange={e => setEditingData({ ...editingData, name: e.target.value })}
                          className="border rounded p-1 w-32 dark:bg-gray-700 dark:text-white"
                        /> : p.name}</td>
                      <td className="py-2 px-4">{editingId === p.id ?
                        <input
                          type="number"
                          value={editingData.revenue_share}
                          min={0}
                          max={100}
                          onChange={e => setEditingData({ ...editingData, revenue_share: parseFloat(e.target.value) })}
                          className="border rounded p-1 w-20 dark:bg-gray-700 dark:text-white"
                        /> : p.revenue_share
                      }</td>
                      <td className="py-2 px-4">{editingId === p.id ?
                        <input
                          type="number"
                          value={editingData.net_terms}
                          min={0}
                          onChange={e => setEditingData({ ...editingData, net_terms: parseInt(e.target.value) })}
                          className="border rounded p-1 w-20 dark:bg-gray-700 dark:text-white"
                        /> : p.net_terms
                      }</td>
                      <td className="py-2 px-4">{editingId === p.id ?
                        <input
                          type="text"
                          value={editingData.callback_secret}
                          onChange={e => setEditingData({ ...editingData, callback_secret: e.target.value })}
                          className="border rounded p-1 w-32 dark:bg-gray-700 dark:text-white"
                        /> : p.callback_secret
                      }</td>
                      <td className="py-2 px-4">
                        <span
                          className={`inline-block px-2 py-1 rounded text-xs font-bold ${p.is_enabled ? 'bg-green-200 text-green-800' : 'bg-gray-200 text-gray-700'}`}
                        >
                          {p.is_enabled ? 'Enabled' : 'Paused'}
                        </span>
                      </td>
                      <td className="py-2 px-4">{new Date(p.created_at).toLocaleDateString()}</td>
                      <td className="py-2 px-4 flex gap-2">
                        {/* Enable/Disable button */}
                        <button
                          className={p.is_enabled ? "bg-yellow-400 text-gray-900 px-2 py-1 rounded hover:bg-yellow-500" : "bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"}
                          onClick={() => togglePartnerEnabled(p.id, !p.is_enabled)}
                          title={p.is_enabled ? "Pause partner (hide everywhere)" : "Resume partner (show everywhere)"}
                        >
                          {p.is_enabled ? "Pause" : "Resume"}
                        </button>
                        {editingId === p.id ? (
                          <>
                            <button
                              className="bg-green-600 text-white px-2 py-1 rounded"
                              onClick={saveEdit}
                            >Save</button>
                            <button
                              className="bg-gray-400 text-white px-2 py-1 rounded"
                              onClick={cancelEdit}
                            >Cancel</button>
                          </>
                        ) : (
                          <>
                            <button
                              className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600"
                              onClick={() => startEdit(p)}
                            >Edit</button>
                            <button
                              className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                              onClick={() => deletePartner(p.id)}
                            >Delete</button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                  {partners.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-3 px-4 text-center text-gray-400">
                        No partners found.
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
