import React from "react";

/**
 * Luxury Floating Action Button (FAB) – mobile sticky, animated, opens main action or menu.
 * Props: onClick – callback function
 */
export default function FloatingActionButton({ onClick }) {
  return (
    <button
      className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-gradient-to-br from-accent to-secondary shadow-2xl border-4 border-white flex items-center justify-center animate-fab-pop active:scale-95 transition"
      onClick={onClick}
      aria-label="Open Main Menu"
      style={{
        boxShadow: "0 0 32px 0 #60A5fa66, 0 2px 14px 0 #7b6cfb77",
        borderColor: "#fff",
      }}
    >
      <img
        src="/icons/plus.svg"
        alt="Action"
        className="w-8 h-8"
        style={{ filter: "drop-shadow(0 0 8px #fff)" }}
      />
      <style jsx>{`
        .animate-fab-pop {
          animation: fabPop 1.8s cubic-bezier(.23,1,.32,1) infinite alternate;
        }
        @keyframes fabPop {
          0% { transform: scale(1);}
          70% { transform: scale(1.08);}
          100% { transform: scale(1);}
        }
      `}</style>
    </button>
  );
}
