import { useRouter } from 'next/router'
import Layout from '../components/Layout'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

const categories = [
  {
    key: 'surveys',
    name: 'Surveys',
    description: 'Earn by completing surveys from top providers.',
    icon: (
      <svg width={40} height={40} fill="none" viewBox="0 0 24 24">
        <path d="M4 7h16M4 12h16M4 17h16" stroke="#38bdf8" strokeWidth={2} strokeLinecap="round" />
      </svg>
    ),
    route: '/surveys',
    color: 'from-cyan-500 to-blue-700'
  },
  {
    key: 'offerwalls',
    name: 'Offerwalls',
    description: 'Discover apps, games & tasks. Earn, explore, repeat.',
    icon: (
      <svg width={40} height={40} fill="none" viewBox="0 0 24 24">
        <rect x={4} y={4} width={16} height={16} rx={4} stroke="#fbbf24" strokeWidth={2} />
        <path d="M8 8h8v8H8z" fill="#fbbf24" />
      </svg>
    ),
    route: '/offerwalls',
    color: 'from-yellow-400 to-orange-500'
  },
  {
    key: 'rewardedads',
    name: 'Rewarded Ads',
    description: 'Watch ads & get instant rewards. Quick and easy!',
    icon: (
      <svg width={40} height={40} fill="none" viewBox="0 0 24 24">
        <path d="M5 4v16l14-8-14-8z" stroke="#34d399" strokeWidth={2} strokeLinejoin="round" />
      </svg>
    ),
    route: '/rewardedads',
    color: 'from-green-400 to-emerald-600'
  }
]

export default function Earn({ setGlobalLoading }) {
  const router = useRouter()
  const [hovered, setHovered] = useState(null)

  // Redirect to /index if user is not logged in
  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/index')
      }
    }
    checkAuth()
  }, [router])

  // UX: Show global spinner for smooth page transitions
  useEffect(() => {
    if (typeof setGlobalLoading === "function") setGlobalLoading(true)
    const timer = setTimeout(() => {
      if (typeof setGlobalLoading === "function") setGlobalLoading(false)
    }, 300)
    return () => clearTimeout(timer)
  }, [setGlobalLoading])

  return (
    <Layout>
      <div className="min-h-[80vh] w-full flex flex-col items-center justify-center">
        <div className="w-full max-w-6xl py-12 px-2 sm:px-4 md:px-6">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white text-center mb-12 drop-shadow-xl tracking-tight">
            Earn Rewards
          </h1>
          <div className="flex justify-center mb-12">
            <p className="text-lg md:text-xl text-zinc-300 text-center max-w-2xl font-medium">
              Choose your earning method. Surveys, apps, ads – everything in one place, with a seamless Axirewards experience.
            </p>
          </div>
          {/* Kategorijų kortelės */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 md:gap-10 w-full">
            {categories.map(cat => (
              <button
                key={cat.key}
                className={`group relative bg-gradient-to-tr ${cat.color} rounded-2xl shadow-2xl flex flex-col items-center justify-center px-6 py-10 transition-all duration-200 
                  hover:scale-[1.04] hover:shadow-accent focus:outline-none focus:ring-4 focus:ring-accent
                  ${hovered === cat.key ? 'ring-4 ring-accent/60' : ''}
                `}
                onClick={() => {
                  if (typeof setGlobalLoading === "function") setGlobalLoading(true)
                  router.push(cat.route)
                }}
                onMouseEnter={() => setHovered(cat.key)}
                onMouseLeave={() => setHovered(null)}
                aria-label={cat.name}
              >
                <div className={`mb-6 transition-all duration-200 ${hovered === cat.key ? 'scale-110 drop-shadow-2xl' : 'scale-100'}`}>
                  {cat.icon}
                </div>
                <span className="text-2xl md:text-3xl font-bold text-white drop-shadow mb-3">{cat.name}</span>
                <span className="text-base text-white/80 text-center px-2">{cat.description}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      <style jsx>{`
        .focus\:ring-accent:focus { box-shadow: 0 0 0 4px #38bdf8; }
        .shadow-accent { box-shadow: 0 6px 40px #38bdf833, 0 1.5px 6px #0B0B0B; }
        @media (max-width: 640px) {
          .grid-cols-1 { grid-template-columns: 1fr; }
        }
        @media (min-width: 640px) {
          .grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
        }
        @media (min-width: 768px) {
          .grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
        }
      `}</style>
    </Layout>
  )
}
