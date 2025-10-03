import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const TIER_INFO = [
  { level: 1, name: "Bronze", color: "#A66B3B", bg: "linear-gradient(135deg,#232e40 0%,#A66B3B 120%)" },
  { level: 2, name: "Silver", color: "#bfcbdc", bg: "linear-gradient(135deg,#232e40 0%,#bfcbdc 120%)" },
  { level: 3, name: "Gold", color: "#FFD700", bg: "linear-gradient(135deg,#232e40 0%,#FFD700 120%)" },
  { level: 4, name: "Platinum", color: "#7b6cfb", bg: "linear-gradient(135deg,#232e40 0%,#7b6cfb 120%)" },
  { level: 5, name: "Diamond", color: "#8fdafd", bg: "linear-gradient(135deg,#232e40 0%,#8fdafd 120%)" },
];

const thresholds = [0, 10000, 50000, 150000, 500000, 9999999];

/**
 * Props:
 * size: "compact-premium" – for mobile reduced version (PC default untouched)
 */
export default function UserStatsVip({ size }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [strikeDays, setStrikeDays] = useState(0);

  useEffect(() => {
    async function fetchUserAndStats() {
      setLoading(true);
      setError("");
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      if (authError || !authUser) {
        setError("Nepavyko gauti vartotojo duomenų.");
        setLoading(false);
        return;
      }

      // Get user info including total_completions
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("points_balance, levelpoints, email, total_completions")
        .eq("email", authUser.email)
        .single();
      if (userError || !userData) {
        setError("Vartotojas nerastas duomenų bazėje.");
        setLoading(false);
        return;
      }
      setUser(userData);

      // Strike days iš loginhistory lentelės
      const { data: loginHistoryData, error: loginHistoryError } = await supabase
        .from("loginhistory")
        .select("strike_days")
        .eq("user_email", userData.email)
        .single();
      if (!loginHistoryError && loginHistoryData && typeof loginHistoryData.strike_days === "number") {
        setStrikeDays(loginHistoryData.strike_days);
      } else {
        setStrikeDays(0);
      }

      setLoading(false);
    }
    fetchUserAndStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[180px]">
        <span className="text-accent animate-pulse">Loading VIP stats...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[180px]">
        <span className="text-red-500 font-bold">{error}</span>
      </div>
    );
  }

  const { points_balance = 0, levelpoints = 0, total_completions = 0 } = user || {};

  let tier = 1;
  for (let i = thresholds.length - 1; i >= 0; i--) {
    if (levelpoints >= thresholds[i]) {
      tier = i + 1;
      break;
    }
  }
  const currentTier = TIER_INFO.find(t => t.level === tier) || TIER_INFO[0];
  const nextTier = TIER_INFO[tier] || null;
  const progress = nextTier
    ? Math.min(100, ((levelpoints - thresholds[tier - 1]) / (thresholds[tier] - thresholds[tier - 1])) * 100)
    : 100;

  // Compact mode for mobile (size="compact-premium")
  const isCompact = size === "compact-premium";
  const cubeSize = isCompact ? "61vw" : (typeof window !== "undefined" && window.innerWidth < 700 ? "90vw" : "220px");
  const iconSize = isCompact ? 22 : (typeof window !== "undefined" && window.innerWidth < 700 ? 32 : 44);
  const barWidth = isCompact ? "48vw" : (typeof window !== "undefined" && window.innerWidth < 700 ? "74vw" : "160px");
  const barHeight = isCompact ? "4px" : (typeof window !== "undefined" && window.innerWidth < 700 ? "7px" : "9px");
  const gapSize = isCompact ? "9px" : "18px";
  const fontTitle = isCompact ? "1.01rem" : "1.17rem";
  const fontMain = isCompact ? "1.68rem" : "2.3rem";
  const fontSub = isCompact ? "0.65rem" : "0.84rem";
  const cubeRadius = isCompact ? "1.03rem" : "1.4rem";

  return (
    <div
      className="userstatsvip-row w-full flex flex-col md:flex-row items-center justify-center"
      style={{
        maxWidth: isCompact ? "99vw" : (typeof window !== "undefined" && window.innerWidth < 700 ? "97vw" : "900px"),
        margin: "0 auto",
        gap: gapSize,
        marginBottom: gapSize
      }}
    >
      {/* VIP Tier Cube */}
      <div
        className="userstatsvip-cube glass-card flex flex-col items-center justify-center shadow-xl border-2 transition-all"
        style={{
          minWidth: cubeSize,
          maxWidth: cubeSize,
          background: currentTier.bg,
          borderColor: currentTier.color,
          borderRadius: cubeRadius,
          boxShadow: `0 0 24px 0 ${currentTier.color}44`,
          padding: isCompact ? "1.1em 0.55em" : "2.2em 1.1em"
        }}
      >
        <span
          className="font-extrabold mb-2"
          style={{
            color: currentTier.color,
            textShadow: `0 1px 6px ${currentTier.color}88, 0 1px 1px #181e38`,
            letterSpacing: "0.06em",
            fontSize: fontTitle
          }}
        >
          {currentTier.name} VIP
        </span>
        {/* Progress bar */}
        <div
          className="relative rounded-full w-full shadow-inner mt-1 mb-0"
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
        <span className="mt-2 font-semibold" style={{ fontSize: fontSub, color: "#fff" }}>{levelpoints} AXI (All-Time)</span>
        <span className="mt-2 font-semibold text-center" style={{ fontSize: fontSub, color: "#bbb" }}>
          {nextTier
            ? `Next: ${nextTier.name} at ${thresholds[tier]} AXI`
            : "Max VIP reached"}
        </span>
      </div>
      {/* Points Balance Cube */}
      <div
        className="userstatsvip-cube glass-card flex flex-col items-center justify-center shadow-xl border-2 transition-all"
        style={{
          minWidth: cubeSize,
          maxWidth: cubeSize,
          borderColor: "#60A5FA",
          borderRadius: cubeRadius,
          background: "linear-gradient(135deg,#232e40 0%,#60A5FA 120%)",
          boxShadow: "0 0 24px 0 #60A5FA44",
          padding: isCompact ? "1.1em 0.55em" : "2.2em 1.1em"
        }}
      >
        <img src="/icons/axicoin.svg" alt="Points" style={{ width: iconSize, height: iconSize, marginBottom: isCompact ? 7 : 12 }} />
        <span className="font-extrabold mb-2 text-accent" style={{ fontSize: fontTitle }}>Points Balance</span>
        <span className="font-extrabold text-white" style={{ fontSize: fontMain }}>{points_balance}</span>
        <span className="mt-2 font-semibold text-accent" style={{ fontSize: fontSub }}>AXI</span>
      </div>
      {/* Daily Streak Cube */}
      <div
        className="userstatsvip-cube glass-card flex flex-col items-center justify-center shadow-xl border-2 transition-all"
        style={{
          minWidth: cubeSize,
          maxWidth: cubeSize,
          borderColor: "#FF6A3D",
          borderRadius: cubeRadius,
          background: "linear-gradient(135deg,#232e40 0%,#FF6A3D 120%)",
          boxShadow: "0 0 24px 0 #FF6A3D44",
          padding: isCompact ? "1.1em 0.55em" : "2.2em 1.1em"
        }}
      >
        <img src="/icons/fire.png" alt="Streak" style={{ width: iconSize, height: iconSize, marginBottom: isCompact ? 7 : 12 }} />
        <span className="font-extrabold mb-2" style={{ color: "#FF6A3D", fontSize: fontTitle }}>Daily Streak</span>
        <span className="font-extrabold text-white" style={{ fontSize: fontMain }}>{strikeDays}</span>
        <span className="mt-2 font-semibold text-orange-300" style={{ fontSize: fontSub }}>🔥 Days</span>
      </div>
      {/* Completed Offers Cube */}
      <div
        className="userstatsvip-cube glass-card flex flex-col items-center justify-center shadow-xl border-2 transition-all"
        style={{
          minWidth: cubeSize,
          maxWidth: cubeSize,
          borderColor: "#5AF599",
          borderRadius: cubeRadius,
          background: "linear-gradient(135deg,#232e40 0%,#5AF599 120%)",
          boxShadow: "0 0 24px 0 #5AF59944",
          padding: isCompact ? "1.1em 0.55em" : "2.2em 1.1em"
        }}
      >
        <img src="/icons/check.svg" alt="Completed" style={{ width: iconSize, height: iconSize, marginBottom: isCompact ? 7 : 12 }} />
        <span className="font-extrabold mb-2" style={{ color: "#5AF599", fontSize: fontTitle }}>Completed Offers</span>
        <span className="font-extrabold text-white" style={{ fontSize: fontMain }}>{user?.total_completions ?? 0}</span>
        <span className="mt-2 font-semibold text-green-300" style={{ fontSize: fontSub }}>Offers</span>
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
