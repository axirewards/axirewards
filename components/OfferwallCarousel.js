import React, { useState, useRef, useEffect } from "react";
import AyetOfferwall from "./AyetOfferwall";
import BitLabsOfferwall from "./BitLabsOfferwall";
import CpxOfferwall from "./CpxOfferwall";
import TheoremOfferwall from "./TheoremOfferwall";

/**
 * OfferwallCarousel – visi offerwallai, hardcoded, modalas ir atidarymas viduje,
 * kiekvienas atsidaro savo modalą, užsidaro, swipe/arrow veikia.
 */
const OFFERWALLS = [
  {
    key: "ayet",
    name: "Ayet Studios",
    logo: "/icons/ayetlogo.png",
    color: "#60A5FA",
    adSlot: "23274",
    description: "Complete surveys, apps and tasks for premium AXI rewards.",
  },
  {
    key: "bitlabs",
    name: "BitLabs",
    logo: "/icons/bitlabslogo.png",
    color: "#62D6FB",
    apiKey: "2dfb7d19-2974-4085-b686-181bcb681b70",
    description: "Complete surveys and earn AXI points with BitLabs.",
  },
  {
    key: "cpx",
    name: "CPX Research",
    logo: "/icons/cpxlogo.png",
    color: "#5AF599",
    appId: "29422",
    description: "Complete surveys and earn AXI points with CPX Research.",
  },
  {
    key: "theorem",
    name: "TheoremReach",
    logo: "/icons/theoremreachlogo.png",
    color: "#7b6cfb",
    appId: "24198",
    description: "Complete surveys and earn AXI points with TheoremReach.",
  },
];

export default function OfferwallCarousel() {
  // Carousel
  const [current, setCurrent] = useState(0);
  const carouselRef = useRef();
  const [isMobile, setIsMobile] = useState(false);

  // Modal
  const [activeOfferwall, setActiveOfferwall] = useState(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 700);
    checkMobile();
    window.addEventListener("resize", checkMobile);

    // Swipe gestures (mobile)
    let startX = null;
    const handleTouchStart = e => { startX = e.touches[0].clientX; };
    const handleTouchMove = e => {
      if (!startX) return;
      const diffX = e.touches[0].clientX - startX;
      if (Math.abs(diffX) > 48) {
        if (diffX > 0) prevSlide();
        else nextSlide();
        startX = null;
      }
    };
    const carousel = carouselRef.current;
    carousel?.addEventListener("touchstart", handleTouchStart);
    carousel?.addEventListener("touchmove", handleTouchMove);

    return () => {
      window.removeEventListener("resize", checkMobile);
      carousel?.removeEventListener("touchstart", handleTouchStart);
      carousel?.removeEventListener("touchmove", handleTouchMove);
    };
  }, []);

  const nextSlide = () => setCurrent(c => (c + 1) % OFFERWALLS.length);
  const prevSlide = () => setCurrent(c => (c - 1 + OFFERWALLS.length) % OFFERWALLS.length);

  // Sizes
  const cardMinWidth = isMobile ? "94vw" : "360px";
  const cardMaxWidth = isMobile ? "99vw" : "520px";
  const cardMinHeight = isMobile ? "240px" : "400px";
  const logoSize = isMobile ? 72 : 116;
  const descFontSize = isMobile ? "1.06rem" : "1.24rem";
  const nameFontSize = isMobile ? "1.31rem" : "1.48rem";
  const buttonFontSize = isMobile ? "1.09rem" : "1.15rem";
  const shadowColor = OFFERWALLS[current]?.color || "#60A5FA";

  // Offerwall modal logic
  function renderOfferwallModal() {
    if (!activeOfferwall) return null;
    const wall = OFFERWALLS.find(w => w.key === activeOfferwall);
    return (
      <div className="fixed inset-0 z-[1001] bg-black/80 flex items-center justify-center backdrop-blur">
        <div className="glass-card rounded-3xl shadow-2xl border-4 border-accent max-w-3xl w-full p-8 flex flex-col items-center relative animate-fade-in">
          <button
            className="absolute top-4 right-6 text-accent text-4xl font-extrabold hover:text-blue-700 transition"
            onClick={() => setActiveOfferwall(null)}
            aria-label="Close"
          >
            &times;
          </button>
          {wall.key === "ayet" && (
            <AyetOfferwall adSlot={wall.adSlot} height="700px" />
          )}
          {wall.key === "bitlabs" && (
            <BitLabsOfferwall apiKey={wall.apiKey} height="700px" />
          )}
          {wall.key === "cpx" && (
            <CpxOfferwall appId={wall.appId} height="700px" />
          )}
          {wall.key === "theorem" && (
            <TheoremOfferwall appId={wall.appId} height="700px" />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center mt-2 mb-8 px-2">
      <div
        ref={carouselRef}
        className="relative w-full flex items-center justify-center"
        style={{ minHeight: cardMinHeight }}
      >
        {/* Carousel arrow left */}
        <button
          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-br from-[#1c2233] to-[#60A5FA] text-white rounded-full shadow-lg p-2 z-10 hover:scale-110 transition"
          onClick={prevSlide}
          aria-label="Prev"
          style={{
            opacity: OFFERWALLS.length > 1 ? 1 : 0,
            pointerEvents: OFFERWALLS.length > 1 ? "auto" : "none",
            width: isMobile ? 38 : 48,
            height: isMobile ? 38 : 48,
          }}
        >
          <svg width="24" height="24" fill="none"><path d="M14 18l-6-6 6-6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>

        {/* Carousel main offerwall card */}
        {OFFERWALLS.length > 0 && (
          <div className="flex flex-col items-center justify-center w-full mx-auto">
            <div
              className="relative group glass-card px-7 py-8 rounded-3xl shadow-2xl border-4 flex flex-col items-center justify-center cursor-pointer transition-all duration-400 hover:scale-[1.035] hover:shadow-accent"
              style={{
                minWidth: cardMinWidth,
                maxWidth: cardMaxWidth,
                minHeight: cardMinHeight,
                boxShadow: `0 0 68px 0 ${shadowColor}55, 0 2px 18px 0 #7b6cfb88`,
                border: `4px solid ${shadowColor}`,
                background: `linear-gradient(120deg, #151a2b 65%, ${shadowColor}33 100%)`,
                overflow: "hidden",
              }}
              onClick={() => setActiveOfferwall(OFFERWALLS[current].key)}
            >
              {/* Animated ring with glow */}
              <div
                className="absolute inset-0 rounded-3xl z-0 pointer-events-none"
                style={{
                  boxShadow: `0 0 48px 0 ${shadowColor}99`,
                  border: `3px solid ${shadowColor}`,
                  animation: "luxSpin 10s linear infinite",
                  opacity: "0.95",
                }}
              />
              {/* Glass shine */}
              <div
                className="absolute left-0 top-0 w-full h-full pointer-events-none"
                style={{
                  background: `radial-gradient(circle at 56% 19%, #fff1 0%, transparent 70%)`,
                  zIndex: 1,
                  filter: "blur(2.7px)",
                  opacity: 0.22,
                }}
              />
              {/* Logo */}
              <img
                src={OFFERWALLS[current].logo}
                alt={OFFERWALLS[current].name + " logo"}
                className="object-contain mb-4 drop-shadow-lg animate-bounce-slow"
                style={{
                  width: logoSize,
                  height: logoSize,
                  filter: `drop-shadow(0 0 24px ${shadowColor})`,
                  marginTop: isMobile ? '5px' : '18px',
                  zIndex: 2,
                }}
              />
              {/* Name & description */}
              <div className="font-extrabold text-center mb-2"
                style={{
                  fontSize: nameFontSize,
                  color: shadowColor,
                  letterSpacing: "0.05em",
                  textShadow: `0 2px 16px ${shadowColor}44, 0 1px 2px #181e38`,
                  zIndex: 2,
                }}>
                {OFFERWALLS[current].name}
              </div>
              <div className="text-gray-300 px-2 text-center mb-3"
                style={{
                  fontSize: descFontSize,
                  zIndex: 2,
                  fontWeight: 500,
                  lineHeight: isMobile ? "1.18" : "1.22",
                }}>
                {OFFERWALLS[current].description}
              </div>
              {/* Open button */}
              <button
                className="px-6 py-2 rounded-full font-bold bg-gradient-to-br from-accent to-secondary text-white shadow-lg hover:scale-105 active:scale-95 transition"
                style={{ fontSize: buttonFontSize, zIndex: 3, marginTop: "8px", letterSpacing: "0.04em" }}
                onClick={e => { e.stopPropagation(); setActiveOfferwall(OFFERWALLS[current].key); }}
              >
                Open Offerwall
              </button>
            </div>
            {/* Carousel dots */}
            <div className="flex flex-row gap-2 mt-5 items-center justify-center">
              {OFFERWALLS.map((_, idx) => (
                <button
                  key={idx}
                  className={`w-4 h-4 rounded-full border-2 border-accent transition-all duration-300 ${
                    idx === current
                      ? "bg-accent shadow-lg scale-[1.19]"
                      : "bg-gray-800 opacity-60"
                  }`}
                  onClick={() => setCurrent(idx)}
                  aria-label={`Go to offerwall ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Carousel arrow right */}
        <button
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-br from-[#1c2233] to-[#60A5FA] text-white rounded-full shadow-lg p-2 z-10 hover:scale-110 transition"
          onClick={nextSlide}
          aria-label="Next"
          style={{
            opacity: OFFERWALLS.length > 1 ? 1 : 0,
            pointerEvents: OFFERWALLS.length > 1 ? "auto" : "none",
            width: isMobile ? 38 : 48,
            height: isMobile ? 38 : 48,
          }}
        >
          <svg width="24" height="24" fill="none"><path d="M10 6l6 6-6 6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      </div>
      {/* Render offerwall modal (if active) */}
      {renderOfferwallModal()}
      <style jsx>{`
        .glass-card {
          background: rgba(24, 32, 56, 0.965);
          backdrop-filter: blur(18px);
          border-radius: 1.75rem;
        }
        .shadow-accent {
          box-shadow: 0 0 32px #60A5fa33, 0 2px 14px #7b6cfb44;
        }
        @keyframes luxSpin {
          0% { box-shadow: 0 0 48px 0 #60A5FA66; }
          100% { box-shadow: 0 0 48px 0 #7b6cfb99; }
        }
        .animate-bounce-slow {
          animation: bounce-slow 2.2s cubic-bezier(.23,1,.32,1) infinite alternate;
        }
        @keyframes bounce-slow {
          0% { transform: translateY(0);}
          100% { transform: translateY(-8px);}
        }
        .animate-fade-in {
          animation: fadeInModal 0.28s cubic-bezier(.23,1,.32,1);
        }
        @keyframes fadeInModal {
          from { opacity: 0; transform: scale(0.98);}
          to { opacity: 1; transform: scale(1);}
        }
      `}</style>
    </div>
  );
}
