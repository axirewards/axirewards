import React from "react";

const BannerAadsLeft = () => (
  <>
    {/* Desktop/tablet only: sticky left banner */}
    <div
      className="
        hidden
        md:flex
        flex-col
        items-center
        justify-center
        fixed
        left-0
        top-1/2
        -translate-y-1/2
        z-[99998]
        bg-black
        border-r
        border-neutral-800
        shadow-lg
        transition
        px-2
        py-2
      "
      style={{
        minWidth: "180px",
        maxWidth: "240px",
        width: "200px",
        borderTopRightRadius: "12px",
        borderBottomRightRadius: "12px",
      }}
    >
      <div
        id="frame"
        className="w-full flex justify-center"
        style={{ width: "100%" }}
      >
        <iframe
          data-aa="2412103"
          src="//acceptable.a-ads.com/2412103/?size=Adaptive&background_color=000000&text_color=ffffff&link_color=ffffff"
          style={{
            border: 0,
            padding: 0,
            width: "100%",
            height: "90px",
            minHeight: "60px",
            maxHeight: "140px",
            overflow: "hidden",
            display: "block",
            margin: "auto",
            borderRadius: "10px",
            background: "#000",
          }}
          title="Advertisement"
          scrolling="no"
          allowtransparency="true"
          frameBorder="0"
        ></iframe>
      </div>
    </div>
    {/* Mobile: do not show banner */}
    <style jsx>{`
      @media (max-width: 640px) {
        .md\\:flex {
          display: none !important;
        }
      }
    `}</style>
  </>
);

export default BannerAadsLeft;
