import { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import { supabase } from '../../lib/supabase'

export default function AdminOffers() {
  const [offers, setOffers] = useState([])
  const [partners, setPartners] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterPartner, setFilterPartner] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  useEffect(() => {
    fetchPartners()
    fetchOffers()
  }, [filterPartner, filterStatus])

  const fetchPartners = async () => {
    const { data, error } = await supabase.from('partners').select('*')
    if (error) {
      console.error(error)
    } else {
      setPartners(data)
    }
  }

  const fetchOffers = async () => {
    setLoading(true)
    let query = supabase.from('offers').select('*, partner:partner_id(*)').order('created_at', { ascending: false })

    if (filterPartner) query = query.eq('partner_id', filterPartner)
    if (filterStatus) query = query.eq('status', filterStatus)

    const { data, error } = await query
    if (error) {
      console.error(error)
      setOffers([])
    } else {
      setOffers(data)
    }
    setLoading(false)
  }

  const toggleStatus = async (offerId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active'
    const { error } = await supabase.from('offers').update({ status: newStatus }).eq('id', offerId)
    if (error) console.error('Error updating offer status:', error)
    else fetchOffers()
  }

  return (
    <Layout admin>
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-primary mb-6">Admin Offers</h1>

        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <select
            className="border rounded p-2 dark:bg-gray-800 dark:text-white"
            value={filterPartner}
            onChange={(e) => setFilterPartner(e.target.value)}
          >
            <option value="">All Partners</option>
            {partners.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
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
        </div>

        {loading ? (
          <p>Loading offers...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white dark:bg-gray-800 shadow rounded">
              <thead className="bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th className="py-2 px-4 text-left">Title</th>
                  <th className="py-2 px-4 text-left">Partner</th>
                  <th className="py-2 px-4 text-left">Payout Points</th>
                  <th className="py-2 px-4 text-left">Country</th>
                  <th className="py-2 px-4 text-left">Device</th>
                  <th className="py-2 px-4 text-left">Status</th>
                  <th className="py-2 px-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {offers.map((offer) => (
                  <tr key={offer.id} className="border-b border-gray-200 dark:border-gray-700">
                    <td className="py-2 px-4">{offer.title}</td>
                    <td className="py-2 px-4">{offer.partner.name}</td>
                    <td className="py-2 px-4">{offer.payout_points}</td>
                    <td className="py-2 px-4">{offer.country}</td>
                    <td className="py-2 px-4">{offer.device_type}</td>
                    <td className="py-2 px-4">{offer.status}</td>
                    <td className="py-2 px-4">
                      <button
                        className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                        onClick={() => toggleStatus(offer.id, offer.status)}
                      >
                        {offer.status === 'active' ? 'Deactivate' : 'Activate'}
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
