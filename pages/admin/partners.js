import { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import { supabase } from '../../lib/supabaseClient'

export default function AdminPartners() {
  const [partners, setPartners] = useState([])
  const [loading, setLoading] = useState(true)
  const [newPartner, setNewPartner] = useState({
    code: '',
    name: '',
    revenue_share: 50,
    net_terms: 30,
    callback_secret: ''
  })

  useEffect(() => {
    fetchPartners()
  }, [])

  const fetchPartners = async () => {
    setLoading(true)
    const { data, error } = await supabase.from('partners').select('*').order('created_at', { ascending: false })
    if (error) {
      console.error('Error fetching partners:', error)
      setPartners([])
    } else {
      setPartners(data)
    }
    setLoading(false)
  }

  const addPartner = async () => {
    const { error } = await supabase.from('partners').insert([newPartner])
    if (error) {
      console.error('Error adding partner:', error)
    } else {
      setNewPartner({ code: '', name: '', revenue_share: 50, net_terms: 30, callback_secret: '' })
      fetchPartners()
    }
  }

  const updatePartner = async (id, field, value) => {
    const { error } = await supabase.from('partners').update({ [field]: value }).eq('id', id)
    if (error) console.error('Error updating partner:', error)
    else fetchPartners()
  }

  return (
    <Layout admin>
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-primary mb-6">Admin Partners</h1>

        <div className="mb-6 bg-gray-50 dark:bg-gray-800 p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">Add New Partner</h2>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-2">
            <input
              type="text"
              placeholder="Code"
              value={newPartner.code}
              onChange={(e) => setNewPartner({ ...newPartner, code: e.target.value })}
              className="border rounded p-2 dark:bg-gray-700 dark:text-white"
            />
            <input
              type="text"
              placeholder="Name"
              value={newPartner.name}
              onChange={(e) => setNewPartner({ ...newPartner, name: e.target.value })}
              className="border rounded p-2 dark:bg-gray-700 dark:text-white"
            />
            <input
              type="number"
              placeholder="Revenue %"
              value={newPartner.revenue_share}
              onChange={(e) => setNewPartner({ ...newPartner, revenue_share: parseFloat(e.target.value) })}
              className="border rounded p-2 dark:bg-gray-700 dark:text-white"
            />
            <input
              type="number"
              placeholder="Net Terms"
              value={newPartner.net_terms}
              onChange={(e) => setNewPartner({ ...newPartner, net_terms: parseInt(e.target.value) })}
              className="border rounded p-2 dark:bg-gray-700 dark:text-white"
            />
            <input
              type="text"
              placeholder="Callback Secret"
              value={newPartner.callback_secret}
              onChange={(e) => setNewPartner({ ...newPartner, callback_secret: e.target.value })}
              className="border rounded p-2 dark:bg-gray-700 dark:text-white"
            />
            <button
              className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700"
              onClick={addPartner}
            >
              Add
            </button>
          </div>
        </div>

        {loading ? (
          <p>Loading partners...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white dark:bg-gray-800 shadow rounded">
              <thead className="bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th className="py-2 px-4 text-left">Code</th>
                  <th className="py-2 px-4 text-left">Name</th>
                  <th className="py-2 px-4 text-left">Revenue %</th>
                  <th className="py-2 px-4 text-left">Net Terms</th>
                  <th className="py-2 px-4 text-left">Callback Secret</th>
                </tr>
              </thead>
              <tbody>
                {partners.map((p) => (
                  <tr key={p.id} className="border-b border-gray-200 dark:border-gray-700">
                    <td className="py-2 px-4">{p.code}</td>
                    <td className="py-2 px-4">{p.name}</td>
                    <td className="py-2 px-4">
                      <input
                        type="number"
                        value={p.revenue_share}
                        onChange={(e) => updatePartner(p.id, 'revenue_share', parseFloat(e.target.value))}
                        className="border rounded p-1 w-20 dark:bg-gray-700 dark:text-white"
                      />
                    </td>
                    <td className="py-2 px-4">
                      <input
                        type="number"
                        value={p.net_terms}
                        onChange={(e) => updatePartner(p.id, 'net_terms', parseInt(e.target.value))}
                        className="border rounded p-1 w-20 dark:bg-gray-700 dark:text-white"
                      />
                    </td>
                    <td className="py-2 px-4">
                      <input
                        type="text"
                        value={p.callback_secret}
                        onChange={(e) => updatePartner(p.id, 'callback_secret', e.target.value)}
                        className="border rounded p-1 dark:bg-gray-700 dark:text-white"
                      />
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
