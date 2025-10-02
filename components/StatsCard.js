import React from "react";

/**
 * Luxury stats card for dashboard – glassmorphism, animated effects, icons, mobile-first.
 * Props: title, value, unit, icon, animateConfetti, animatePulse, animateShine, animateSparkle
 */
export default function StatsCard({
  title,
  value,
  unit,
  icon,
  animateConfetti,
  animatePulse,
  animateShine,
  animateSparkle,
}) {
  return (
    <div
      className={`glass-card flex flex-col items-center justify-center py-6 px-4 border border-accent shadow-xl transition-all duration-400 hover:scale-105`}
      style={{
        minWidth: "180px",
        maxWidth: "100%",
        boxShadow: "0 2px 16px 0 #60A5fa22",
        position: "relative",
      }}
    >
      <img src={icon} alt={title} className="w-10 h-10 mb-2" />
      <h4 className="text-lg font-bold text-white mb-1">{title}</h4>
      <span className="text-3xl font-extrabold text-accent">{value}</span>
      <span className="text-md text-secondary">{unit}</span>
      {/* Confetti/sparkle/pulse/shine effects */}
      {animateConfetti && (
        <span className="absolute top-2 right-2">
          <ConfettiIcon />
        </span>
      )}
      {animatePulse && (
        <span className="absolute bottom-2 left-2">
          <PulseIcon />
        </span>
      )}
      {animateShine && (
        <span className="absolute bottom-2 right-2">
          <ShineIcon />
        </span>
      )}
      {animateSparkle && (
        <span className="absolute top-2 left-2">
          <SparkleIcon />
        </span>
      )}
      <style jsx>{`
        .glass-card {
          background: rgba(24, 32, 56, 0.86);
          backdrop-filter: blur(22px);
          border-radius: 1.5rem;
          box-shadow: 0 2px 32px 0 #60A5fa22, 0 1.5px 8px 0 #60A5fa33;
          border: 2.5px solid #60A5FA55;
        }
      `}</style>
    </div>
  );
}

// Example animated icon components, can be replaced with SVGs or Lottie.
function ConfettiIcon() {
  return (
    <svg width="24" height="24" className="animate-bounce" fill="none">
      <circle cx="12" cy="12" r="8" fill="#FFD700" />
      <circle cx="18" cy="7" r="2" fill="#60A5FA" />
      <circle cx="6" cy="17" r="2" fill="#7b6cfb" />
    </svg>
  );
}
function PulseIcon() {
  return (
    <svg width="18" height="18" className="animate-pulse" fill="none">
      <circle cx="9" cy="9" r="7" stroke="#3B82F6" strokeWidth="3" />
    </svg>
  );
}
function ShineIcon() {
  return (
    <svg width="20" height="20" className="animate-shine" fill="none">
      <rect x="2" y="2" width="16" height="16" rx="4" fill="#60A5FA" />
      <rect x="6" y="6" width="8" height="8" rx="2" fill="#FFD700" />
    </svg>
  );
}
function SparkleIcon() {
  return (
    <svg width="18" height="18" className="animate-sparkle" fill="none">
      <path
        d="M9 2v4M9 12v4M2 9h4M12 9h4"
        stroke="#7b6cfb"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="9" cy="9" r="2" fill="#FFD700" />
    </svg>
  );
}
