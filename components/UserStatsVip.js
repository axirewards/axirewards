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

export default function UserStatsVip() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [completedOffers, setCompletedOffers] = useState(0);
  const [streak, setStreak] = useState(0);

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

      // Get user info
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("points_balance, levelpoints, last_login, email")
        .eq("email", authUser.email)
        .single();
      if (userError || !userData) {
        setError("Vartotojas nerastas duomenų bazėje.");
        setLoading(false);
        return;
      }
      setUser(userData);

      // Completed offers logic - grąžina TIKSLŲ skaičių įrašų!
      const { count: offersCount, error: offersError } = await supabase
        .from("completions")
        .select("*", { count: "exact", head: true })
        .eq("user_email", userData.email);
      if (!offersError && typeof offersCount === "number") {
        setCompletedOffers(offersCount);
      } else {
        setCompletedOffers(0);
      }

      // Strike (streak) logic (kaip ir anksčiau)
      const { data: loginsData, error: loginsError } = await supabase
        .from("users")
        .select("last_login_history")
        .eq("email", userData.email)
        .single();

      let loginHistory = [];
      if (loginsData && Array.isArray(loginsData.last_login_history)) {
        loginHistory = loginsData.last_login_history.map(d => new Date(d));
      } else if (userData.last_login) {
        loginHistory = [new Date(userData.last_login)];
      }

      loginHistory.sort((a, b) => b - a); // naujausi pirmi
      let streakCount = 1;
      for (let i = 1; i < loginHistory.length; i++) {
        const diff = (loginHistory[i - 1] - loginHistory[i]) / (1000 * 60 * 60 * 24);
        if (diff > 1.5) break;
        streakCount++;
      }
      setStreak(streakCount);

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

  const { points_balance = 0, levelpoints = 0 } = user || {};

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
        {/* Progress bar */}
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
        <span className="text-xs text-white mt-2 font-semibold">{levelpoints} AXI (All-Time)</span>
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
        <img src="/icons/axicoin.svg" alt="Points" style={{ width: iconSize, height: iconSize, marginBottom: 12 }} />
        <span className="font-extrabold text-lg mb-2 text-accent">Points Balance</span>
        <span className="text-3xl font-extrabold text-white">{points_balance}</span>
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
        <img src="/icons/fire.png" alt="Streak" style={{ width: iconSize, height: iconSize, marginBottom: 12 }} />
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
