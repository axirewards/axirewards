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

export default function UserStatsVipMobile() {
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
      <div className="flex justify-center items-center min-h-[120px]">
        <span className="text-accent animate-pulse">Loading VIP stats...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[120px]">
        <span className="text-red-500 font-bold">{error}</span>
      </div>
    );
  }

  const { points_balance = 0, levelpoints = 0, total_completions = 0 } = user || {};

  // VIP tier logic
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

  return (
    <div className="w-full px-1 py-3 flex flex-col items-center justify-center">
      <div className="grid grid-cols-4 gap-3 w-full max-w-[430px] mx-auto">
        {/* VIP Tier Cube */}
        <div className="rounded-xl shadow-lg p-3 flex flex-col items-center justify-center bg-gradient-to-br from-[#232e40] to-[#181E38] border-2"
          style={{
            borderColor: currentTier.color,
            background: currentTier.bg,
            minHeight: "98px",
            minWidth: "78px",
            maxWidth: "92px"
          }}
        >
          <span className="font-bold text-xs mb-1 text-white tracking-wide" style={{
            color: currentTier.color,
            textShadow: `0 1px 6px ${currentTier.color}77, 0 1px 1px #181e38`
          }}>
            {currentTier.name}
          </span>
          <span className="text-[0.92em] font-bold text-white mb-1">VIP</span>
          <div className="relative w-full my-1 h-2 rounded-full bg-[#181e38]">
            <div
              className="absolute top-0 left-0 h-full rounded-full transition-all"
              style={{
                width: `${progress}%`,
                background: `linear-gradient(90deg, ${currentTier.color}, ${nextTier ? nextTier.color : currentTier.color})`
              }}
            />
          </div>
          <span className="text-[0.74em] text-white mt-1 font-semibold">{levelpoints} AXI</span>
        </div>
        {/* Points Balance Cube */}
        <div className="rounded-xl shadow-lg p-3 flex flex-col items-center justify-center bg-gradient-to-br from-[#232e40] to-[#60A5FA44] border-2"
          style={{
            borderColor: "#60A5FA",
            minHeight: "98px",
            minWidth: "78px",
            maxWidth: "92px"
          }}
        >
          <img src="/icons/axicoin.svg" alt="Points" className="w-7 h-7 mb-1" />
          <span className="font-bold text-xs text-accent">Points</span>
          <span className="text-[1.25em] font-extrabold text-white">{points_balance}</span>
          <span className="text-[0.74em] text-accent font-semibold mt-1">AXI</span>
        </div>
        {/* Daily Streak Cube */}
        <div className="rounded-xl shadow-lg p-3 flex flex-col items-center justify-center bg-gradient-to-br from-[#232e40] to-[#FF6A3D44] border-2"
          style={{
            borderColor: "#FF6A3D",
            minHeight: "98px",
            minWidth: "78px",
            maxWidth: "92px"
          }}
        >
          <img src="/icons/fire.png" alt="Streak" className="w-7 h-7 mb-1" />
          <span className="font-bold text-xs" style={{ color: "#FF6A3D" }}>Streak</span>
          <span className="text-[1.25em] font-extrabold text-white">{strikeDays}</span>
          <span className="text-[0.74em] text-orange-300 font-semibold mt-1">🔥 Days</span>
        </div>
        {/* Completed Offers Cube */}
        <div className="rounded-xl shadow-lg p-3 flex flex-col items-center justify-center bg-gradient-to-br from-[#232e40] to-[#5AF59944] border-2"
          style={{
            borderColor: "#5AF599",
            minHeight: "98px",
            minWidth: "78px",
            maxWidth: "92px"
          }}
        >
          <img src="/icons/check.svg" alt="Completed" className="w-7 h-7 mb-1" />
          <span className="font-bold text-xs" style={{ color: "#5AF599" }}>Completed</span>
          <span className="text-[1.25em] font-extrabold text-white">{user?.total_completions ?? 0}</span>
          <span className="text-[0.74em] text-green-300 font-semibold mt-1">Offers</span>
        </div>
      </div>
      <style jsx>{`
        .shadow-lg {
          box-shadow: 0 2px 18px 0 #232e4088, 0 1px 6px 0 #60A5FA33;
        }
        .bg-gradient-to-br.from-[#232e40].to-[#181E38] {
          background: linear-gradient(135deg,#232e40 0%,#181E38 100%);
        }
        .bg-gradient-to-br.from-[#232e40].to-[#60A5FA44] {
          background: linear-gradient(135deg,#232e40 0%,#60A5FA44 100%);
        }
        .bg-gradient-to-br.from-[#232e40].to-[#FF6A3D44] {
          background: linear-gradient(135deg,#232e40 0%,#FF6A3D44 100%);
        }
        .bg-gradient-to-br.from-[#232e40].to-[#5AF59944] {
          background: linear-gradient(135deg,#232e40 0%,#5AF59944 100%);
        }
      `}</style>
    </div>
  );
}
