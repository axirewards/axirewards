import React from 'react';

const BannerAads = () => (
  <div
    className="
      w-full
      flex
      items-center
      justify-center
      bg-black
      py-2
      px-2
      border-t
      border-neutral-800
      relative
      z-50
      transition
      shadow-lg
      "
    style={{
      minHeight: '60px',
    }}
  >
    <div
      id="frame"
      className="w-full flex justify-center"
      style={{ maxWidth: 900, width: '100%' }}
    >
      <iframe
        data-aa="2412102"
        src="//acceptable.a-ads.com/2412102/?size=Adaptive&background_color=000000&text_color=ffffff&link_color=ffffff"
        style={{
          border: 0,
          padding: 0,
          width: '100%',
          height: 60,
          minHeight: 40,
          maxHeight: 120,
          display: 'block',
          margin: 'auto'
        }}
        title="Advertisement"
        scrolling="no"
        allowtransparency="true"
        frameBorder="0"
      ></iframe>
    </div>
    <style jsx>{`
      @media (max-width: 640px) {
        #frame iframe {
          height: 60px !important;
        }
      }
      @media (min-width: 641px) {
        #frame iframe {
          height: 90px !important;
        }
      }
    `}</style>
  </div>
);

export default BannerAads;
