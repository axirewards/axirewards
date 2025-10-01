import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Layout from '../../components/Layout'
import { supabase } from '../../lib/supabaseClient'
import { isAdmin } from '../../lib/userUtils'
import Footer from '../../components/Footer'

export default function AdminDashboard({ setGlobalLoading }) {
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
    active_partners: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [user, setUser] = useState(null)
  const [userChecked, setUserChecked] = useState(false)

  // Banner Management Modal
  const [showBannerModal, setShowBannerModal] = useState(false)
  const [bannerSettings, setBannerSettings] = useState({
    show_side_banners: true,
    show_bottom_banner: true,
    name: ''
  })
  const [bannerLoading, setBannerLoading] = useState(false)
  const [bannerError, setBannerError] = useState('')
  const [bannerSuccess, setBannerSuccess] = useState('')

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
      if (dbError || !dbUser) {
        router.replace('/dashboard')
        if (typeof setGlobalLoading === "function") setGlobalLoading(false)
        return
      }
      setUser(dbUser)
      setUserChecked(true)
      if (!isAdmin(dbUser)) {
        router.replace('/dashboard')
        if (typeof setGlobalLoading === "function") setGlobalLoading(false)
        return
      }
      if (typeof setGlobalLoading === "function") setGlobalLoading(false)
    }
    checkAdmin()
  }, [router, setGlobalLoading])

  // Stats fetch
  useEffect(() => {
    if (!userChecked) return
    async function fetchStats() {
      try {
        setLoading(true)
        setError('')
        if (typeof setGlobalLoading === "function") setGlobalLoading(true)

        // Vartotojų skaičius
        const { count: usersCount, error: usersError } = await supabase
          .from('users')
          .select('id', { count: 'exact', head: true })
        if (usersError) throw usersError

        // Aktyvių vartotojų skaičius
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
        if (typeof setGlobalLoading === "function") setGlobalLoading(false)
      }
    }

    fetchStats()
  }, [userChecked, setGlobalLoading])

  // Banner settings fetch
  useEffect(() => {
    async function fetchBannerSettings() {
      setBannerLoading(true)
      setBannerError('')
      const { data, error } = await supabase
        .from('settings')
        .select('id, name, show_side_banners, show_bottom_banner')
        .eq('id', 1)
        .single()
      if (error || !data) {
        setBannerError('Failed to load banner settings')
        setBannerLoading(false)
        return
      }
      setBannerSettings({
        show_side_banners: !!data.show_side_banners,
        show_bottom_banner: !!data.show_bottom_banner,
        name: data.name || 'layout'
      })
      setBannerLoading(false)
    }
    if (showBannerModal) fetchBannerSettings()
  }, [showBannerModal])

  // Banner settings update
  const handleBannerUpdate = async (key, value) => {
    setBannerError('')
    setBannerSuccess('')
    setBannerLoading(true)
    const { error } = await supabase
      .from('settings')
      .update({ [key]: value })
      .eq('id', 1)
    if (error) {
      setBannerError('Failed to update: ' + error.message)
      setBannerLoading(false)
      return
    }
    setBannerSettings(s => ({ ...s, [key]: value }))
    setBannerLoading(false)
    setBannerSuccess('Updated successfully!')
    setTimeout(() => setBannerSuccess(''), 1200)
  }

  // UI Helper
  const cardClass = "bg-white dark:bg-gray-800 p-4 rounded shadow flex flex-col items-center cursor-pointer hover:scale-105 transition-transform"
  const gridClass = "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6"
  const sectionClass = "mt-8 mb-4 text-xl font-bold text-primary text-center"
  const bannerBtnClass = "px-4 py-2 rounded font-semibold transition text-white shadow focus:outline-none"

  return (
    <Layout admin>
      <div className="min-h-screen flex flex-col justify-between">
        <div className="max-w-6xl mx-auto w-full p-6 flex-grow">
          <h1 className="text-3xl font-bold text-primary mb-6">Admin Dashboard</h1>
          {loading ? (
            <p className="animate-pulse text-primary">Loading stats...</p>
          ) : error ? (
            <p className="text-red-600 font-bold">{error}</p>
          ) : (
            <div className={gridClass}>
              <div className={cardClass} onClick={() => router.push('/admin/users')}>
                <p className="text-gray-500">Users</p>
                <p className="text-2xl font-bold">{stats.users}</p>
              </div>
              <div className={cardClass} onClick={() => router.push('/admin/users')}>
                <p className="text-gray-500">Active Users</p>
                <p className="text-2xl font-bold">{stats.active_users}</p>
              </div>
              <div className={cardClass} onClick={() => router.push('/admin/users')}>
                <p className="text-gray-500">Banned Users</p>
                <p className="text-2xl font-bold text-red-500">{stats.banned_users}</p>
              </div>
              <div className={cardClass} onClick={() => router.push('/admin/offers')}>
                <p className="text-gray-500">Active Offers</p>
                <p className="text-2xl font-bold">{stats.offers}</p>
              </div>
              <div className={cardClass}>
                <p className="text-gray-500">Completions</p>
                <p className="text-2xl font-bold">{stats.completions}</p>
              </div>
              <div className={cardClass} onClick={() => router.push('/admin/ledger')}>
                <p className="text-gray-500">Payouts (Pending)</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.payouts_pending}</p>
              </div>
              <div className={cardClass} onClick={() => router.push('/admin/ledger')}>
                <p className="text-gray-500">Payouts (Paid)</p>
                <p className="text-2xl font-bold text-green-600">{stats.payouts_paid}</p>
              </div>
              <div className={cardClass} onClick={() => router.push('/admin/ledger')}>
                <p className="text-gray-500">Total Payout Requests</p>
                <p className="text-2xl font-bold">{stats.payouts_total}</p>
              </div>
              <div className={cardClass} onClick={() => router.push('/admin/partners')}>
                <p className="text-gray-500">Active Partners</p>
                <p className="text-2xl font-bold">{stats.active_partners}</p>
              </div>
              <div className={cardClass + " !bg-blue-50 dark:!bg-blue-900 border-2 border-blue-300"} style={{ gridColumn: "span 1" }}>
                <div className="flex flex-col items-center">
                  <p className="text-blue-800 dark:text-blue-200 font-bold text-md mb-2">Banner Management</p>
                  <button
                    className={bannerBtnClass + " bg-blue-600 hover:bg-blue-700 mt-2"}
                    onClick={() => setShowBannerModal(true)}
                  >
                    Manage Banners
                  </button>
                </div>
              </div>
            </div>
          )}
          <div className="mt-8 text-sm text-gray-400 dark:text-gray-500">
            For more user details see <span className="font-semibold text-blue-600">Admin Users</span> tab.
          </div>
        </div>
        <Footer />
        {/* Banner Modal */}
        {showBannerModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-md w-full p-8 border border-blue-600 relative animate-fade-in">
              <button
                className="absolute top-3 right-4 text-3xl text-blue-600 font-bold hover:text-blue-800"
                onClick={() => setShowBannerModal(false)}
                aria-label="Close"
              >×</button>
              <h2 className="text-2xl font-bold text-blue-700 mb-4 text-center">Banner Management</h2>
              {bannerLoading ? (
                <p className="animate-pulse text-blue-600 text-center">Loading banner settings...</p>
              ) : bannerError ? (
                <p className="text-red-600 font-bold text-center">{bannerError}</p>
              ) : (
                <form className="space-y-6">
                  <div className="flex flex-col gap-2">
                    <label className="font-semibold text-gray-700 dark:text-gray-200">
                      Show Side Banners
                    </label>
                    <div className="flex gap-3 items-center">
                      <button
                        type="button"
                        className={bannerBtnClass + (bannerSettings.show_side_banners ? " bg-green-600 hover:bg-green-700" : " bg-gray-500 hover:bg-gray-600")}
                        onClick={() => handleBannerUpdate("show_side_banners", !bannerSettings.show_side_banners)}
                        disabled={bannerLoading}
                      >
                        {bannerSettings.show_side_banners ? "Enabled" : "Paused"}
                      </button>
                      <span className="text-xs text-gray-500">{bannerSettings.show_side_banners ? "Visible everywhere" : "Hidden"}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="font-semibold text-gray-700 dark:text-gray-200">
                      Show Bottom Banner
                    </label>
                    <div className="flex gap-3 items-center">
                      <button
                        type="button"
                        className={bannerBtnClass + (bannerSettings.show_bottom_banner ? " bg-green-600 hover:bg-green-700" : " bg-gray-500 hover:bg-gray-600")}
                        onClick={() => handleBannerUpdate("show_bottom_banner", !bannerSettings.show_bottom_banner)}
                        disabled={bannerLoading}
                      >
                        {bannerSettings.show_bottom_banner ? "Enabled" : "Paused"}
                      </button>
                      <span className="text-xs text-gray-500">{bannerSettings.show_bottom_banner ? "Visible everywhere" : "Hidden"}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="font-semibold text-gray-700 dark:text-gray-200">
                      Banner Settings Name
                    </label>
                    <input
                      type="text"
                      className="border rounded px-3 py-1 bg-gray-50 dark:bg-gray-800 w-full"
                      value={bannerSettings.name}
                      disabled
                    />
                  </div>
                  {bannerSuccess && <p className="text-green-600 text-center font-bold">{bannerSuccess}</p>}
                </form>
              )}
            </div>
          </div>
        )}
      </div>
      <style jsx>{`
        .animate-fade-in { animation: fadeInModal 0.22s cubic-bezier(.23,1,.32,1); }
        @keyframes fadeInModal {
          from { opacity:0; transform:scale(.98);}
          to { opacity:1; transform:scale(1);}
        }
      `}</style>
    </Layout>
  )
}
