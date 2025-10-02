import React from "react";

/**
 * Supreme ultra-premium AchievementWall.
 * Responsive, glassy, compact, wow grid – fits dashboard perfectly.
 * Achievements auto-adapt to PC and mobile. Perfect for bottom of dashboard.
 */
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
  // Responsive grid: 2 columns on mobile, 4-7 columns on desktop, fits in one row if space allows
  return (
    <div
      className="achievement-wall-container w-full flex flex-col items-center justify-center py-6 px-2"
      style={{
        background: "rgba(18, 24, 38, 0.93)",
        borderRadius: "1.7rem",
        boxShadow: "0 8px 28px 0 #1E3A8A33, 0 2px 8px 0 #60A5fa33",
        backdropFilter: "blur(13px)",
        border: "2px solid #1E3A8A44",
        maxWidth: "97vw",
        margin: "0 auto",
      }}
    >
      <div className="w-full flex items-center justify-center mb-4">
        <span className="font-extrabold text-xl md:text-2xl tracking-tight text-accent uppercase drop-shadow bg-gradient-to-r from-[#7b6cfb] via-[#60A5FA] to-[#FFD700] bg-clip-text text-transparent">
          Achievements
        </span>
      </div>
      <div
        className={
          "grid gap-3 items-center justify-center w-full " +
          "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-7"
        }
        style={{
          maxWidth: "950px",
          margin: "0 auto",
        }}
      >
        {ACHIEVEMENTS.map((ach) => {
          const unlocked = completedOffers >= ach.threshold;
          return (
            <div
              key={ach.id}
              className={`achievement-card flex flex-col items-center justify-center px-2 py-3 rounded-xl shadow-lg border transition-all duration-350 ${
                unlocked
                  ? "border-accent bg-gradient-to-br from-[#60A5FA22] to-[#7b6cfb22] shadow-accent animate-pop"
                  : "border-gray-800 bg-gradient-to-br from-[#181e38bb] to-[#202e49bb] opacity-60"
              }`}
              style={{
                minWidth: "96px",
                maxWidth: "120px",
                minHeight: "124px",
                boxShadow: unlocked
                  ? "0 0 18px 0 #60A5fa33, 0 2px 8px 0 #7b6cfb55"
                  : "0 0 8px 0 #181e38bb",
                position: "relative",
                display: "flex",
                alignItems: "center",
              }}
            >
              <div
                className="achievement-icon-bg absolute top-2 left-1/2 transform -translate-x-1/2"
                style={{
                  width: unlocked ? 36 : 23,
                  height: unlocked ? 36 : 23,
                  borderRadius: "50%",
                  background: unlocked
                    ? "radial-gradient(circle, #60A5FA22 0%, #7b6cfb11 70%, transparent 100%)"
                    : "radial-gradient(circle, #232e40 0%, #181e38 70%, transparent 100%)",
                  filter: unlocked
                    ? "blur(1.8px) brightness(1.10)"
                    : "blur(1.1px) opacity(0.6)",
                  zIndex: 1,
                }}
              />
              <img
                src={ach.icon}
                alt={ach.title}
                className={`w-8 h-8 mb-1 z-10 ${unlocked ? "animate-spin-slow" : ""}`}
                style={{
                  filter: unlocked
                    ? "drop-shadow(0 0 8px #60A5FA) brightness(1.10)"
                    : "grayscale(70%) opacity(0.47)",
                }}
              />
              <span
                className={`font-bold text-[0.97em] text-center ${unlocked ? "text-accent" : "text-gray-400"} mb-1`}
                style={{
                  letterSpacing: "0.04em",
                  textShadow: unlocked
                    ? "0 0 3px #60A5FA, 0 1px 2px #181e38"
                    : "none",
                  maxWidth: "96px",
                }}
              >
                {ach.title}
              </span>
              <span
                className={`text-[0.81em] text-center ${unlocked ? "text-white" : "text-gray-500"} mb-1 px-1`}
                style={{
                  fontWeight: "400",
                  lineHeight: "1.15",
                  maxWidth: "99px",
                  minHeight: "18px",
                }}
              >
                {ach.description}
              </span>
              <span
                className={`absolute top-2 right-2 px-1 py-0.5 rounded-full text-[0.75em] font-extrabold ${unlocked ? "bg-accent text-white shadow animate-twinkle" : "bg-gray-700 text-gray-400"}`}
                style={{
                  zIndex: 20,
                  fontSize: "0.8em",
                  letterSpacing: "0.055em",
                  boxShadow: unlocked ? "0 0 4px #60A5FA88" : "none",
                }}
              >
                {unlocked ? "✓" : ach.threshold}
              </span>
            </div>
          );
        })}
      </div>
      <style jsx>{`
        .achievement-wall-container {
          transition: box-shadow 0.19s cubic-bezier(.23,1,.32,1);
        }
        .achievement-card {
          transition: box-shadow 0.21s cubic-bezier(.23,1,.32,1), background 0.11s;
        }
        @media (max-width: 900px) {
          .achievement-wall-container {
            border-radius: 1.15rem;
            padding: 14px 2px !important;
          }
          .achievement-card {
            min-width: 83px !important;
            max-width: 94vw !important;
            min-height: 90px !important;
            padding: 7px 2px !important;
          }
        }
        @media (max-width: 700px) {
          .achievement-wall-container {
            padding: 8px 1px !important;
            border-radius: 0.7rem;
          }
          .achievement-card {
            min-width: 72px !important;
            max-width: 98vw !important;
            min-height: 68px !important;
            padding: 4px 1px !important;
          }
          .achievement-icon-bg {
            width: 18px !important;
            height: 18px !important;
          }
        }
        .animate-spin-slow {
          animation: spin 2.4s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg);}
          100% { transform: rotate(360deg);}
        }
        .animate-pop {
          animation: pop 1.1s cubic-bezier(.23,1,.32,1) infinite alternate;
        }
        @keyframes pop {
          0% { transform: scale(1);}
          100% { transform: scale(1.04);}
        }
        .animate-twinkle {
          animation: twinkle 1.8s ease-in-out infinite alternate;
        }
        @keyframes twinkle {
          0% { box-shadow: 0 0 7px #60A5FA88; }
          100% { box-shadow: 0 0 14px #7b6cfb77; }
        }
      `}</style>
    </div>
  );
}
