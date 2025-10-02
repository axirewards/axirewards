import React from "react";

/**
 * UserStatsVip – one luxury responsive row with 4 cubes:
 * 1: VIP Tier (with progress bar, color and status text)
 * 2: Points Balance (with coin icon)
 * 3: Daily Streak (with fire icon)
 * 4: Completed Offers (with check icon)
 * All cubes use unified glass/card style. 
 * All logic handled inside, no child components.
 * Props: tier, points, streak, completedOffers
 */
const TIER_INFO = [
  { level: 1, name: "Bronze", color: "#A66B3B", bg: "linear-gradient(135deg,#232e40 0%,#A66B3B 120%)" },
  { level: 2, name: "Silver", color: "#bfcbdc", bg: "linear-gradient(135deg,#232e40 0%,#bfcbdc 120%)" },
  { level: 3, name: "Gold", color: "#FFD700", bg: "linear-gradient(135deg,#232e40 0%,#FFD700 120%)" },
  { level: 4, name: "Platinum", color: "#7b6cfb", bg: "linear-gradient(135deg,#232e40 0%,#7b6cfb 120%)" },
  { level: 5, name: "Diamond", color: "#8fdafd", bg: "linear-gradient(135deg,#232e40 0%,#8fdafd 120%)" },
];

export default function UserStatsVip({
  tier = 1,
  points = 0,
  streak = 0,
  completedOffers = 0
}) {
  // VIP Progress logic
  const currentTier = TIER_INFO.find(t => t.level === tier) || TIER_INFO[0];
  const nextTier = TIER_INFO[tier] || null;
  const thresholds = [0, 1000, 5000, 15000, 50000, 999999];
  const progress = nextTier
    ? Math.min(100, ((points - thresholds[tier - 1]) / (thresholds[tier] - thresholds[tier - 1])) * 100)
    : 100;

  // Responsive sizing
  const isMobile = typeof window !== "undefined" ? window.innerWidth < 700 : false;
  const cubeSize = isMobile ? "90vw" : "220px";
  const iconSize = isMobile ? 32 : 44;
  const barWidth = isMobile ? "74vw" : "160px";
  const barHeight = isMobile ? "7px" : "9px";

  return (
    <div
      className="userstatsvip-row w-full flex flex-col md:flex-row items-center justify-center gap-7 md:gap-9"
      style={{ maxWidth: isMobile ? "97vw" : "900px", margin: "0 auto" }}
    >
      {/* VIP Tier Cube */}
      <div
        className="userstatsvip-cube glass-card flex flex-col items-center justify-center py-6 px-3 shadow-xl border-2 transition-all"
        style={{
          minWidth: cubeSize,
          maxWidth: cubeSize,
          background: currentTier.bg,
          borderColor: currentTier.color,
          borderRadius: "1.4rem",
          boxShadow: `0 0 24px 0 ${currentTier.color}44`,
        }}
      >
        <span
          className="font-extrabold text-lg mb-2"
          style={{
            color: currentTier.color,
            textShadow: `0 1px 6px ${currentTier.color}88, 0 1px 1px #181e38`,
            letterSpacing: "0.06em"
          }}
        >
          {currentTier.name} VIP
        </span>
        {/* Progress bar, much smaller */}
        <div
          className="relative rounded-full w-full shadow-inner mt-2 mb-1"
          style={{
            width: barWidth,
            height: barHeight,
            background: "linear-gradient(90deg,#181e38 0%,#202e49 100%)",
            overflow: "hidden",
          }}
        >
          <div
            className="absolute top-0 left-0 h-full rounded-full transition-all duration-800"
            style={{
              width: `${progress}%`,
              background: `linear-gradient(90deg, ${currentTier.color}, ${nextTier ? nextTier.color : currentTier.color})`,
              boxShadow: `0 2px 12px ${currentTier.color}44`,
              animation: "progressGlow 1.2s ease-in-out infinite alternate",
            }}
          />
        </div>
        <span className="text-xs text-white mt-2 font-semibold">{points} AXI</span>
        <span className="text-xs text-gray-400 mt-2 font-semibold text-center">
          {nextTier
            ? `Next: ${nextTier.name} at ${thresholds[tier]} AXI`
            : "Max VIP reached"}
        </span>
      </div>
      {/* Points Balance Cube */}
      <div
        className="userstatsvip-cube glass-card flex flex-col items-center justify-center py-6 px-3 shadow-xl border-2 transition-all"
        style={{
          minWidth: cubeSize,
          maxWidth: cubeSize,
          borderColor: "#60A5FA",
          borderRadius: "1.4rem",
          background: "linear-gradient(135deg,#232e40 0%,#60A5FA 120%)",
          boxShadow: "0 0 24px 0 #60A5FA44",
        }}
      >
        <img src="/icons/coin.svg" alt="Points" style={{ width: iconSize, height: iconSize, marginBottom: 12 }} />
        <span className="font-extrabold text-lg mb-2 text-accent">Points Balance</span>
        <span className="text-3xl font-extrabold text-white">{points}</span>
        <span className="text-xs text-accent font-semibold mt-2">AXI</span>
      </div>
      {/* Daily Streak Cube */}
      <div
        className="userstatsvip-cube glass-card flex flex-col items-center justify-center py-6 px-3 shadow-xl border-2 transition-all"
        style={{
          minWidth: cubeSize,
          maxWidth: cubeSize,
          borderColor: "#FF6A3D",
          borderRadius: "1.4rem",
          background: "linear-gradient(135deg,#232e40 0%,#FF6A3D 120%)",
          boxShadow: "0 0 24px 0 #FF6A3D44",
        }}
      >
        <img src="/icons/fire.svg" alt="Streak" style={{ width: iconSize, height: iconSize, marginBottom: 12 }} />
        <span className="font-extrabold text-lg mb-2" style={{ color: "#FF6A3D" }}>Daily Streak</span>
        <span className="text-3xl font-extrabold text-white">{streak}</span>
        <span className="text-xs text-orange-300 font-semibold mt-2">🔥 Days</span>
      </div>
      {/* Completed Offers Cube */}
      <div
        className="userstatsvip-cube glass-card flex flex-col items-center justify-center py-6 px-3 shadow-xl border-2 transition-all"
        style={{
          minWidth: cubeSize,
          maxWidth: cubeSize,
          borderColor: "#5AF599",
          borderRadius: "1.4rem",
          background: "linear-gradient(135deg,#232e40 0%,#5AF599 120%)",
          boxShadow: "0 0 24px 0 #5AF59944",
        }}
      >
        <img src="/icons/check.svg" alt="Completed" style={{ width: iconSize, height: iconSize, marginBottom: 12 }} />
        <span className="font-extrabold text-lg mb-2" style={{ color: "#5AF599" }}>Completed Offers</span>
        <span className="text-3xl font-extrabold text-white">{completedOffers}</span>
        <span className="text-xs text-green-300 font-semibold mt-2">Offers</span>
      </div>
      <style jsx>{`
        .glass-card {
          background: rgba(24, 32, 56, 0.90);
          backdrop-filter: blur(18px);
          border-radius: 1.25rem;
        }
        .userstatsvip-row {
          margin-bottom: 30px;
        }
        @media (max-width: 900px) {
          .userstatsvip-row {
            flex-direction: column !important;
            gap: 18px !important;
          }
          .userstatsvip-cube {
            min-width: 95vw !important;
            max-width: 97vw !important;
            margin: 0 auto !important;
          }
        }
        @keyframes progressGlow {
          0% { box-shadow: 0 0 8px #A66B3B44; }
          100% { box-shadow: 0 0 24px #FFD70099; }
        }
      `}</style>
    </div>
  );
}
