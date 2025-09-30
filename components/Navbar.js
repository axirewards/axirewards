import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { FaCoins } from 'react-icons/fa'
import { FiMenu, FiX } from 'react-icons/fi'

// Simulated notification count - replace with Supabase fetch
const useNotifications = (user) => {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (user) {
      // pavyzdžiui, fetch iš supabase naujų payout requests, žinučių ar pan.
      setCount(Math.floor(Math.random() * 3)) // demo
    }
  }, [user])
  return count
}

export default function Navbar({ user, balance = 0, onLogout }) {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const notificationCount = useNotifications(user)

  // Navigacijos nuorodos
  const links = [
    { href: '/dashboard', name: 'Dashboard', icon: null },
    { href: '/offers', name: 'Offers', icon: null },
    {
      href: '/payout',
      name: 'Payout',
      icon: notificationCount > 0 ? (
        <span className="relative">
          {/* Notification badge */}
          <span className="absolute -top-2 -right-2 bg-red-500 rounded-full text-xs px-2 py-0.5 text-white font-bold shadow animate-bounce">
            {notificationCount}
          </span>
        </span>
      ) : null,
    },
    { href: '/profile', name: 'Profile', icon: null },
  ]

  // Helper for active link
  const isActive = (path) => router.pathname === path

  // Dropdown animacijos
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const handleDropdown = () => setDropdownOpen((v) => !v)

  return (
    <nav className="bg-primary text-white px-2 py-3 shadow-xl border-b border-blue-900 sticky top-0 z-40 transition-all">
      <div className="container mx-auto flex items-center justify-between relative">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-extrabold text-2xl tracking-tight hover:opacity-90 transition">
          <img src="/icons/logo.png" alt="AxiRewards" className="w-9 h-9 drop-shadow" />
          <span className="hidden sm:inline">AxiRewards</span>
        </Link>

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
              {link.icon}
            </Link>
          ))}
        </div>

        {/* Avatar per centrą – dabar rodoma visiems tas pats logo */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
          <div className="flex flex-col items-center group">
            <img
              src="/icons/logo.png"
              alt="AxiRewards Logo"
              className="w-10 h-10 rounded-full object-cover border-2 border-accent shadow"
              loading="lazy"
            />
            {user && (
              <span className="text-xs mt-1 opacity-80 text-white hidden sm:block">{user.email}</span>
            )}
          </div>
        </div>

        {/* User Info & Dropdown */}
        {user && (
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-2 bg-accent/30 px-3 py-1 rounded-lg text-sm shadow">
              <FaCoins className="text-yellow-300 animate-spin-slow" />
              <span className="font-bold">{balance}</span>
              <span className="text-xs opacity-70">Points</span>
            </span>
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
              {/* Dropdown */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white text-gray-900 rounded shadow-lg border z-20 animate-dropdownIn">
                  <Link href="/profile" className="block px-4 py-2 hover:bg-blue-50 rounded">Profile</Link>
                  <Link href="/settings" className="block px-4 py-2 hover:bg-blue-50 rounded">Settings</Link>
                  <button
                    className="w-full text-left px-4 py-2 hover:bg-blue-50 rounded"
                    onClick={onLogout}
                  >Logout</button>
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
          <div className="absolute top-full left-0 w-full bg-primary text-white shadow-xl flex flex-col gap-2 py-4 z-50 animate-mobileMenuIn">
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
                {link.icon}
              </Link>
            ))}
            <button className="px-6 py-2 hover:bg-blue-900 text-left" onClick={onLogout}>Logout</button>
          </div>
        )}
      </div>
      {/* Animacijos & custom styles */}
      <style jsx>{`
        .animate-dropdownIn { animation: dropdownIn 0.25s ease; }
        @keyframes dropdownIn { from { opacity: 0; transform: translateY(-10px);} to { opacity: 1; transform: translateY(0);} }
        .animate-mobileMenuIn { animation: mobileMenuIn 0.35s cubic-bezier(.23,1,.32,1); }
        @keyframes mobileMenuIn { from { opacity: 0; transform: translateY(-16px);} to { opacity: 1; transform: translateY(0);} }
        .animate-spin-slow { animation: spin 2s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </nav>
  )
}
