import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { FaCoins } from 'react-icons/fa'
import { FiMenu, FiX } from 'react-icons/fi'
import { supabase } from '../lib/supabaseClient'

export default function Navbar({ user, onLogout }) {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [pointsBalance, setPointsBalance] = useState(null)

  const handleDropdown = () => setDropdownOpen((v) => !v)

  // Get points_balance from Supabase users table (using user.email)
  useEffect(() => {
    async function fetchBalance() {
      if (user?.email) {
        const { data, error } = await supabase
          .from('users')
          .select('points_balance')
          .eq('email', user.email)
          .single()
        if (!error && data && typeof data.points_balance !== 'undefined') {
          setPointsBalance(parseInt(data.points_balance, 10))
        } else {
          setPointsBalance(0)
        }
      }
    }
    fetchBalance()
  }, [user?.email])

  const links = [
    { href: '/dashboard', name: 'Dashboard' },
    { href: '/earn', name: 'Earn' },
    { href: '/payout', name: 'Payout' },
    { href: '/profile', name: 'Profile' },
  ]

  const isActive = (path) => router.pathname === path
  const handleLogoClick = (e) => {
    e.preventDefault()
    router.push('/dashboard')
  }

  // The required logout logic with supabase and router.push
  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
    if (onLogout) onLogout()
  }

  // Fancy points-balance badge, responsive for PC and mobile
  const PointsBadge = () => (
    <span className="points-badge flex items-center gap-2 px-3 py-1 rounded-full shadow font-semibold"
      style={{
        background: 'linear-gradient(90deg,#2563eb 0%,#60a5fa 100%)',
        color: '#fff',
        boxShadow: '0 2px 12px 0 #2563eb22',
        border: '1.5px solid #2563eb',
        fontSize: '1.15rem',
        letterSpacing: '0.05em',
        minWidth: 82,
        justifyContent: 'center'
      }}
    >
      <FaCoins className="text-yellow-300 animate-spin-slow" style={{ fontSize: '1.35em' }} />
      <span className="font-extrabold text-shadow">{pointsBalance ?? '...'}</span>
      <span className="text-xs opacity-80 font-bold" style={{ marginLeft: 2 }}>Points</span>
    </span>
  )

  return (
    <nav className="bg-card text-white px-2 py-3 shadow-xl border-b border-blue-900 sticky top-0 z-40 transition-all">
      <div className="container mx-auto flex items-center justify-between relative">
        {/* Logo kairėje - be teksto ir dar 10% didesnis */}
        <div className="flex items-center">
          <a
            href="/dashboard"
            className="flex items-center hover:opacity-90 transition cursor-pointer"
            onClick={handleLogoClick}
          >
            <img src="/icons/logo.png" alt="AxiRewards" className="w-18 h-18 drop-shadow" />
          </a>
          {/* Points badge: always left of navigation (PC and mobile) */}
          {user && (
            <div className="ml-4 flex items-center">
              <PointsBadge />
            </div>
          )}
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {links.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={`relative px-3 py-2 rounded-lg font-semibold transition-all duration-200 ${
                isActive(link.href)
                  ? 'bg-accent text-white shadow-md scale-105'
                  : 'hover:bg-blue-800/80 hover:scale-105 text-white/90'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* User Info & Dropdown */}
        {user && (
          <div className="flex items-center gap-4">
            {/* Dropdown */}
            <div className="relative">
              <button
                className="flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-white font-semibold hover:bg-accent transition outline-none focus:ring-2 focus:ring-accent"
                onClick={handleDropdown}
                aria-haspopup="true"
                aria-expanded={dropdownOpen}
              >
                <span className="hidden sm:inline">More</span>
                <svg width="16" height="16" fill="currentColor" className={`ml-1 transform transition ${dropdownOpen ? 'rotate-180' : ''}`}><path d="M4 6l4 4 4-4" /></svg>
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white text-gray-900 rounded shadow-lg border z-20 animate-dropdownIn">
                  <Link href="/profile" className="block px-4 py-2 hover:bg-blue-50 rounded">Profile</Link>
                  <Link href="/settings" className="block px-4 py-2 hover:bg-blue-50 rounded">Settings</Link>
                  <button
                    className="w-full text-left px-4 py-2 hover:bg-blue-50 rounded"
                    onClick={async () => {
                      setDropdownOpen(false)
                      await handleLogout()
                    }}
                  >Logout</button>
                  {/* On mobile: show points badge in dropdown */}
                  <div className="block md:hidden px-4 py-3">
                    <PointsBadge />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Burger menu for mobile */}
        <button
          className="md:hidden ml-2 p-2 rounded bg-blue-800/50 hover:bg-blue-800/80 transition border border-blue-900"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? 'Close Menu' : 'Open Menu'}
        >
          {menuOpen ? <FiX size={28} /> : <FiMenu size={28} />}
        </button>
        {/* Mobile menu */}
        {menuOpen && (
          <div className="absolute top-full left-0 w-full bg-card text-white shadow-xl flex flex-col gap-2 py-4 z-50 animate-mobileMenuIn">
            <div className="flex items-center justify-center mb-2">
              <img src="/icons/logo.png" alt="AxiRewards" className="w-18 h-18 drop-shadow" />
            </div>
            {/* Mobile: show points badge on top */}
            <div className="flex items-center justify-center mb-3">
              <PointsBadge />
            </div>
            {links.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`px-6 py-2 rounded-lg transition ${
                  isActive(link.href) ? 'bg-accent text-white shadow-md scale-105' : 'hover:bg-blue-900'
                }`}
                onClick={() => setMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <button className="px-6 py-2 hover:bg-blue-900 text-left" onClick={handleLogout}>Logout</button>
          </div>
        )}
      </div>
      {/* Animacijos & custom styles */}
      <style jsx>{`
        .w-18 { width: 4.95rem; }
        .h-18 { height: 4.95rem; }
        .animate-dropdownIn { animation: dropdownIn 0.25s ease; }
        @keyframes dropdownIn { from { opacity: 0; transform: translateY(-10px);} to { opacity: 1; transform: translateY(0);} }
        .animate-mobileMenuIn { animation: mobileMenuIn 0.35s cubic-bezier(.23,1,.32,1); }
        @keyframes mobileMenuIn { from { opacity: 0; transform: translateY(-16px);} to { opacity: 1; transform: translateY(0);} }
        .animate-spin-slow { animation: spin 2s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .points-badge {
          box-shadow: 0 2px 12px 0 #2563eb22;
          background: linear-gradient(90deg,#2563eb 0%,#60a5fa 100%);
          border: 1.5px solid #2563eb;
        }
        .text-shadow {
          text-shadow: 0 1px 2px #0002, 0 0px 1px #fff1;
        }
      `}</style>
    </nav>
  )
}
