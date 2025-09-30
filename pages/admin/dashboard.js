import { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import { supabase } from '../../lib/supabase'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    users: 0,
    offers: 0,
    completions: 0,
    payouts: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        // Vartotojų skaičius
        const { count: usersCount } = await supabase
          .from('users')
          .select('id', { count: 'exact', head: true })

        // Active offers
        const { count: offersCount } = await supabase
          .from('offers')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'active')

        // Completions
        const { count: completionsCount } = await supabase
          .from('completions')
          .select('id', { count: 'exact', head: true })

        // Payouts pending/approved
        const { count: payoutsCount } = await supabase
          .from('payouts')
          .select('id', { count: 'exact', head: true })

        setStats({
          users: usersCount,
          offers: offersCount,
          completions: completionsCount,
          payouts: payoutsCount
        })
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  return (
    <Layout admin>
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-primary mb-6">Admin Dashboard</h1>

        {loading ? (
          <p>Loading stats...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
              <p className="text-gray-500">Users</p>
              <p className="text-2xl font-bold">{stats.users}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
              <p className="text-gray-500">Active Offers</p>
              <p className="text-2xl font-bold">{stats.offers}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
              <p className="text-gray-500">Completions</p>
              <p className="text-2xl font-bold">{stats.completions}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
              <p className="text-gray-500">Payout Requests</p>
              <p className="text-2xl font-bold">{stats.payouts}</p>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
