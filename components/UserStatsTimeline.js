import React from "react";

/**
 * User statistics timeline: monthly earnings, best streak, unlocked rewards, etc.
 * Props: stats – array of { title, value, icon, description, date }
 */
const DEFAULT_STATS = [
  {
    title: "Monthly Earnings",
    value: "12,300 AXI",
    icon: "/icons/coin.svg",
    description: "You earned 12,300 AXI this month!",
    date: "2025-09",
  },
  {
    title: "Best Daily Streak",
    value: "14 Days",
    icon: "/icons/fire.svg",
    description: "🔥 Your longest daily streak!",
    date: "2025-08",
  },
  {
    title: "Highest Single Reward",
    value: "1,000 AXI",
    icon: "/icons/trophy.svg",
    description: "Biggest single offer completed!",
    date: "2025-09-13",
  },
  {
    title: "Lifetime Offers",
    value: "137",
    icon: "/icons/map.svg",
    description: "Total offers completed by you.",
    date: "2025-09-30",
  },
];

export default function UserStatsTimeline({ stats = DEFAULT_STATS }) {
  return (
    <div className="w-full flex flex-col items-center mt-10 mb-8 px-2">
      <h3 className="text-xl font-extrabold text-accent mb-4 tracking-wide uppercase">
        Your AXI Timeline
      </h3>
      <div className="flex flex-col gap-6 w-full max-w-2xl">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className={`glass-card flex items-center gap-4 px-5 py-5 rounded-2xl shadow-xl border-2 border-accent transition-all duration-400 ${
              idx % 2 === 0
                ? "bg-gradient-to-r from-[#60A5FA15] to-[#7b6cfb15]"
                : "bg-gradient-to-r from-[#1E3A8A15] to-[#FFD70015]"
            }`}
            style={{
              boxShadow: "0 0 18px 0 #60A5fa44",
              position: "relative",
              minHeight: "82px",
            }}
          >
            <img
              src={stat.icon}
              alt={stat.title}
              className="w-11 h-11 rounded-full border-2 border-accent shadow-md"
              style={{
                filter: "drop-shadow(0 0 8px #60A5FA)",
                background: "#232e40",
              }}
            />
            <div className="flex flex-col flex-1">
              <span className="font-bold text-lg text-accent">{stat.title}</span>
              <span className="text-md text-white font-extrabold">{stat.value}</span>
              <span className="text-xs text-gray-300">{stat.description}</span>
            </div>
            <span className="text-xs text-secondary font-bold">{stat.date}</span>
          </div>
        ))}
      </div>
      <style jsx>{`
        .glass-card {
          background: rgba(24, 32, 56, 0.85);
          backdrop-filter: blur(14px);
          border-radius: 1.25rem;
        }
      `}</style>
    </div>
  );
}
