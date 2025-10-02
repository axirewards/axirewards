import React from "react";

/**
 * Luxury VIP Badge: diamond, gold, silver – animated, ultra-premium.
 * Props: type ("diamond", "gold", "silver")
 */
export default function PremiumBadge({ type = "diamond" }) {
  const badgeColors = {
    diamond: {
      border: "from-[#8fdafd] via-[#7b6cfb] to-[#60A5FA]",
      bg: "bg-gradient-to-br from-[#c9f7ff] via-[#e3e6ff] to-[#7b6cfb]",
      text: "text-[#7b6cfb]",
      shadow: "shadow-[0_0_24px_#7b6cfb77]",
      icon: "/icons/diamond.svg",
      label: "DIAMOND VIP",
    },
    gold: {
      border: "from-[#FFD700] via-[#FFB300] to-[#FFF8E1]",
      bg: "bg-gradient-to-br from-[#FFF8E1] via-[#FFD700] to-[#FFB300]",
      text: "text-[#FFD700]",
      shadow: "shadow-[0_0_24px_#FFD70077]",
      icon: "/icons/gold.svg",
      label: "GOLD VIP",
    },
    silver: {
      border: "from-[#dbeafe] via-[#f1f5f9] to-[#60A5FA]",
      bg: "bg-gradient-to-br from-[#f1f5f9] via-[#dbeafe] to-[#60A5FA]",
      text: "text-[#60A5FA]",
      shadow: "shadow-[0_0_24px_#60A5FA77]",
      icon: "/icons/silver.svg",
      label: "SILVER VIP",
    },
  };

  const c = badgeColors[type] || badgeColors["diamond"];

  return (
    <div
      className={`relative flex flex-col items-center justify-center px-6 py-3 rounded-full border-4 border-transparent bg-clip-padding ${c.bg} ${c.shadow}`}
      style={{
        borderImage: `linear-gradient(90deg, ${c.border.replace(/from-|via-|to-/g, "")}) 1`,
        animation: "shine 2.2s linear infinite",
        minWidth: "160px",
        boxShadow: "0 0 32px 0 #60A5fa66",
      }}
    >
      <img
        src={c.icon}
        alt={c.label}
        className="w-9 h-9 mb-2 animate-bounce"
        style={{ filter: "drop-shadow(0 0 8px #60A5FA)" }}
      />
      <span className={`font-extrabold text-lg tracking-wide ${c.text} uppercase`}>
        {c.label}
      </span>
      <style jsx>{`
        @keyframes shine {
          0% {
            box-shadow: 0 0 24px 0 ${c.shadow.split("_")[3]}, 0 0 0px #fff;
          }
          54% {
            box-shadow: 0 0 32px 2px #fff, 0 0 24px 0 ${c.shadow.split("_")[3]};
          }
          100% {
            box-shadow: 0 0 24px 0 ${c.shadow.split("_")[3]}, 0 0 0px #fff;
          }
        }
      `}</style>
    </div>
  );
}
