import { useRouter } from 'next/router'
import Layout from '../components/Layout'
import { useState } from 'react'

const categories = [
  {
    key: 'surveys',
    name: 'Surveys',
    description: 'Complete surveys and earn easy rewards!',
    icon: (
      <svg width={36} height={36} fill="none" viewBox="0 0 24 24">
        <path d="M4 7h16M4 12h16M4 17h16" stroke="#38bdf8" strokeWidth={2} strokeLinecap="round" />
      </svg>
    ),
    route: '/surveys',
    tooltip: 'Daily fresh surveys. High payouts!',
    color: 'from-cyan-500 to-blue-700'
  },
  {
    key: 'offerwalls',
    name: 'Offerwalls',
    description: 'Try apps, games, and services. Earn by engaging!',
    icon: (
      <svg width={36} height={36} fill="none" viewBox="0 0 24 24">
        <rect x={4} y={4} width={16} height={16} rx={4} stroke="#fbbf24" strokeWidth={2} />
        <path d="M8 8h8v8H8z" fill="#fbbf24" />
      </svg>
    ),
    route: '/offerwalls',
    tooltip: 'Hundreds of apps & games. Get paid for trying!',
    color: 'from-yellow-400 to-orange-600'
  },
  {
    key: 'rewardedads',
    name: 'Rewarded Ads',
    description: 'Watch short ads and instantly earn coins.',
    icon: (
      <svg width={36} height={36} fill="none" viewBox="0 0 24 24">
        <path d="M5 4v16l14-8-14-8z" stroke="#34d399" strokeWidth={2} strokeLinejoin="round" />
      </svg>
    ),
    route: '/rewardedads',
    tooltip: 'Instant rewards for watching ads!',
    color: 'from-green-400 to-emerald-600'
  },
  {
    key: 'cashback',
    name: 'Cashback',
    description: 'Shop online and get cashback rewards.',
    icon: (
      <svg width={36} height={36} fill="none" viewBox="0 0 24 24">
        <path d="M12 3v18M6 12h12" stroke="#818cf8" strokeWidth={2} strokeLinecap="round" />
      </svg>
    ),
    route: '/cashback',
    tooltip: 'Boost your earnings while shopping!',
    color: 'from-indigo-400 to-blue-800'
  },
  {
    key: 'bonustasks',
    name: 'Bonus Tasks',
    description: 'Special tasks for extra rewards.',
    icon: (
      <svg width={36} height={36} fill="none" viewBox="0 0 24 24">
        <circle cx={12} cy={12} r={10} stroke="#f472b6" strokeWidth={2} />
        <path d="M9 12l2 2 4-4" stroke="#f472b6" strokeWidth={2} strokeLinecap="round" />
      </svg>
    ),
    route: '/bonustasks',
    tooltip: 'Limited time bonus opportunities!',
    color: 'from-pink-400 to-fuchsia-600'
  },
]

export default function Earn() {
  const router = useRouter()
  const [hovered, setHovered] = useState(null)

  return (
    <Layout>
      <div className="min-h-[80vh] flex flex-col justify-center items-center w-full bg-gradient-to-br from-[#0B0B0B] to-[#18181B]">
        <div className="w-full max-w-6xl px-4 py-8">
          <h1 className="text-4xl font-extrabold text-white text-center mb-10 drop-shadow-xl tracking-tight">
            Earn Rewards
          </h1>
          <div className="flex justify-center mb-8">
            <p className="text-lg text-gray-300 text-center max-w-2xl">
              Choose a category to start earning! We offer surveys, apps, ads, cashback, bonus and more. All in one place, modern and simple.
            </p>
          </div>
          {/* Category Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 mt-2 w-full">
            {categories.map(cat => (
              <button
                key={cat.key}
                className={`group relative bg-gradient-to-tr ${cat.color} rounded-2xl shadow-xl flex flex-col items-center justify-between px-4 py-8 transition-all duration-300 hover:scale-[1.04] hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-accent`}
                onClick={() => router.push(cat.route)}
                onMouseEnter={() => setHovered(cat.key)}
                onMouseLeave={() => setHovered(null)}
                aria-label={cat.name}
              >
                <div className="mb-4">{cat.icon}</div>
                <span className="text-xl font-bold text-white drop-shadow mb-1">{cat.name}</span>
                <span className="text-sm text-gray-100 opacity-80">{cat.description}</span>

                {/* Tooltip */}
                <div className={`absolute -top-8 left-1/2 -translate-x-1/2 z-10 pointer-events-none
                  transition-all duration-200 ${hovered === cat.key ? 'opacity-100 scale-105' : 'opacity-0 scale-95'}
                `}>
                  <span className="bg-black/90 text-white text-xs rounded-lg px-3 py-1 shadow-lg border border-accent font-semibold">
                    {cat.tooltip}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
      <style jsx>{`
        .bg-card { background-color: #0B0B0B; }
        .focus\:ring-accent:focus { box-shadow: 0 0 0 4px #38bdf8; }
        @media (max-width: 640px) {
          .grid-cols-1 { grid-template-columns: 1fr; }
        }
        @media (min-width: 640px) {
          .grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
        }
        @media (min-width: 768px) {
          .grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
        }
        @media (min-width: 1024px) {
          .grid-cols-5 { grid-template-columns: repeat(5, 1fr); }
        }
      `}</style>
    </Layout>
  )
}
