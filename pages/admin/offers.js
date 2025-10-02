import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Layout from '../../components/Layout'
import AdminNavbar from '../../components/AdminNavbar'
import { supabase } from '../../lib/supabaseClient'
import { isAdmin } from '../../lib/userUtils'

export default function AdminOffers({ setGlobalLoading }) {
  const router = useRouter()
  const [offers, setOffers] = useState([])
  const [partners, setPartners] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filterPartner, setFilterPartner] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [searchTitle, setSearchTitle] = useState('')
  const [user, setUser] = useState(null)
  const [userChecked, setUserChecked] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [newOffer, setNewOffer] = useState({
    partner_id: '',
    title: '',
    description: '',
    payout_points: 0,
    country: 'ALL',
    device_type: 'all',
    status: 'active'
  })
  const [editingOfferId, setEditingOfferId] = useState(null)
  const [editingOfferData, setEditingOfferData] = useState({})

  // --- ADMIN CHECK ---
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

  // --- DATA FETCH ---
  useEffect(() => {
    if (!userChecked) return
    if (typeof setGlobalLoading === "function") setGlobalLoading(true)
    Promise.all([fetchPartners(), fetchOffers()]).finally(() => {
      if (typeof setGlobalLoading === "function") setGlobalLoading(false)
    })
  }, [filterPartner, filterStatus, searchTitle, userChecked, setGlobalLoading])

  const fetchPartners = async () => {
    const { data, error } = await supabase.from('partners').select('*')
    if (error) setError(error.message)
    else setPartners(data)
  }
  const fetchOffers = async () => {
    setLoading(true)
    let query = supabase
      .from('offers')
      .select('*, partner:partner_id(*)')
      .order('created_at', { ascending: false })
    if (filterPartner) query = query.eq('partner_id', filterPartner)
    if (filterStatus) query = query.eq('status', filterStatus)
    if (searchTitle)
      query = query.ilike('title', `%${searchTitle}%`)
    const { data, error } = await query
    if (error) {
      setError(error.message)
      setOffers([])
    } else {
      setOffers(data)
    }
    setLoading(false)
  }
  // --- OFFER STATUS ---
  const toggleStatus = async (offerId, currentStatus) => {
    if (typeof setGlobalLoading === "function") setGlobalLoading(true)
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active'
    const { error } = await supabase.from('offers').update({ status: newStatus }).eq('id', offerId)
    if (error) setError(error.message)
    else fetchOffers()
    if (typeof setGlobalLoading === "function") setGlobalLoading(false)
  }
  // --- OFFER DELETE ---
  const deleteOffer = async (offerId) => {
    if (!confirm('Are you sure you want to delete this offer?')) return
    if (typeof setGlobalLoading === "function") setGlobalLoading(true)
    const { error } = await supabase.from('offers').delete().eq('id', offerId)
    if (error) setError(error.message)
    else fetchOffers()
    if (typeof setGlobalLoading === "function") setGlobalLoading(false)
  }
  // --- OFFER EDIT INLINE ---
  const startEdit = (offer) => {
    setEditingOfferId(offer.id)
    setEditingOfferData({ ...offer })
  }
  const cancelEdit = () => {
    setEditingOfferId(null)
    setEditingOfferData({})
  }
  const saveEdit = async () => {
    if (typeof setGlobalLoading === "function") setGlobalLoading(true)
    const { error } = await supabase
      .from('offers')
      .update({
        title: editingOfferData.title,
        description: editingOfferData.description,
        payout_points: editingOfferData.payout_points,
        country: editingOfferData.country,
        device_type: editingOfferData.device_type
      })
      .eq('id', editingOfferId)
    if (error) setError(error.message)
    else {
      setEditingOfferId(null)
      setEditingOfferData({})
      fetchOffers()
    }
    if (typeof setGlobalLoading === "function") setGlobalLoading(false)
  }
  // --- OFFER CREATE ---
  const createOffer = async () => {
    if (
      !newOffer.partner_id ||
      !newOffer.title ||
      !newOffer.payout_points
    ) {
      setError('Fill required fields')
      return
    }
    if (typeof setGlobalLoading === "function") setGlobalLoading(true)
    const { error } = await supabase.from('offers').insert([newOffer])
    if (error) setError(error.message)
    else {
      setShowCreate(false)
      setNewOffer({
        partner_id: '',
        title: '',
        description: '',
        payout_points: 0,
        country: 'ALL',
        device_type: 'all',
        status: 'active'
      })
      fetchOffers()
    }
    if (typeof setGlobalLoading === "function") setGlobalLoading(false)
  }
  // --- PARTNER LABEL ---
  const getPartnerLabel = (code) => {
    if (!code) return ''
    if (code.toLowerCase().includes('ayet')) return 'AYET'
    if (code.toLowerCase().includes('cpx')) return 'CPX'
    if (code.toLowerCase().includes('loot')) return 'Lootably'
    return code.toUpperCase()
  }
  return (
    <Layout admin>
      <AdminNavbar user={user} />
      <div className="min-h-screen flex flex-col">
        <div className="max-w-7xl mx-auto p-6 flex-grow">
          <h1 className="text-3xl font-bold text-primary mb-6">Admin Offers</h1>
          {/* Error */}
          {error && (
            <div className="mb-4 text-red-600 font-bold">{error}</div>
          )}
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-4 items-center">
            <select
              className="border rounded p-2 dark:bg-gray-800 dark:text-white"
              value={filterPartner}
              onChange={(e) => setFilterPartner(e.target.value)}
            >
              <option value="">All Partners</option>
              {partners.map((p) => (
                <option key={p.id} value={p.id}>
                  {getPartnerLabel(p.code)} - {p.name}
                </option>
              ))}
            </select>
            <select
              className="border rounded p-2 dark:bg-gray-800 dark:text-white"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <input
              type="text"
              placeholder="Search by title..."
              className="border rounded p-2 dark:bg-gray-800 dark:text-white"
              value={searchTitle}
              onChange={(e) => setSearchTitle(e.target.value)}
            />
            <button
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              onClick={() => setShowCreate(true)}
            >
              + Create Offer
            </button>
          </div>
          {/* Create Offer Modal */}
          {showCreate && (
            <div className="fixed z-40 left-0 top-0 w-full h-full bg-black bg-opacity-40 flex items-center justify-center">
              <div className="bg-white p-6 rounded shadow-xl min-w-[350px] relative">
                <button
                  className="absolute top-2 right-3 text-xl"
                  onClick={() => setShowCreate(false)}
                >✕</button>
                <h2 className="text-lg mb-3 font-bold">New Offer</h2>
                <div className="flex flex-col gap-3">
                  <select
                    className="border rounded p-2"
                    value={newOffer.partner_id}
                    onChange={e => setNewOffer({ ...newOffer, partner_id: e.target.value })}
                  >
                    <option value="">Select Partner</option>
                    {partners.map(p =>
                      <option key={p.id} value={p.id}>{getPartnerLabel(p.code)} - {p.name}</option>
                    )}
                  </select>
                  <input
                    className="border rounded p-2"
                    placeholder="Title"
                    value={newOffer.title}
                    onChange={e => setNewOffer({ ...newOffer, title: e.target.value })}
                  />
                  <textarea
                    className="border rounded p-2"
                    placeholder="Description"
                    value={newOffer.description}
                    onChange={e => setNewOffer({ ...newOffer, description: e.target.value })}
                  />
                  <input
                    className="border rounded p-2"
                    type="number"
                    placeholder="Payout Points"
                    value={newOffer.payout_points}
                    onChange={e => setNewOffer({ ...newOffer, payout_points: Number(e.target.value) })}
                  />
                  <input
                    className="border rounded p-2"
                    placeholder="Country (ALL or country code)"
                    value={newOffer.country}
                    onChange={e => setNewOffer({ ...newOffer, country: e.target.value })}
                  />
                  <input
                    className="border rounded p-2"
                    placeholder="Device (all, desktop, mobile)"
                    value={newOffer.device_type}
                    onChange={e => setNewOffer({ ...newOffer, device_type: e.target.value })}
                  />
                  <select
                    className="border rounded p-2"
                    value={newOffer.status}
                    onChange={e => setNewOffer({ ...newOffer, status: e.target.value })}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                  <button
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 mt-2"
                    onClick={createOffer}
                  >Create Offer</button>
                </div>
              </div>
            </div>
          )}
          {/* Offers Table */}
          {loading ? (
            <p className="animate-pulse text-primary text-center py-8">Loading offers...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white dark:bg-gray-800 shadow rounded text-sm">
                <thead className="bg-gray-100 dark:bg-gray-700">
                  <tr>
                    <th className="py-2 px-3 text-left">Title</th>
                    <th className="py-2 px-3 text-left">Partner</th>
                    <th className="py-2 px-3 text-left">Payout</th>
                    <th className="py-2 px-3 text-left">Country</th>
                    <th className="py-2 px-3 text-left">Device</th>
                    <th className="py-2 px-3 text-left">Status</th>
                    <th className="py-2 px-3 text-left">Created</th>
                    <th className="py-2 px-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {offers.map((offer) => (
                    <tr key={offer.id} className="border-b border-gray-200 dark:border-gray-700">
                      <td className="py-2 px-3">
                        {editingOfferId === offer.id ? (
                          <input
                            className="border rounded p-1 text-xs"
                            value={editingOfferData.title}
                            onChange={e => setEditingOfferData({ ...editingOfferData, title: e.target.value })}
                          />
                        ) : (
                          <span className="font-semibold">{offer.title}</span>
                        )}
                        <div className="text-xs text-gray-400">{offer.description}</div>
                      </td>
                      <td className="py-2 px-3">
                        <span className="font-bold text-blue-600">{getPartnerLabel(offer.partner?.code)}</span>
                        <div className="text-xs text-gray-500">{offer.partner?.name}</div>
                      </td>
                      <td className="py-2 px-3">{offer.payout_points}</td>
                      <td className="py-2 px-3">{offer.country}</td>
                      <td className="py-2 px-3">{offer.device_type}</td>
                      <td className="py-2 px-3">
                        <span className={`px-2 py-1 rounded text-white text-xs ${offer.status === 'active' ? 'bg-green-600' : 'bg-gray-500'}`}>{offer.status}</span>
                      </td>
                      <td className="py-2 px-3">{new Date(offer.created_at).toLocaleDateString()}</td>
                      <td className="py-2 px-3 flex gap-2">
                        {editingOfferId === offer.id ? (
                          <>
                            <button className="bg-green-600 text-white px-2 py-1 rounded text-xs" onClick={saveEdit}>Save</button>
                            <button className="bg-gray-400 text-white px-2 py-1 rounded text-xs" onClick={cancelEdit}>Cancel</button>
                          </>
                        ) : (
                          <>
                            <button
                              className="bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 text-xs"
                              onClick={() => toggleStatus(offer.id, offer.status)}
                            >
                              {offer.status === 'active' ? 'Deactivate' : 'Activate'}
                            </button>
                            <button
                              className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600 text-xs"
                              onClick={() => startEdit(offer)}
                            >Edit</button>
                            <button
                              className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 text-xs"
                              onClick={() => deleteOffer(offer.id)}
                            >Delete</button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                  {offers.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-3 px-4 text-center text-gray-400 text-sm">
                        No offers found.
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
