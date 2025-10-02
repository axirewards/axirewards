import React from "react";

/**
 * Top-notch ultra-luxury AchievementWall.
 * Responsive, beautiful grid container, glassmorphism, animated, shadow, luxury badge effects.
 * Achievements auto-adapt to PC and mobile view, always centered, wow effect.
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

export default function AchievementWall({ completedOffers = 0, gridMode = false }) {
  // Responsive grid: 2 columns on mobile, 4-7 columns on desktop
  // Container width adapts automatically
  return (
    <div
      className="achievement-wall-container w-full flex flex-col items-center justify-center py-8 px-2"
      style={{
        background: "rgba(18, 24, 38, 0.87)",
        borderRadius: "2.5rem",
        boxShadow: "0 8px 54px 0 #1E3A8A44, 0 2px 12px 0 #60A5fa33",
        backdropFilter: "blur(18px)",
        border: "2.5px solid #1E3A8A55",
        maxWidth: "100vw",
      }}
    >
      <div className="w-full flex items-center justify-center mb-8">
        <span className="font-extrabold text-2xl md:text-3xl tracking-tight text-accent uppercase drop-shadow-lg bg-gradient-to-r from-[#7b6cfb] via-[#60A5FA] to-[#FFD700] bg-clip-text text-transparent">
          My Achievement Wall
        </span>
      </div>
      <div
        className={
          "grid gap-6 items-stretch justify-center w-full " +
          (gridMode
            ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7"
            : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7")
        }
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
        }}
      >
        {ACHIEVEMENTS.map((ach) => {
          const unlocked = completedOffers >= ach.threshold;
          return (
            <div
              key={ach.id}
              className={`achievement-card flex flex-col items-center justify-center px-4 py-5 rounded-2xl shadow-xl border-2 transition-all duration-400 ${
                unlocked
                  ? "border-accent bg-gradient-to-br from-[#60A5FA33] to-[#7b6cfb44] shadow-accent animate-pop"
                  : "border-gray-800 bg-gradient-to-br from-[#181e38bb] to-[#202e49bb] opacity-60"
              }`}
              style={{
                minWidth: "140px",
                maxWidth: "180px",
                minHeight: "200px",
                boxShadow: unlocked
                  ? "0 0 32px 0 #60A5fa55, 0 2px 22px 0 #7b6cfb77"
                  : "0 0 18px 0 #181e38bb",
                position: "relative",
                display: "flex",
                alignItems: "center",
              }}
            >
              <div
                className="achievement-icon-bg absolute top-4 left-1/2 transform -translate-x-1/2"
                style={{
                  width: unlocked ? 54 : 38,
                  height: unlocked ? 54 : 38,
                  borderRadius: "50%",
                  background: unlocked
                    ? "radial-gradient(circle, #60A5FA33 0%, #7b6cfb11 70%, transparent 100%)"
                    : "radial-gradient(circle, #232e40 0%, #181e38 70%, transparent 100%)",
                  filter: unlocked
                    ? "blur(2.5px) brightness(1.15)"
                    : "blur(1.5px) opacity(0.7)",
                  zIndex: 1,
                }}
              />
              <img
                src={ach.icon}
                alt={ach.title}
                className={`w-12 h-12 mb-3 z-10 ${unlocked ? "animate-spin-slow" : ""}`}
                style={{
                  filter: unlocked
                    ? "drop-shadow(0 0 12px #60A5FA) brightness(1.12)"
                    : "grayscale(70%) opacity(0.58)",
                }}
              />
              <span
                className={`font-extrabold text-md md:text-lg text-center ${unlocked ? "text-accent" : "text-gray-400"} mb-2`}
                style={{
                  letterSpacing: "0.05em",
                  textShadow: unlocked
                    ? "0 0 7px #60A5FA, 0 1px 2px #181e38"
                    : "none",
                }}
              >
                {ach.title}
              </span>
              <span
                className={`text-xs text-center ${unlocked ? "text-white" : "text-gray-500"} mb-2 px-1`}
                style={{
                  fontWeight: "400",
                  lineHeight: "1.2",
                  maxWidth: "148px",
                  minHeight: "34px",
                  marginTop: "-2px",
                }}
              >
                {ach.description}
              </span>
              <span
                className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-extrabold ${unlocked ? "bg-accent text-white shadow-lg animate-twinkle" : "bg-gray-700 text-gray-400"}`}
                style={{
                  zIndex: 20,
                  fontSize: "0.8em",
                  letterSpacing: "0.07em",
                  boxShadow: unlocked ? "0 0 10px #60A5FA88" : "none",
                }}
              >
                {unlocked ? "Unlocked" : `${ach.threshold}`}
              </span>
            </div>
          );
        })}
      </div>
      <style jsx>{`
        .achievement-wall-container {
          transition: box-shadow 0.3s cubic-bezier(.23,1,.32,1);
        }
        .achievement-card {
          transition: box-shadow 0.33s cubic-bezier(.23,1,.32,1), background 0.14s;
        }
        @media (max-width: 900px) {
          .achievement-wall-container {
            border-radius: 1.15rem;
            padding: 24px 4px !important;
          }
          .achievement-card {
            min-width: 110px !important;
            max-width: 98vw !important;
            min-height: 140px !important;
            padding: 12px 4px !important;
          }
        }
        @media (max-width: 700px) {
          .achievement-wall-container {
            padding: 14px 2px !important;
            border-radius: 0.7rem;
          }
          .achievement-card {
            min-width: 92px !important;
            max-width: 98vw !important;
            min-height: 98px !important;
            padding: 8px 2px !important;
          }
          .achievement-icon-bg {
            width: 36px !important;
            height: 36px !important;
          }
        }
        .animate-spin-slow {
          animation: spin 2.8s linear infinite;
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
          100% { transform: scale(1.07);}
        }
        .animate-twinkle {
          animation: twinkle 2.2s ease-in-out infinite alternate;
        }
        @keyframes twinkle {
          0% { box-shadow: 0 0 10px #60A5FA88; }
          100% { box-shadow: 0 0 24px #7b6cfb77; }
        }
      `}</style>
    </div>
  );
}
