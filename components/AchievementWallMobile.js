import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

// Achievements array - leave logic unchanged
const ACHIEVEMENTS = [
  {
    id: 1,
    threshold: 10,
    title: "Getting Started",
    icon: "/icons/achievement-rocket.png",
    description: "Complete 10 offers – you’re officially rolling!",
  },
  {
    id: 2,
    threshold: 25,
    title: "AXI Explorer",
    icon: "/icons/achievement-map.png",
    description: "25 offers completed – you’re exploring new heights!",
  },
  {
    id: 3,
    threshold: 50,
    title: "Rewards Hunter",
    icon: "/icons/achievement-hunter.png",
    description: "50 offers completed – true hunter of rewards!",
  },
  {
    id: 4,
    threshold: 75,
    title: "Legend in the Making",
    icon: "/icons/achievement-legend.png",
    description: "75 offers completed – just a bit more to AXI legend!",
  },
  {
    id: 5,
    threshold: 100,
    title: "AXI Master",
    icon: "/icons/achievement-master.png",
    description: "100 offers completed – you’ve mastered AXI Rewards!",
  },
  {
    id: 6,
    threshold: 250,
    title: "Elite Earner",
    icon: "/icons/achievement-elite.png",
    description: "250 offers completed – you're in the elite AXI club!",
  },
  {
    id: 7,
    threshold: 500,
    title: "AXI Hall of Fame",
    icon: "/icons/achievement-hof.png",
    description: "500 offers completed – welcome to the Hall of Fame!",
  },
  {
    id: 8,
    threshold: 1000,
    title: "AXI Veteran",
    icon: "/icons/achievement-veteran.png",
    description: "1000 offers completed – true AXI veteran!",
  },
  {
    id: 9,
    threshold: 2500,
    title: "AXI Supreme",
    icon: "/icons/achievement-supreme.png",
    description: "2500 offers completed – supreme achievement!",
  },
  {
    id: 10,
    threshold: 5000,
    title: "AXI Immortal",
    icon: "/icons/achievement-immortal.png",
    description: "5000 offers completed – immortal AXI legend!",
  },
];

export default function AchievementWallMobile({ userId }) {
  const [completedOffers, setCompletedOffers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // achievement modal state

  useEffect(() => {
    async function fetchCompletions() {
      setLoading(true);
      if (!userId) {
        setCompletedOffers(0);
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from("users")
        .select("total_completions")
        .eq("id", userId)
        .single();

      if (error || !data) {
        setCompletedOffers(0);
      } else {
        setCompletedOffers(data.total_completions || 0);
      }
      setLoading(false);
    }
    fetchCompletions();
  }, [userId]);

  if (loading)
    return (
      <div className="py-6 px-2 flex items-center justify-center">
        <span className="text-accent font-bold">Loading achievements...</span>
      </div>
    );

  return (
    <div
      className="achievement-wall-mobile-container w-full flex flex-col items-center justify-center py-3 px-1"
      style={{
        maxWidth: '99vw',
        margin: '0 auto',
        background: "rgba(18,24,38,0.89)",
        borderRadius: "0.89rem",
        boxShadow: "0 3px 14px 0 #1E3A8A29, 0 2px 8px 0 #60A5FA22",
        backdropFilter: "blur(7px)",
        border: "1.5px solid #1E3A8A44",
        minHeight: "112px",
      }}
    >
      <div className="w-full flex items-center justify-center mb-2">
        <span className="font-extrabold text-[1.07rem] tracking-tight text-accent uppercase drop-shadow bg-gradient-to-r from-[#7b6cfb] via-[#60A5FA] to-[#FFD700] bg-clip-text text-transparent">
          Achievements
        </span>
      </div>
      {/* Mobile grid - super compact */}
      <div className="grid grid-cols-5 gap-2 w-full max-w-[410px] mx-auto">
        {ACHIEVEMENTS.map((ach) => {
          const unlocked = completedOffers >= ach.threshold;
          return (
            <button
              key={ach.id}
              className={`relative flex flex-col items-center justify-center rounded-xl shadow border transition-all duration-200 focus:outline-none group
                ${unlocked
                  ? "border-accent bg-gradient-to-br from-[#60A5FA24] to-[#FFD70018] shadow-accent"
                  : "border-gray-800 bg-gradient-to-br from-[#181e3899] to-[#202e4999] opacity-70"
                }
                `}
              style={{
                minWidth: "50px",
                maxWidth: "62px",
                minHeight: "60px",
                padding: "6px 2px",
                boxShadow: unlocked
                  ? "0 0 10px 0 #60A5fa18, 0 2px 6px 0 #FFD70022"
                  : "0 0 4px 0 #181e3899",
                cursor: "pointer",
                position: "relative",
              }}
              onClick={() => setModal(ach)}
            >
              <img
                src={ach.icon}
                alt={ach.title}
                className={`w-6 h-6 mb-1.5 z-10 ${unlocked ? "animate-spin-slow" : ""}`}
                style={{
                  filter: unlocked
                    ? "drop-shadow(0 0 7px #60A5FA) brightness(1.08)"
                    : "grayscale(75%) opacity(0.37)",
                  transition: "filter 0.2s",
                }}
              />
              <span
                className={`font-bold text-[0.79em] text-center mb-0.5`}
                style={{
                  color: unlocked ? "#60A5FA" : "#444",
                  letterSpacing: "0.03em",
                  textShadow: unlocked
                    ? "0 0 3px #60A5FA, 0 1px 2px #181e38"
                    : "none",
                  maxWidth: "59px",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {ach.title}
              </span>
              <span
                className={`absolute top-1 right-1 px-1 py-0.5 rounded-full text-[0.68em] font-extrabold ${unlocked ? "bg-accent text-white shadow animate-twinkle" : "bg-gray-700 text-gray-400"}`}
                style={{
                  zIndex: 20,
                  fontSize: "0.75em",
                  letterSpacing: "0.045em",
                  boxShadow: unlocked ? "0 0 2px #60A5FA77" : "none",
                }}
              >
                {unlocked ? "✓" : ach.threshold}
              </span>
            </button>
          );
        })}
      </div>

      {/* Achievement Modal */}
      {modal && (
        <div className="fixed inset-0 z-[1500] bg-black/70 flex items-center justify-center backdrop-blur-sm">
          <div className="achievement-modal-pop relative flex flex-col items-center justify-center bg-gradient-to-br from-[#181e38] via-[#232e40] to-[#60A5FA22] rounded-xl border-2 border-accent shadow-xl px-4 py-4 max-w-[92vw] min-w-[82vw] animate-pop-modal"
            style={{
              boxShadow: "0 3px 22px #60A5FA33, 0 2px 10px #FFD70022",
              position: "relative",
              animation: "popModal 0.31s cubic-bezier(.23,1,.32,1)", // Pop effect on open
            }}
          >
            <button
              onClick={() => setModal(null)}
              className="absolute top-2 right-3 text-accent text-xl font-extrabold hover:text-blue-700 transition"
              aria-label="Close"
              style={{
                background: "rgba(24,32,56,0.82)",
                borderRadius: "1.1rem",
                padding: "2px 11px",
                zIndex: 2
              }}
            >
              &times;
            </button>
            <img
              src={modal.icon}
              alt={modal.title}
              className={`w-10 h-10 mb-2 ${completedOffers >= modal.threshold ? "" : "grayscale opacity-50"}`}
              style={{
                filter: completedOffers >= modal.threshold
                  ? "drop-shadow(0 0 10px #60A5FA) brightness(1.09)"
                  : "grayscale(75%) opacity(0.44)",
                transition: "filter 0.2s",
              }}
            />
            <span
              className="font-bold text-[1.18rem] mb-1 text-center"
              style={{
                color: completedOffers >= modal.threshold ? "#60A5FA" : "#444",
                letterSpacing: "0.045em",
                textShadow: completedOffers >= modal.threshold
                  ? "0 0 5px #60A5FA, 0 2px 4px #181e38"
                  : "none",
                maxWidth: "320px",
                overflowWrap: "break-word"
              }}
            >
              {modal.title}
            </span>
            <span
              className="text-[0.97em] text-center mt-2 mb-2 font-medium"
              style={{
                color: completedOffers >= modal.threshold ? "#fff" : "#bbb",
                lineHeight: "1.33",
                maxWidth: "305px",
                fontWeight: 500,
                textShadow: completedOffers >= modal.threshold
                  ? "0 0 1.5px #60A5FA, 0 1px 2px #181e38"
                  : "none"
              }}
            >
              {modal.description}
            </span>
            <span
              className={`absolute top-2 left-3 px-2 py-1 rounded-full text-[0.92em] font-extrabold ${completedOffers >= modal.threshold ? "bg-accent text-white shadow animate-twinkle" : "bg-gray-700 text-gray-400"}`}
              style={{
                zIndex: 20,
                fontSize: "0.89em",
                letterSpacing: "0.045em",
                boxShadow: completedOffers >= modal.threshold ? "0 0 5px #60A5FA77" : "none",
              }}
            >
              {completedOffers >= modal.threshold ? "✓ Unlocked" : `Unlock at ${modal.threshold}`}
            </span>
          </div>
        </div>
      )}
      <style jsx>{`
        .achievement-wall-mobile-container {
          transition: box-shadow 0.17s cubic-bezier(.23,1,.32,1);
        }
        .animate-spin-slow {
          animation: spin 2.1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg);}
          100% { transform: rotate(360deg);}
        }
        .animate-twinkle {
          animation: twinkle 1.7s ease-in-out infinite alternate;
        }
        @keyframes twinkle {
          0% { box-shadow: 0 0 6px #60A5FA88; }
          100% { box-shadow: 0 0 12px #7b6cfb77; }
        }
        .animate-pop-modal {
          animation: popModal 0.31s cubic-bezier(.23,1,.32,1);
        }
        @keyframes popModal {
          0% { transform: scale(0.89);}
          60% { transform: scale(1.08);}
          100% { transform: scale(1);}
        }
        .animate-fade-in {
          animation: fadeInModal 0.19s cubic-bezier(.23,1,.32,1);
        }
        @keyframes fadeInModal {
          from { opacity: 0; transform: scale(0.98);}
          to { opacity: 1; transform: scale(1);}
        }
      `}</style>
    </div>
  );
}
