import React from "react";

/**
 * Animated VIP Tier Progress Bar – shows current tier, points, and next tier.
 * Props: tier (number), points (number)
 */
export default function VIPTierProgress({ tier = 1, points = 0 }) {
  // Tier thresholds, can be dynamic or fetched from DB.
  const tiers = [
    { level: 1, name: "Bronze", color: "#60A5FA", threshold: 0 },
    { level: 2, name: "Silver", color: "#dbeafe", threshold: 1000 },
    { level: 3, name: "Gold", color: "#FFD700", threshold: 5000 },
    { level: 4, name: "Platinum", color: "#7b6cfb", threshold: 15000 },
    { level: 5, name: "Diamond", color: "#8fdafd", threshold: 50000 },
  ];

  const currentTier = tiers.find(t => t.level === tier) || tiers[0];
  const nextTier = tiers[tier] || null;
  const progress = nextTier
    ? Math.min(100, ((points - currentTier.threshold) / (nextTier.threshold - currentTier.threshold)) * 100)
    : 100;

  return (
    <div className="w-full flex flex-col items-center justify-center mb-2">
      <div className="flex items-center gap-2 mb-1">
        <span
          className="px-2 py-1 rounded-lg font-bold text-sm"
          style={{
            background: `linear-gradient(90deg, ${currentTier.color}aa, ${nextTier ? nextTier.color : currentTier.color}bb)`,
            color: "#fff",
            boxShadow: "0 2px 12px #60A5fa33",
          }}
        >
          {currentTier.name}
        </span>
        <span className="text-xs text-gray-400 font-semibold">
          {points} AXI
        </span>
        <span className="text-xs text-accent font-bold">
          {nextTier ? `→ ${nextTier.name}` : "MAX"}
        </span>
      </div>
      <div
        className="w-full h-3 rounded-full bg-gradient-to-r from-[#202e49] to-[#0B0B0B] border border-accent shadow-inner relative"
        style={{ maxWidth: "340px" }}
      >
        <div
          className="absolute top-0 left-0 h-3 rounded-full transition-all duration-800"
          style={{
            width: `${progress}%`,
            background: `linear-gradient(90deg, ${currentTier.color}, ${nextTier ? nextTier.color : currentTier.color})`,
            boxShadow: "0 2px 16px #60A5fa44",
            animation: "progressGlow 1.4s ease-in-out infinite alternate",
          }}
        />
      </div>
      <style jsx>{`
        @keyframes progressGlow {
          0% { box-shadow: 0 0 8px #60A5fa44; }
          100% { box-shadow: 0 0 24px #7b6cfb88; }
        }
      `}</style>
    </div>
  );
}
