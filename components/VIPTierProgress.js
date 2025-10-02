import React from "react";

/**
 * Ultra luxury, responsive, animated VIP Tier Progress Bar.
 * Perfectly adapts for PC and mobile, colors and layout, text fits nicely.
 * Props: tier (number), points (number), email (string, optional)
 */
export default function VIPTierProgress({ tier = 1, points = 0, email = "" }) {
  // Tier thresholds, can be dynamic or fetched from DB.
  const tiers = [
    { level: 1, name: "Bronze", color: "#2C3E50", accent: "#60A5FA", threshold: 0, icon: "/icons/bronze.svg" },
    { level: 2, name: "Silver", color: "#dbeafe", accent: "#60A5FA", threshold: 1000, icon: "/icons/silver.svg" },
    { level: 3, name: "Gold", color: "#FFD700", accent: "#B6862C", threshold: 5000, icon: "/icons/gold.svg" },
    { level: 4, name: "Platinum", color: "#7b6cfb", accent: "#B0B1F6", threshold: 15000, icon: "/icons/platinum.svg" },
    { level: 5, name: "Diamond", color: "#8fdafd", accent: "#42E0FF", threshold: 50000, icon: "/icons/diamond.svg" },
  ];

  const currentTier = tiers.find(t => t.level === tier) || tiers[0];
  const nextTier = tiers[tier] || null;
  const progress = nextTier
    ? Math.min(100, ((points - currentTier.threshold) / (nextTier.threshold - currentTier.threshold)) * 100)
    : 100;

  // Responsive sizing
  const isMobile = typeof window !== "undefined" && window.innerWidth < 700;
  const barWidth = isMobile ? "98vw" : "320px";
  const barHeight = isMobile ? "16px" : "18px";

  return (
    <div className="w-full flex flex-col items-center justify-center mb-2">
      <div className="w-full flex flex-row items-center justify-between mb-1 px-2"
        style={{
          maxWidth: barWidth,
        }}
      >
        {/* Tier Icon */}
        <img
          src={currentTier.icon}
          alt={currentTier.name + " icon"}
          style={{
            width: isMobile ? 22 : 26,
            height: isMobile ? 22 : 26,
            marginRight: 6,
            filter: "drop-shadow(0 0 7px " + currentTier.accent + ")",
          }}
        />
        {/* Tier Name */}
        <span
          className="px-2 py-1 rounded-lg font-bold text-sm"
          style={{
            background: `linear-gradient(90deg, ${currentTier.color}bb, ${nextTier ? nextTier.color : currentTier.color}bb)`,
            color: "#fff",
            minWidth: isMobile ? "70px" : "90px",
            textAlign: "center",
            fontSize: isMobile ? "0.95rem" : "1.07rem",
            boxShadow: "0 2px 12px #60A5fa33",
            letterSpacing: "0.03em",
          }}
        >
          {currentTier.name}
        </span>
        {/* User Email (tiny, ellipsis) */}
        {email && (
          <span
            className="ml-2 px-2 py-1 rounded bg-[#181e38] text-gray-400 font-semibold truncate"
            style={{
              maxWidth: isMobile ? "80px" : "140px",
              fontSize: isMobile ? "0.67rem" : "0.75rem",
              letterSpacing: "0.01em",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
            title={email}
          >
            {email}
          </span>
        )}
        {/* Points */}
        <span className="text-xs text-accent font-bold ml-2">
          {points} AXI
        </span>
        {/* Next tier label or MAX */}
        <span className="text-xs text-secondary font-bold ml-2">
          {nextTier ? `→ ${nextTier.name}` : "MAX"}
        </span>
      </div>
      {/* Progress Bar */}
      <div
        className="relative rounded-full border border-accent shadow-inner overflow-hidden"
        style={{
          width: barWidth,
          height: barHeight,
          background: "linear-gradient(90deg,#181e38 0%,#202e49 100%)",
          marginTop: "4px",
        }}
      >
        {/* Animated gradient progress */}
        <div
          className="absolute top-0 left-0 h-full rounded-full transition-all duration-800"
          style={{
            width: `${progress}%`,
            background: `linear-gradient(90deg, ${currentTier.accent}, ${nextTier ? nextTier.accent : currentTier.accent})`,
            boxShadow: "0 2px 18px " + currentTier.accent + "44",
            animation: "progressGlow 1.2s ease-in-out infinite alternate",
          }}
        />
        {/* Sparkle at the end of progress */}
        <div
          className="absolute top-1/2"
          style={{
            left: `calc(${progress}% - 11px)`,
            transform: "translateY(-50%)",
            opacity: progress > 8 ? 1 : 0,
          }}
        >
          <svg width={isMobile ? 16 : 18} height={isMobile ? 16 : 18} viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="5" fill={currentTier.accent} opacity="0.45"/>
            <circle cx="10" cy="10" r="3" fill="#fff" opacity="0.22"/>
          </svg>
        </div>
      </div>
      {/* Tier Progress Label */}
      <div className="w-full flex justify-end px-2 mt-2"
        style={{ maxWidth: barWidth }}>
        <span className="text-xs text-gray-400 font-semibold">
          {nextTier
            ? `Next: ${nextTier.name} at ${nextTier.threshold} AXI`
            : "You have reached the maximum VIP tier!"}
        </span>
      </div>
      <style jsx>{`
        @keyframes progressGlow {
          0% { box-shadow: 0 0 8px ${currentTier.accent}44; }
          100% { box-shadow: 0 0 24px ${currentTier.accent}99; }
        }
        @media (max-width: 700px) {
          .progress-bar {
            height: 16px !important;
            min-width: 90vw !important;
          }
        }
      `}</style>
    </div>
  );
}
