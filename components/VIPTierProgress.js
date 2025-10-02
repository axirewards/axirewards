import React from "react";

/**
 * Ultra luxury, fully responsive animated VIP Tier Progress Bar.
 * No badge in remelyje, avatar left for dashboard.
 * Tier icon next to label (small), true bronze color, compact progress bar.
 * Everything centered, ideal for PC and mobile.
 */
export default function VIPTierProgress({ tier = 1, points = 0, email = "" }) {
  // Tier thresholds, icons, colors
  const tiers = [
    { level: 1, name: "Bronze", color: "#8C4A2F", accent: "#A66B3B", threshold: 0, icon: "/icons/bronze.svg", border: "#A66B3B" },
    { level: 2, name: "Silver", color: "#dbeafe", accent: "#60A5FA", threshold: 1000, icon: "/icons/silver.svg", border: "#bfcbdc" },
    { level: 3, name: "Gold", color: "#FFD700", accent: "#B6862C", threshold: 5000, icon: "/icons/gold.svg", border: "#FFD700" },
    { level: 4, name: "Platinum", color: "#7b6cfb", accent: "#B0B1F6", threshold: 15000, icon: "/icons/platinum.svg", border: "#7b6cfb" },
    { level: 5, name: "Diamond", color: "#8fdafd", accent: "#42E0FF", threshold: 50000, icon: "/icons/diamond.svg", border: "#8fdafd" },
  ];

  const currentTier = tiers.find(t => t.level === tier) || tiers[0];
  const nextTier = tiers[tier] || null;
  const progress = nextTier
    ? Math.min(100, ((points - currentTier.threshold) / (nextTier.threshold - currentTier.threshold)) * 100)
    : 100;

  // Responsive sizing
  const isMobile = typeof window !== "undefined" ? window.innerWidth < 700 : false;
  const barWidth = isMobile ? "92vw" : "260px";
  const barHeight = isMobile ? "9px" : "11px";
  const iconSize = isMobile ? 18 : 20;

  return (
    <div className="w-full flex flex-col items-center justify-center mb-2">
      {/* Tier line: icon + label + email + points + next */}
      <div
        className="flex flex-row items-center justify-center w-full gap-2"
        style={{ maxWidth: barWidth }}
      >
        {/* Tier Icon small next to label */}
        <img
          src={currentTier.icon}
          alt={currentTier.name + " icon"}
          style={{
            width: iconSize,
            height: iconSize,
            marginRight: 6,
            display: "inline-block",
            filter: `drop-shadow(0 0 5px ${currentTier.accent})`,
            verticalAlign: "middle",
          }}
        />
        <span
          className="rounded-lg font-bold text-sm flex items-center"
          style={{
            background: `linear-gradient(90deg, ${currentTier.border}bb 0%, ${currentTier.color} 100%)`,
            color: "#fff",
            minWidth: isMobile ? "62px" : "80px",
            textAlign: "center",
            fontSize: isMobile ? "0.94rem" : "1.02rem",
            boxShadow: "0 2px 12px #232e4044",
            letterSpacing: "0.03em",
            padding: "4px 10px",
            marginRight: "4px",
            display: "inline-block",
          }}
        >
          {currentTier.name}
        </span>
        {/* Email (small, ellipsis) */}
        {email && (
          <span
            className="rounded bg-[#181e38] text-gray-400 font-semibold truncate ml-1"
            style={{
              maxWidth: isMobile ? "60px" : "100px",
              fontSize: isMobile ? "0.62rem" : "0.69rem",
              letterSpacing: "0.01em",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              padding: "2px 6px",
              verticalAlign: "middle",
            }}
            title={email}
          >
            {email}
          </span>
        )}
        <span className="text-xs text-accent font-bold ml-2">
          {points} AXI
        </span>
        <span className="text-xs text-secondary font-bold ml-2">
          {nextTier ? `→ ${nextTier.name}` : "MAX"}
        </span>
      </div>
      {/* Progress Bar */}
      <div
        className="relative rounded-full border border-accent shadow-inner overflow-hidden mx-auto mt-2"
        style={{
          width: barWidth,
          height: barHeight,
          background: "linear-gradient(90deg,#181e38 0%,#202e49 100%)",
          border: `1.7px solid ${currentTier.border}`,
        }}
      >
        {/* Animated gradient progress */}
        <div
          className="absolute top-0 left-0 h-full rounded-full transition-all duration-800"
          style={{
            width: `${progress}%`,
            background: `linear-gradient(90deg, ${currentTier.accent}, ${nextTier ? nextTier.accent : currentTier.accent})`,
            boxShadow: `0 2px 12px ${currentTier.accent}44`,
            animation: "progressGlow 1.2s ease-in-out infinite alternate",
          }}
        />
        {/* Sparkle at the end of progress */}
        <div
          className="absolute top-1/2"
          style={{
            left: `calc(${progress}% - ${iconSize/1.2}px)`,
            transform: "translateY(-50%)",
            opacity: progress > 8 ? 1 : 0,
          }}
        >
          <svg width={iconSize} height={iconSize} viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="5" fill={currentTier.accent} opacity="0.45"/>
            <circle cx="10" cy="10" r="3" fill="#fff" opacity="0.22"/>
          </svg>
        </div>
      </div>
      {/* Tier Progress Label */}
      <div
        className="w-full flex justify-center mt-2"
        style={{ maxWidth: barWidth }}
      >
        <span className="text-xs text-gray-400 font-semibold text-center">
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
      `}</style>
    </div>
  );
}
