import React from "react";

// Premade achievementų sąrašas
const ACHIEVEMENTS = [
  {
    id: 1,
    threshold: 10,
    title: "Getting Started",
    icon: "/icons/achievement-rocket.svg",
    description: "Complete 10 offers – you’re officially rolling!",
  },
  {
    id: 2,
    threshold: 25,
    title: "AXI Explorer",
    icon: "/icons/achievement-map.svg",
    description: "25 offers completed – you’re exploring new heights!",
  },
  {
    id: 3,
    threshold: 50,
    title: "Rewards Hunter",
    icon: "/icons/achievement-hunter.svg",
    description: "50 offers completed – true hunter of rewards!",
  },
  {
    id: 4,
    threshold: 75,
    title: "Legend in the Making",
    icon: "/icons/achievement-legend.svg",
    description: "75 offers completed – just a bit more to AXI legend!",
  },
  {
    id: 5,
    threshold: 100,
    title: "AXI Master",
    icon: "/icons/achievement-master.svg",
    description: "100 offers completed – you’ve mastered AXI Rewards!",
  },
  {
    id: 6,
    threshold: 250,
    title: "Elite Earner",
    icon: "/icons/achievement-elite.svg",
    description: "250 offers completed – you're in the elite AXI club!",
  },
  {
    id: 7,
    threshold: 500,
    title: "AXI Hall of Fame",
    icon: "/icons/achievement-hof.svg",
    description: "500 offers completed – welcome to the Hall of Fame!",
  },
];

export default function AchievementWall({ completedOffers = 0 }) {
  return (
    <div className="w-full mt-10 mb-8 px-2 flex flex-col items-center">
      <h3 className="text-xl font-extrabold text-accent mb-6 tracking-wide uppercase">
        Achievements Wall
      </h3>
      <div className="flex flex-wrap gap-6 justify-center items-center">
        {ACHIEVEMENTS.map(ach => {
          const unlocked = completedOffers >= ach.threshold;
          return (
            <div
              key={ach.id}
              className={`flex flex-col items-center justify-center glass-card px-4 py-5 rounded-2xl shadow-xl border-2 transition-all duration-400 ${unlocked ? "border-accent bg-gradient-to-br from-[#60A5FA22] to-[#7b6cfb33] shadow-accent animate-bounce" : "border-gray-700 bg-gradient-to-br from-[#232e40aa] to-[#0B0B0B66] opacity-60"} `}
              style={{
                minWidth: "160px",
                maxWidth: "200px",
                boxShadow: unlocked
                  ? "0 0 32px 0 #60A5fa55, 0 2px 16px 0 #7b6cfb77"
                  : "0 0 18px 0 #232e40aa",
                position: "relative",
              }}
            >
              <img
                src={ach.icon}
                alt={ach.title}
                className={`w-12 h-12 mb-2 ${unlocked ? "animate-spin-slow" : ""}`}
                style={{
                  filter: unlocked
                    ? "drop-shadow(0 0 12px #60A5FA) brightness(1.2)"
                    : "grayscale(70%) opacity(0.6)",
                }}
              />
              <span className={`font-bold text-lg ${unlocked ? "text-accent" : "text-gray-400"} mb-1`}>
                {ach.title}
              </span>
              <span className={`text-xs text-center ${unlocked ? "text-white" : "text-gray-500"} mb-2`}>
                {ach.description}
              </span>
              <span
                className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-extrabold ${unlocked ? "bg-accent text-white shadow-lg" : "bg-gray-700 text-gray-400"}`}
              >
                {unlocked ? "Unlocked" : `${ach.threshold}`}
              </span>
            </div>
          );
        })}
      </div>
      <style jsx>{`
        .glass-card {
          background: rgba(24, 32, 56, 0.86);
          backdrop-filter: blur(18px);
          border-radius: 1.25rem;
        }
        .animate-spin-slow {
          animation: spin 3.2s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg);}
          100% { transform: rotate(360deg);}
        }
        .animate-bounce {
          animation: bounce 1.1s cubic-bezier(.23,1,.32,1) infinite alternate;
        }
        @keyframes bounce {
          0% { transform: scale(1);}
          100% { transform: scale(1.06);}
        }
      `}</style>
    </div>
  );
}
