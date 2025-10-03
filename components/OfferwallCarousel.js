import React, { useState, useRef, useEffect } from "react";
import AyetOfferwall from "./AyetOfferwall";
import BitLabsOfferwall from "./BitLabsOfferwall";
import CpxOfferwall from "./CpxOfferwall";
import TheoremOfferwall from "./TheoremOfferwall";
import CpaLeadOfferwall from "./CpaLeadOfferwall";

/**
 * Props:
 * offerwalls: array of offerwall config objects
 * compact: boolean – if true, more compact mobile style for DashboardMob (PC version unaffected)
 */
export default function OfferwallCarousel({ offerwalls = [], compact = false }) {
  const [current, setCurrent] = useState(0);
  const carouselRef = useRef();
  const [isMobile, setIsMobile] = useState(false);
  const [activeOfferwall, setActiveOfferwall] = useState(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 700);
    checkMobile();
    window.addEventListener("resize", checkMobile);

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
  }, [offerwalls.length]);

  const nextSlide = () => setCurrent(c => (c + 1) % offerwalls.length);
  const prevSlide = () => setCurrent(c => (c - 1 + offerwalls.length) % offerwalls.length);

  // Sizes
  // Use "compact" prop for mobile DashboardMob, PC version uses previous values.
  const isCompact = compact || isMobile;
  const cardMinWidth = isCompact ? "87vw" : "360px";
  const cardMaxWidth = isCompact ? "96vw" : "520px";
  const cardMinHeight = isCompact ? "164px" : "400px";
  const logoSize = isCompact ? 54 : 116;
  const descFontSize = isCompact ? "0.95rem" : "1.24rem";
  const nameFontSize = isCompact ? "1.09rem" : "1.48rem";
  const buttonFontSize = isCompact ? "0.98rem" : "1.15rem";
  const shadowColor = offerwalls[current]?.color || "#60A5FA";

  // Modal logic
  function renderOfferwallModal() {
    if (!activeOfferwall) return null;
    const wall = offerwalls.find(w => w.key === activeOfferwall);
    if (!wall) return null;
    return (
      <div className="fixed inset-0 z-[1001] bg-black/80 flex items-center justify-center backdrop-blur">
        <div className={`glass-card rounded-3xl shadow-2xl border-4 border-accent max-w-3xl w-full p-4 flex flex-col items-center relative animate-fade-in ${isCompact ? "compact-modal" : ""}`}>
          <button
            className={`absolute top-4 right-6 text-accent font-extrabold hover:text-blue-700 transition ${isCompact ? "text-2xl" : "text-4xl"}`}
            onClick={() => setActiveOfferwall(null)}
            aria-label="Close"
          >
            &times;
          </button>
          {wall.key === "ayet" && (
            <AyetOfferwall adSlot={wall.adSlot} height={isCompact ? "440px" : "700px"} />
          )}
          {wall.key === "bitlabs" && (
            <BitLabsOfferwall apiKey={wall.apiKey} height={isCompact ? "440px" : "700px"} />
          )}
          {wall.key === "cpx" && (
            <CpxOfferwall appId={wall.appId} height={isCompact ? "440px" : "700px"} />
          )}
          {wall.key === "theorem" && (
            <TheoremOfferwall appId={wall.appId} height={isCompact ? "440px" : "700px"} />
          )}
          {wall.key === "cpalead" && (
            <CpaLeadOfferwall height={isCompact ? "440px" : "700px"} iframeUrl={wall.iframeUrl} />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full flex flex-col items-center mt-2 mb-8 px-2 ${isCompact ? "compact" : ""}`}>
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
            opacity: offerwalls.length > 1 ? 1 : 0,
            pointerEvents: offerwalls.length > 1 ? "auto" : "none",
            width: isCompact ? 32 : 48,
            height: isCompact ? 32 : 48,
          }}
        >
          <svg width="20" height="20" fill="none"><path d="M14 18l-6-6 6-6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>

        {/* Carousel main offerwall card */}
        {offerwalls.length > 0 && (
          <div className="flex flex-col items-center justify-center w-full mx-auto">
            <div
              className={`relative group glass-card px-5 py-4 rounded-3xl shadow-2xl border-4 flex flex-col items-center justify-center cursor-pointer transition-all duration-400 hover:scale-[1.035] hover:shadow-accent ${isCompact ? "compact-card" : ""}`}
              style={{
                minWidth: cardMinWidth,
                maxWidth: cardMaxWidth,
                minHeight: cardMinHeight,
                boxShadow: `0 0 68px 0 ${shadowColor}55, 0 2px 18px 0 #7b6cfb88`,
                border: `4px solid ${shadowColor}`,
                background: `linear-gradient(120deg, #151a2b 65%, ${shadowColor}33 100%)`,
                overflow: "hidden",
              }}
              onClick={() => setActiveOfferwall(offerwalls[current].key)}
            >
              {/* Animated ring with glow */}
              <div
                className="absolute inset-0 rounded-3xl z-0 pointer-events-none"
                style={{
                  boxShadow: `0 0 32px 0 ${shadowColor}99`,
                  border: `3px solid ${shadowColor}`,
                  animation: "luxSpin 10s linear infinite",
                  opacity: "0.87",
                }}
              />
              {/* Glass shine */}
              <div
                className="absolute left-0 top-0 w-full h-full pointer-events-none"
                style={{
                  background: `radial-gradient(circle at 56% 19%, #fff1 0%, transparent 70%)`,
                  zIndex: 1,
                  filter: "blur(2.7px)",
                  opacity: 0.17,
                }}
              />
              {/* Logo */}
              <img
                src={offerwalls[current].logo}
                alt={offerwalls[current].name + " logo"}
                className="object-contain mb-3 drop-shadow-lg animate-bounce-slow"
                style={{
                  width: logoSize,
                  height: logoSize,
                  filter: `drop-shadow(0 0 18px ${shadowColor})`,
                  marginTop: isCompact ? '2px' : '18px',
                  zIndex: 2,
                }}
              />
              {/* Name & description */}
              <div className="font-extrabold text-center mb-1"
                style={{
                  fontSize: nameFontSize,
                  color: shadowColor,
                  letterSpacing: "0.045em",
                  textShadow: `0 2px 16px ${shadowColor}44, 0 1px 2px #181e38`,
                  zIndex: 2,
                }}>
                {offerwalls[current].name}
              </div>
              <div className="text-gray-300 px-1 text-center mb-2"
                style={{
                  fontSize: descFontSize,
                  zIndex: 2,
                  fontWeight: 500,
                  lineHeight: isCompact ? "1.13" : "1.22",
                }}>
                {offerwalls[current].description}
              </div>
              {/* Open button */}
              <button
                className="px-5 py-1.5 rounded-full font-bold bg-gradient-to-br from-accent to-secondary text-white shadow-lg hover:scale-105 active:scale-95 transition"
                style={{ fontSize: buttonFontSize, zIndex: 3, marginTop: "4px", letterSpacing: "0.035em" }}
                onClick={e => { e.stopPropagation(); setActiveOfferwall(offerwalls[current].key); }}
              >
                Open Offerwall
              </button>
            </div>
            {/* Carousel dots */}
            <div className="flex flex-row gap-2 mt-3 items-center justify-center">
              {offerwalls.map((_, idx) => (
                <button
                  key={idx}
                  className={`w-3 h-3 rounded-full border-2 border-accent transition-all duration-300 ${
                    idx === current
                      ? "bg-accent shadow-lg scale-[1.11]"
                      : "bg-gray-800 opacity-55"
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
            opacity: offerwalls.length > 1 ? 1 : 0,
            pointerEvents: offerwalls.length > 1 ? "auto" : "none",
            width: isCompact ? 32 : 48,
            height: isCompact ? 32 : 48,
          }}
        >
          <svg width="20" height="20" fill="none"><path d="M10 6l6 6-6 6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
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
          0% { box-shadow: 0 0 32px 0 #60A5FA66; }
          100% { box-shadow: 0 0 32px 0 #7b6cfb99; }
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
        /* Compact styles (for mobile/compact prop) */
        .compact-card {
          border-radius: 1.1rem !important;
          padding: 0.5em 0.6em !important;
        }
        .compact-modal {
          border-radius: 1.1rem !important;
          padding: 0.7em 0.6em !important;
        }
        .compact {
          margin-top: 0.5em !important;
          margin-bottom: 1.2em !important;
          padding-left: 0.5em !important;
          padding-right: 0.5em !important;
        }
      `}</style>
    </div>
  );
}
