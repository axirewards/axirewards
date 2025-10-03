import { useState, useEffect } from 'react'
import Layout from '../Layout'

const categories = [
  {
    key: 'surveys',
    name: 'Surveys',
    description: 'Earn by completing surveys from top providers.',
    icon: (
      <svg width={44} height={44} fill="none" viewBox="0 0 24 24">
        <path d="M4 7h16M4 12h16M4 17h16" stroke="#38bdf8" strokeWidth={2.5} strokeLinecap="round" />
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
      <svg width={44} height={44} fill="none" viewBox="0 0 24 24">
        <rect x={4} y={4} width={16} height={16} rx={4} stroke="#fbbf24" strokeWidth={2.5} />
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
      <svg width={44} height={44} fill="none" viewBox="0 0 24 24">
        <path d="M5 4v16l14-8-14-8z" stroke="#34d399" strokeWidth={2.5} strokeLinejoin="round" />
      </svg>
    ),
    route: '/rewardedads',
    color: 'from-green-400 to-emerald-600'
  }
]

export default function EarnPc({ setGlobalLoading, router }) {
  const [hovered, setHovered] = useState(null)

  useEffect(() => {
    if (typeof setGlobalLoading === "function") setGlobalLoading(true)
    const timer = setTimeout(() => {
      if (typeof setGlobalLoading === "function") setGlobalLoading(false)
    }, 300)
    return () => clearTimeout(timer)
  }, [setGlobalLoading])

  return (
    <Layout>
      {/* Premium zoom-out and lifted content for PC */}
      <div className="min-h-[80vh] w-full flex flex-col items-center justify-start" style={{ zoom: 0.88 }}>
        <div className="w-full max-w-7xl pt-8 pb-14 px-6">
          <h1 className="text-5xl font-extrabold text-white text-center mb-12 drop-shadow-xl tracking-tight"
            style={{
              background: "linear-gradient(90deg, #60A5FA 0%, #7b6cfb 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              color: "transparent",
              letterSpacing: "0.04em",
              boxShadow: "0 2px 24px #60A5fa22"
            }}>
            Earn Rewards
          </h1>
          <div className="flex justify-center mb-10">
            <p className="text-2xl text-zinc-300 text-center max-w-3xl font-medium"
              style={{
                background: "rgba(24,32,56,0.82)",
                borderRadius: "1.2rem",
                padding: "8px 24px",
                boxShadow: "0 2px 14px #60A5fa22"
              }}>
              Choose your earning method. Surveys, apps, ads – everything in one place, with a seamless Axirewards experience.
            </p>
          </div>
          {/* Categories */}
          <div className="grid grid-cols-3 gap-12 w-full">
            {categories.map(cat => (
              <button
                key={cat.key}
                className={`group relative bg-gradient-to-tr ${cat.color} rounded-3xl shadow-2xl flex flex-col items-center justify-center px-8 py-16 transition-all duration-200
                  hover:scale-[1.05] hover:shadow-accent focus:outline-none focus:ring-4 focus:ring-accent
                  ${hovered === cat.key ? 'ring-4 ring-accent/60' : ''}
                `}
                onClick={() => {
                  if (typeof setGlobalLoading === "function") setGlobalLoading(true)
                  router.push(cat.route)
                }}
                onMouseEnter={() => setHovered(cat.key)}
                onMouseLeave={() => setHovered(null)}
                aria-label={cat.name}
                style={{
                  boxShadow: hovered === cat.key
                    ? "0 8px 44px #38bdf8cc, 0 1.5px 8px #0B0B0B"
                    : "0 6px 32px #38bdf833, 0 1.5px 6px #0B0B0B"
                }}
              >
                <div className={`mb-8 transition-all duration-200 ${hovered === cat.key ? 'scale-110 drop-shadow-2xl' : 'scale-100'}`}>
                  {cat.icon}
                </div>
                <span className="text-3xl font-bold text-white drop-shadow mb-4">{cat.name}</span>
                <span className="text-lg text-white/80 text-center px-2">{cat.description}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      <style jsx>{`
        .focus\:ring-accent:focus { box-shadow: 0 0 0 4px #38bdf8; }
        .shadow-accent { box-shadow: 0 6px 40px #38bdf833, 0 1.5px 6px #0B0B0B; }
        @media (max-width: 1024px) {
          .grid-cols-3 { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 700px) {
          .grid-cols-3 { grid-template-columns: 1fr; }
        }
      `}</style>
    </Layout>
  )
}
