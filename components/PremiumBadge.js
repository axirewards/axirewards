import React from "react";

/**
 * Top-notch Luxury VIP Badge: diamond, gold, silver.
 * Responsive for both PC and mobile. Uses animated gradients, glassmorphism, glow, and subtle shine.
 * Props: type ("diamond", "gold", "silver")
 */
export default function PremiumBadge({ type = "diamond" }) {
  const badgeColors = {
    diamond: {
      border: "linear-gradient(90deg,#8fdafd,#7b6cfb,#60A5FA)",
      bg: "linear-gradient(135deg,#16203a 0%,#7b6cfb 80%,#60A5FA 100%)",
      text: "#7b6cfb",
      shadow: "#7b6cfb77",
      icon: "/icons/diamond.svg",
      label: "DIAMOND VIP",
      glass: "rgba(142,218,253,0.09)",
      shine: "#b8eaff",
    },
    gold: {
      border: "linear-gradient(90deg,#FFD700,#FFB300,#FFF8E1)",
      bg: "linear-gradient(135deg,#332b03 0%,#FFD700 80%,#FFF8E1 100%)",
      text: "#FFD700",
      shadow: "#FFD70066",
      icon: "/icons/gold.svg",
      label: "GOLD VIP",
      glass: "rgba(255,215,0,0.09)",
      shine: "#fff8e1",
    },
    silver: {
      border: "linear-gradient(90deg,#dbeafe,#f1f5f9,#60A5FA)",
      bg: "linear-gradient(135deg,#23395d 0%,#dbeafe 80%,#60A5FA 100%)",
      text: "#60A5FA",
      shadow: "#60A5FA77",
      icon: "/icons/silver.svg",
      label: "SILVER VIP",
      glass: "rgba(219,234,254,0.13)",
      shine: "#f1f5f9",
    },
  };

  const c = badgeColors[type] || badgeColors["diamond"];

  return (
    <div
      className="relative"
      style={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        className={`premium-badge flex flex-col items-center justify-center px-7 py-4 rounded-full border-4 bg-clip-padding backdrop-blur-lg`}
        style={{
          minWidth: "180px",
          maxWidth: "360px",
          border: "4px solid transparent",
          borderImage: c.border + " 1",
          background: c.bg,
          boxShadow: `0 0 38px 0 ${c.shadow}, 0 2px 12px 0 ${c.shadow}`,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Shine */}
        <div
          className="absolute left-0 top-0 w-full h-full pointer-events-none"
          style={{
            background: `radial-gradient(circle at 50% 12%, ${c.shine}22 0%, transparent 60%)`,
            zIndex: 1,
            filter: "blur(2.5px)",
          }}
        />
        {/* Glass */}
        <div
          className="absolute left-0 top-0 w-full h-full pointer-events-none"
          style={{
            background: `linear-gradient(120deg,${c.glass} 0%,transparent 100%)`,
            zIndex: 2,
            mixBlendMode: "lighten",
          }}
        />
        {/* Icon + Label */}
        <img
          src={c.icon}
          alt={c.label}
          className="w-11 h-11 mb-2"
          style={{
            filter: "drop-shadow(0 0 12px " + c.shadow + ") brightness(1.2)",
            zIndex: 3,
            animation: "badgeBounce 2.3s cubic-bezier(.23,1,.32,1) infinite alternate",
          }}
        />
        <span
          className="font-extrabold tracking-wide uppercase"
          style={{
            color: c.text,
            fontSize: "1.2rem",
            letterSpacing: "0.12em",
            textShadow: `0 0 8px ${c.shadow}, 0 1px 2px #181e38`,
            zIndex: 3,
          }}
        >
          {c.label}
        </span>
        {/* Shine line */}
        <div
          className="absolute left-0 top-0 w-full h-2 pointer-events-none"
          style={{
            background: `linear-gradient(90deg,transparent 0%,${c.shine} 60%,transparent 100%)`,
            zIndex: 2,
            opacity: 0.65,
            animation: "badgeShineMove 2.6s linear infinite",
          }}
        />
      </div>
      <style jsx>{`
        .premium-badge {
          transition: box-shadow 0.32s cubic-bezier(.23,1,.32,1), background 0.13s;
        }
        @media (max-width: 700px) {
          .premium-badge {
            min-width: 140px;
            max-width: 98vw;
            padding: 16px 0;
          }
          span {
            font-size: 1.05rem !important;
          }
        }
        @keyframes badgeBounce {
          0% { transform: translateY(0);}
          100% { transform: translateY(-6px);}
        }
        @keyframes badgeShineMove {
          0% { transform: translateX(-100%);}
          100% { transform: translateX(100%);}
        }
      `}</style>
    </div>
  );
}
