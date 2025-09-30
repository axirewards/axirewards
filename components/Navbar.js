import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { FaCoins } from 'react-icons/fa'
import { FiMenu, FiX } from 'react-icons/fi'
import { RiLogoutBoxRLine } from 'react-icons/ri' // logout icon

export default function Navbar({ user, balance = 0, onLogout }) {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const handleDropdown = () => setDropdownOpen((v) => !v)

  const links = [
    { href: '/dashboard', name: 'Dashboard' },
    { href: '/offers', name: 'Offers' },
    { href: '/payout', name: 'Payout' },
    { href: '/profile', name: 'Profile' },
  ]

  const isActive = (path) => router.pathname === path
  const handleLogoClick = (e) => {
    e.preventDefault()
    router.push('/dashboard')
  }

  return (
    <nav className="bg-card text-white px-2 py-3 shadow-xl border-b border-blue-900 sticky top-0 z-40 transition-all">
      <div className="container mx-auto flex items-center justify-between relative">
        {/* Logo kairėje */}
        <a
          href="/dashboard"
          className="flex items-center hover:opacity-90 transition cursor-pointer"
          onClick={handleLogoClick}
        >
          <img src="/icons/logo.png" alt="AxiRewards" className="w-18 h-18 drop-shadow" />
        </a>

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

        {/* User Info & Dropdown + Logout Icon */}
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
                    className="w-full text-left px-4 py-2 hover:bg-blue-50 rounded flex items-center gap-2"
                    onClick={onLogout}
                  >
                    <RiLogoutBoxRLine className="text-xl text-red-600" />
                    Logout
                  </button>
                </div>
              )}
            </div>
            {/* Small logout icon top-right */}
            <button
              onClick={onLogout}
              className="ml-2 p-2 rounded-full hover:bg-red-900/70 transition border border-transparent flex items-center justify-center"
              aria-label="Logout"
              title="Logout"
              style={{ position: 'absolute', top: 14, right: 18 }}
            >
              <RiLogoutBoxRLine className="text-2xl text-red-500 hover:text-white transition" />
            </button>
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
            {/* Logout icon + button for mobile */}
            <button
              className="flex items-center gap-2 px-6 py-2 hover:bg-red-900/70 justify-center mt-2 rounded transition"
              onClick={onLogout}
              aria-label="Logout"
            >
              <RiLogoutBoxRLine className="text-xl text-red-500" />
              Logout
            </button>
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
      `}</style>
    </nav>
  )
}
