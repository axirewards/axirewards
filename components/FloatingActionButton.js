import React from "react";

/**
 * Ultra-luxury Floating Action Button (FAB).
 * PC: fixed bottom right, larger, glass/gradient, hover glow, tooltip.
 * Mobile: sticky bottom, smaller, easy touch, pulse.
 * Props: onClick – callback function
 */
export default function FloatingActionButton({ onClick }) {
  // Responsive sizing for PC/mobile
  const isMobile =
    typeof window !== "undefined" ? window.innerWidth < 700 : false;
  const size = isMobile ? 54 : 72;
  const iconSize = isMobile ? 26 : 38;
  const bottom = isMobile ? 18 : 32;
  const right = isMobile ? 18 : 32;

  return (
    <div
      className="fab-container"
      style={{
        position: "fixed",
        bottom: bottom,
        right: right,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,
      }}
    >
      <button
        className={`fab-btn flex items-center justify-center rounded-full border-4 transition-all duration-200 active:scale-92`}
        onClick={onClick}
        aria-label="Open Main Menu"
        style={{
          width: size,
          height: size,
          background: "linear-gradient(135deg,#60A5FA 60%,#7b6cfb 100%)",
          boxShadow:
            "0 0 32px 0 #60A5fa77,0 2px 16px 0 #7b6cfb77,0 0 0 5px #fff1",
          borderColor: "#fff",
          backdropFilter: "blur(8px)",
          position: "relative",
        }}
      >
        <div
          className="fab-shine"
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            pointerEvents: "none",
            background:
              "radial-gradient(circle at 55% 25%,#fff6 0%,transparent 70%)",
            zIndex: 1,
            filter: "blur(1.5px)",
          }}
        />
        <img
          src="/icons/plus.svg"
          alt="Action"
          style={{
            width: iconSize,
            height: iconSize,
            filter: "drop-shadow(0 0 9px #fff)",
            zIndex: 2,
            position: "relative",
          }}
        />
      </button>
      {/* Tooltip (PC only) */}
      {!isMobile && (
        <span
          className="fab-tooltip"
          style={{
            position: "absolute",
            right: size + 16,
            bottom: 0,
            background:
              "linear-gradient(90deg,#232e40cc 0%,#60A5FA88 100%)",
            color: "#fff",
            padding: "7px 15px",
            fontSize: "1.08rem",
            fontWeight: 600,
            borderRadius: "14px",
            letterSpacing: "0.06em",
            boxShadow: "0 2px 12px #232e40bb",
            whiteSpace: "nowrap",
            pointerEvents: "none",
            opacity: 0.93,
            transition: "opacity .22s",
          }}
        >
          Main Menu
        </span>
      )}
      <style jsx>{`
        .fab-btn {
          animation: fabPop 2.2s cubic-bezier(.23,1,.32,1) infinite alternate;
        }
        @media (max-width: 700px) {
          .fab-container {
            bottom: 18px !important;
            right: 18px !important;
            width: 54px !important;
            height: 54px !important;
          }
          .fab-btn {
            width: 54px !important;
            height: 54px !important;
          }
        }
        @keyframes fabPop {
          0% { transform: scale(1);}
          80% { transform: scale(1.10);}
          100% { transform: scale(1);}
        }
      `}</style>
    </div>
  );
}
