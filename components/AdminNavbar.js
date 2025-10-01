import { useState } from "react";
import { useRouter } from "next/router";
import { isAdmin } from "../lib/userUtils";

const NAV_LINKS = [
  { name: "Dashboard", href: "/admin/dashboard" },
  { name: "Ledger", href: "/admin/ledger" },
  { name: "Offers", href: "/admin/offers" },
  { name: "Partners", href: "/admin/partners" },
  { name: "Payout", href: "/admin/payout" },
  { name: "User Tracking", href: "/admin/user-tracking" },
  { name: "Users", href: "/admin/users" },
];

export default function AdminNavbar({ user }) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  // Only show to admin
  if (!isAdmin(user)) return null;

  const isActive = (href) => {
    // Exact active match for nav highlighting
    return router.pathname === href;
  };

  return (
    <nav className="w-full z-30">
      {/* Desktop nav */}
      <div className="hidden md:flex w-full bg-black text-white items-center justify-center whitespace-nowrap border-b border-gray-900 shadow-md"
        style={{ minHeight: "42px" }}>
        <div className="flex w-full max-w-7xl mx-auto gap-1 justify-center">
          {NAV_LINKS.map((link) => (
            <button
              key={link.href}
              onClick={() => router.push(link.href)}
              className={`relative px-4 py-2 font-bold text-sm tracking-wide rounded transition
                ${isActive(link.href)
                  ? "bg-accent text-black shadow border-b-2 border-accent"
                  : "hover:bg-gray-900 hover:text-accent"}
                `}
              style={{
                minWidth: "100px",
                letterSpacing: "0.02em",
              }}
            >
              {link.name}
              {isActive(link.href) && (
                <span className="absolute left-0 right-0 -bottom-[2px] h-[2px] bg-accent rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>
      {/* Mobile nav */}
      <div className="md:hidden flex w-full bg-black text-white items-center justify-between px-2 h-12 border-b border-gray-900 shadow-md">
        <div className="font-bold text-sm tracking-wide">Admin</div>
        <button
          className="text-white text-2xl px-2"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Open admin menu"
        >
          ☰
        </button>
        <div
          className={`absolute top-12 left-0 w-full bg-black border-t border-gray-900 shadow-xl transition-all
            ${menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
          `}
        >
          <div className="flex flex-col py-2 gap-1 w-full">
            {NAV_LINKS.map((link) => (
              <button
                key={link.href}
                onClick={() => {
                  setMenuOpen(false);
                  router.push(link.href);
                }}
                className={`w-full text-left px-5 py-3 font-bold text-md tracking-wide rounded transition
                  ${isActive(link.href)
                    ? "bg-accent text-black shadow border-l-4 border-accent"
                    : "hover:bg-gray-900 hover:text-accent"}
                  `}
              >
                {link.name}
              </button>
            ))}
          </div>
        </div>
      </div>
      <style jsx>{`
        nav {
          position: relative;
        }
        .bg-accent {
          background-color: #60A5FA;
        }
        .text-accent {
          color: #60A5FA;
        }
      `}</style>
    </nav>
  );
}
