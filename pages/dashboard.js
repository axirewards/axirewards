import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Layout from "../components/Layout";
import AyetOfferwall from "../components/AyetOfferwall";
import BitLabsOfferwall from "../components/BitLabsOfferwall";
import CpxOfferwall from "../components/CpxOfferwall";
import TheoremOfferwall from "../components/TheoremOfferwall";
import { supabase } from "../lib/supabaseClient";
import { v4 as uuidv4 } from "uuid";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
// You'd want to add these new luxury UI components:
import ParticleBackground from "../components/ParticleBackground";
import PremiumBadge from "../components/PremiumBadge";
import VIPTierProgress from "../components/VIPTierProgress";
import AchievementWall from "../components/AchievementWall";
import UserStatsTimeline from "../components/UserStatsTimeline";
import OfferwallCarousel from "../components/OfferwallCarousel";
import AXILoader from "../components/AXILoader";
import FloatingActionButton from "../components/FloatingActionButton";

const OFFERWALLS = [
  // ... kaip buvo
];

export default function Dashboard({ setGlobalLoading }) {
  // ... kaip buvo su states ir useEffect

  // Luxury mobile nav (sticky/floating)
  const [showFAB, setShowFAB] = useState(false);

  useEffect(() => {
    // Show floating action button only on mobile
    if (window.innerWidth < 700) setShowFAB(true);
  }, []);

  return (
    <Layout>
      {/* Animated Luxury Particle Background */}
      <ParticleBackground type="waves-coins" />
      {/* Main ultra-luxury container */}
      <div className="flex flex-col items-center justify-center min-h-[90vh] w-full">
        {/* Centered glassmorphism, max 560px width */}
        <div
          className="relative bg-gradient-to-br from-[#2C3E50aa] via-[#34495Edd] to-[#000000ee] rounded-3xl shadow-2xl border border-accent backdrop-blur-xl p-6 md:p-12"
          style={{
            maxWidth: "560px",
            width: "94vw",
            marginTop: "42px",
            marginBottom: "42px",
            boxShadow: "0 8px 48px 0 #60A5fa44, 0 2px 12px 0 #60A5fa66",
            border: "3px solid #60A5FA33",
          }}
        >
          {/* Luxury Premium Badge & Avatar */}
          <div className="flex flex-col items-center mb-8 gap-3">
            <PremiumBadge type={user?.tier >= 5 ? "diamond" : user?.tier >= 3 ? "gold" : "silver"} />
            <img
              src={user?.avatar_url || "/icons/avatar-default.svg"}
              alt="Avatar"
              className="w-20 h-20 rounded-full border-4 border-accent shadow-xl"
              style={{ boxShadow: "0 2px 24px 0 #60A5fa44" }}
            />
            <div className="text-2xl font-extrabold text-white">{user?.display_name || user?.email}</div>
            <div className="flex items-center gap-2">
              <VIPTierProgress tier={user?.tier || 1} points={user?.points_balance || 0} />
              <span className="px-3 py-1 rounded-full bg-gradient-to-r from-accent to-secondary text-white font-bold shadow-lg animate-pulse">
                VIP {user?.tier || 1}
              </span>
            </div>
          </div>

          {/* Luxury Statistic Cards */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 mb-10">
            <StatsCard title="Balance" value={user?.points_balance || 0} unit="AXI" icon="/icons/coin.svg" animateConfetti />
            <StatsCard title="Daily Streak" value={streak} unit="🔥" icon="/icons/fire.svg" animatePulse />
            <StatsCard title="VIP Tier" value={user?.tier || 1} unit="🏆" icon="/icons/vip.svg" animateShine />
            <StatsCard title="Best Streak" value={user?.best_streak || streak} unit="days" icon="/icons/trophy.svg" animateSparkle />
          </div>

          {/* Animated User Balance History */}
          <div className="rounded-2xl glass-card p-5 mb-8 border-2 border-accent shadow-xl">
            <h3 className="text-lg font-bold text-accent mb-2">Balance History</h3>
            {ledger.length > 0 ? (
              <ResponsiveContainer width="100%" height={80}>
                <LineChart data={ledger}>
                  <XAxis dataKey="created_at" hide />
                  <YAxis hide domain={['auto', 'auto']} />
                  <Tooltip />
                  <Line type="monotone" dataKey="balance_after" stroke="#60A5FA" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <AXILoader text="No balance history yet..." />
            )}
          </div>

          {/* Luxury Achievement Wall */}
          <AchievementWall achievements={user?.achievements || []} />

          {/* User Statistics Timeline */}
          <UserStatsTimeline stats={user?.stats || []} />

          {/* Offerwall Preview Karuselė */}
          <OfferwallCarousel offerwalls={filteredOfferwalls} onOpen={setActiveOfferwall} />

        </div>

        {/* Super luxury floating button (mobile) */}
        {showFAB && <FloatingActionButton />}

        {/* Modal offerwall open */}
        {activeOfferwall && (
          <div className="fixed inset-0 z-[1001] bg-black/80 flex items-center justify-center backdrop-blur">
            <div className="glass-card rounded-3xl shadow-2xl border-4 border-accent max-w-3xl w-full p-8 flex flex-col items-center relative animate-fade-in">
              <button
                className="absolute top-4 right-6 text-accent text-4xl font-extrabold hover:text-blue-700 transition"
                onClick={() => setActiveOfferwall(null)}
                aria-label="Close"
              >
                &times;
              </button>
              {activeOfferwall === "ayet" && (
                <AyetOfferwall adSlot={OFFERWALLS.find(w => w.key === "ayet").adSlot} height="700px" />
              )}
              {activeOfferwall === "bitlabs" && (
                <BitLabsOfferwall apiKey={OFFERWALLS.find(w => w.key === "bitlabs").apiKey} height="700px" />
              )}
              {activeOfferwall === "cpx" && (
                <CpxOfferwall appId={OFFERWALLS.find(w => w.key === "cpx").appId} height="700px" />
              )}
              {activeOfferwall === "theorem" && (
                <TheoremOfferwall appId={OFFERWALLS.find(w => w.key === "theorem").appId} height="700px" />
              )}
            </div>
          </div>
        )}
      </div>
      <style jsx>{`
        .glass-card {
          background: rgba(24, 32, 56, 0.86);
          backdrop-filter: blur(22px);
          border-radius: 1.5rem;
          box-shadow: 0 2px 32px 0 #60A5fa22, 0 1.5px 8px 0 #60A5fa33;
          border: 2.5px solid #60A5FA55;
        }
        .animate-fade-in {
          animation: fadeInModal 0.28s cubic-bezier(.23,1,.32,1);
        }
        @keyframes fadeInModal {
          from { opacity: 0; transform: scale(0.98);}
          to { opacity: 1; transform: scale(1);}
        }
        /* Add more luxury effects, gradients, sparkles, pulses */
      `}</style>
    </Layout>
  );
}

// Example luxury card component
function StatsCard({ title, value, unit, icon, animateConfetti, animatePulse, animateShine, animateSparkle }) {
  return (
    <div
      className={`glass-card flex flex-col items-center justify-center py-6 px-4 border border-accent shadow-xl transition-all duration-400 hover:scale-105`}
      style={{
        minWidth: "180px",
        maxWidth: "100%",
        boxShadow: "0 2px 16px 0 #60A5fa22",
        position: "relative",
      }}
    >
      <img src={icon} alt={title} className="w-10 h-10 mb-2" />
      <h4 className="text-lg font-bold text-white mb-1">{title}</h4>
      <span className="text-3xl font-extrabold text-accent">{value}</span>
      <span className="text-md text-secondary">{unit}</span>
      {/* Confetti/sparkle/pulse/shine effects */}
      {animateConfetti && <span className="absolute top-2 right-2 confetti" />}
      {animatePulse && <span className="absolute bottom-2 left-2 pulse" />}
      {animateShine && <span className="absolute bottom-2 right-2 shine" />}
      {animateSparkle && <span className="absolute top-2 left-2 sparkle" />}
    </div>
  );
}
