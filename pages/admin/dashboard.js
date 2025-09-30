import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Layout from '../../components/Layout'
import { supabase } from '../../lib/supabaseClient'
import { isAdmin } from '../../lib/userUtils'

export default function AdminDashboard() {
  const router = useRouter()
  const [stats, setStats] = useState({
    users: 0,
    active_users: 0,
    banned_users: 0,
    offers: 0,
    completions: 0,
    payouts_pending: 0,
    payouts_paid: 0,
    payouts_total: 0,
    active_partners: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [user, setUser] = useState(null)
  const [userChecked, setUserChecked] = useState(false)

  // Admin check on mount
  useEffect(() => {
    async function checkAdmin() {
      // Gauti supabase auth user
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser || !authUser.email) {
        router.replace('/index')
        return
      }
      // DB user pagal email
      const { data: dbUser, error: dbError } = await supabase
        .from('users')
        .select('*')
        .eq('email', authUser.email)
        .single()
      if (dbError || !dbUser) {
        router.replace('/dashboard')
        return
      }
      setUser(dbUser)
      setUserChecked(true)
      if (!isAdmin(dbUser)) {
        router.replace('/dashboard')
        return
      }
    }
    checkAdmin()
  }, [router])

  useEffect(() => {
    if (!userChecked) return
    async function fetchStats() {
      try {
        setLoading(true)
        setError('')

        // Vartotojų skaičius
        const { count: usersCount, error: usersError } = await supabase
          .from('users')
          .select('id', { count: 'exact', head: true })
        if (usersError) throw usersError

        // Aktyvių vartotojų skaičius (pvz. paskutinių 30 dienų login)
        const { count: activeUsersCount, error: activeUsersError } = await supabase
          .from('users')
          .select('id', { count: 'exact', head: true })
          .gte('last_login', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        if (activeUsersError) throw activeUsersError

        // Užblokuotų vartotojų skaičius
        const { count: bannedUsersCount, error: bannedUsersError } = await supabase
          .from('users')
          .select('id', { count: 'exact', head: true })
          .eq('is_banned', true)
        if (bannedUsersError) throw bannedUsersError

        // Active offers
        const { count: offersCount, error: offersError } = await supabase
          .from('offers')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'active')
        if (offersError) throw offersError

        // Completions count
        const { count: completionsCount, error: completionsError } = await supabase
          .from('completions')
          .select('id', { count: 'exact', head: true })
        if (completionsError) throw completionsError

        // Payouts pending
        const { count: payoutsPendingCount, error: payoutsPendingError } = await supabase
          .from('payouts')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'pending')
        if (payoutsPendingError) throw payoutsPendingError

        // Payouts paid
        const { count: payoutsPaidCount, error: payoutsPaidError } = await supabase
          .from('payouts')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'paid')
        if (payoutsPaidError) throw payoutsPaidError

        // All payouts (total)
        const { count: payoutsTotalCount, error: payoutsTotalError } = await supabase
          .from('payouts')
          .select('id', { count: 'exact', head: true })
        if (payoutsTotalError) throw payoutsTotalError

        // Active partners
        const { count: activePartnersCount, error: partnersError } = await supabase
          .from('partners')
          .select('id', { count: 'exact', head: true })
        if (partnersError) throw partnersError

        setStats({
          users: usersCount,
          active_users: activeUsersCount,
          banned_users: bannedUsersCount,
          offers: offersCount,
          completions: completionsCount,
          payouts_pending: payoutsPendingCount,
          payouts_paid: payoutsPaidCount,
          payouts_total: payoutsTotalCount,
          active_partners: activePartnersCount
        })
      } catch (err) {
        setError(err.message || 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [userChecked])

  // Kortelių click handleriai
  const goToUsers = () => router.push('/admin/users')
  const goToOffers = () => router.push('/admin/offers')
  const goToLedger = () => router.push('/admin/ledger')
  const goToPartners = () => router.push('/admin/partners')

  // UI Helper
  const cardClass = "bg-white dark:bg-gray-800 p-4 rounded shadow flex flex-col items-center cursor-pointer hover:scale-105 transition-transform"

  return (
    <Layout admin>
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-primary mb-6">Admin Dashboard</h1>
        {loading ? (
          <p>Loading stats...</p>
        ) : error ? (
          <p className="text-red-600 font-bold">{error}</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-4 gap-6">
            <div className={cardClass} onClick={goToUsers}>
              <p className="text-gray-500">Users</p>
              <p className="text-2xl font-bold">{stats.users}</p>
            </div>
            <div className={cardClass} onClick={goToUsers}>
              <p className="text-gray-500">Active Users</p>
              <p className="text-2xl font-bold">{stats.active_users}</p>
            </div>
            <div className={cardClass} onClick={goToUsers}>
              <p className="text-gray-500">Banned Users</p>
              <p className="text-2xl font-bold text-red-500">{stats.banned_users}</p>
            </div>
            <div className={cardClass} onClick={goToOffers}>
              <p className="text-gray-500">Active Offers</p>
              <p className="text-2xl font-bold">{stats.offers}</p>
            </div>
            <div className={cardClass}>
              <p className="text-gray-500">Completions</p>
              <p className="text-2xl font-bold">{stats.completions}</p>
            </div>
            <div className={cardClass} onClick={goToLedger}>
              <p className="text-gray-500">Payouts (Pending)</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.payouts_pending}</p>
            </div>
            <div className={cardClass} onClick={goToLedger}>
              <p className="text-gray-500">Payouts (Paid)</p>
              <p className="text-2xl font-bold text-green-600">{stats.payouts_paid}</p>
            </div>
            <div className={cardClass} onClick={goToLedger}>
              <p className="text-gray-500">Total Payout Requests</p>
              <p className="text-2xl font-bold">{stats.payouts_total}</p>
            </div>
            <div className={cardClass} onClick={goToPartners}>
              <p className="text-gray-500">Active Partners</p>
              <p className="text-2xl font-bold">{stats.active_partners}</p>
            </div>
          </div>
        )}
        <div className="mt-8 text-sm text-gray-400 dark:text-gray-500">
          For more user details see <span className="font-semibold text-blue-600">Admin Users</span> tab.
        </div>
      </div>
    </Layout>
  )
}
