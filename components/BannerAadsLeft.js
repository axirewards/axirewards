import React from "react";

const BannerAadsLeft = () => (
  <>
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
        minWidth: "120px",
        maxWidth: "180px",
        width: "160px",
        height: "600px", // pailgas banneris
        borderTopRightRadius: "18px",
        borderBottomRightRadius: "18px",
      }}
    >
      <div
        id="frame"
        className="w-full h-full flex justify-center items-center"
        style={{ width: "100%", height: "100%" }}
      >
        <iframe
          data-aa="2412103"
          src="//acceptable.a-ads.com/2412103/?size=160x600&background_color=000000&text_color=ffffff&link_color=ffffff"
          style={{
            border: 0,
            padding: 0,
            width: "100%",
            height: "100%",
            minHeight: "400px",
            maxHeight: "900px",
            overflow: "hidden",
            display: "block",
            margin: "auto",
            borderRadius: "14px",
            background: "#000",
          }}
          title="Advertisement Left"
          scrolling="no"
          allowtransparency="true"
          frameBorder="0"
        ></iframe>
      </div>
    </div>
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
