import React, { useState, useRef, useEffect } from "react";

/**
 * Ultra-luxury Offerwall Preview Carousel – maximal wow UI/UX,
 * fully responsive for PC & mobile, glassmorphism, smooth animations.
 * Props: offerwalls – array of offerwall objects ({ key, name, logo, color, description })
 *        onOpen – function to open offerwall modal
 */
export default function OfferwallCarousel({ offerwalls = [], onOpen }) {
  // Current index for carousel
  const [current, setCurrent] = useState(0);
  const carouselRef = useRef();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Responsive: detect mobile/PC for sizing
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 700);
    };
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

  const nextSlide = () => setCurrent(c => (c + 1) % offerwalls.length);
  const prevSlide = () => setCurrent(c => (c - 1 + offerwalls.length) % offerwalls.length);

  // Responsive sizes
  const cardMinWidth = isMobile ? "94vw" : "360px";
  const cardMaxWidth = isMobile ? "99vw" : "520px";
  const cardMinHeight = isMobile ? "240px" : "400px";
  const logoSize = isMobile ? 72 : 116;
  const descFontSize = isMobile ? "1.06rem" : "1.24rem";
  const nameFontSize = isMobile ? "1.31rem" : "1.48rem";
  const buttonFontSize = isMobile ? "1.09rem" : "1.15rem";
  const shadowColor = offerwalls[current]?.color || "#60A5FA";

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
            opacity: offerwalls.length > 1 ? 1 : 0,
            pointerEvents: offerwalls.length > 1 ? "auto" : "none",
            width: isMobile ? 38 : 48,
            height: isMobile ? 38 : 48,
          }}
        >
          <svg width="24" height="24" fill="none"><path d="M14 18l-6-6 6-6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>

        {/* Carousel main offerwall card */}
        {offerwalls.length > 0 && (
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
              onClick={() => onOpen && onOpen(offerwalls[current].key)}
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
                src={offerwalls[current].logo}
                alt={offerwalls[current].name + " logo"}
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
                {offerwalls[current].name}
              </div>
              <div className="text-gray-300 px-2 text-center mb-3"
                style={{
                  fontSize: descFontSize,
                  zIndex: 2,
                  fontWeight: 500,
                  lineHeight: isMobile ? "1.18" : "1.22",
                }}>
                {offerwalls[current].description}
              </div>
              {/* Open button */}
              <button
                className="px-6 py-2 rounded-full font-bold bg-gradient-to-br from-accent to-secondary text-white shadow-lg hover:scale-105 active:scale-95 transition"
                style={{ fontSize: buttonFontSize, zIndex: 3, marginTop: "8px", letterSpacing: "0.04em" }}
                onClick={e => { e.stopPropagation(); onOpen && onOpen(offerwalls[current].key); }}
              >
                Open Offerwall
              </button>
            </div>
            {/* Carousel dots */}
            <div className="flex flex-row gap-2 mt-5 items-center justify-center">
              {offerwalls.map((_, idx) => (
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
            opacity: offerwalls.length > 1 ? 1 : 0,
            pointerEvents: offerwalls.length > 1 ? "auto" : "none",
            width: isMobile ? 38 : 48,
            height: isMobile ? 38 : 48,
          }}
        >
          <svg width="24" height="24" fill="none"><path d="M10 6l6 6-6 6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      </div>
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
      `}</style>
    </div>
  );
}
