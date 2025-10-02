import React, { useEffect, useState } from "react";

/**
 * TelOrPc
 * Detects whether the user is on a mobile or desktop device using the most reliable, multi-factor approach.
 * Usage:
 *   <TelOrPc>
 *      {(isMobile) => isMobile ? <MobileComponent /> : <DesktopComponent />}
 *   </TelOrPc>
 */

const MOBILE_MAX_WIDTH = 900; // px, adjust for your project if needed

const checkUserAgent = () => {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || navigator.vendor || window.opera;
  return /android|iphone|ipad|ipod|opera mini|iemobile|wpdesktop|blackberry|webos|mobile/i.test(ua);
};

const checkTouchSupport = () => {
  if (typeof window === "undefined") return false;
  return "ontouchstart" in window || navigator.maxTouchPoints > 0;
};

const checkDevicePixelRatio = () => {
  if (typeof window === "undefined") return false;
  return window.devicePixelRatio > 1.1;
};

const getInitialIsMobile = () => {
  if (typeof window === "undefined") return false; // SSR fallback
  return (
    window.innerWidth <= MOBILE_MAX_WIDTH ||
    checkUserAgent() ||
    checkTouchSupport() ||
    checkDevicePixelRatio()
  );
};

const TelOrPc = ({ children }) => {
  const [isMobile, setIsMobile] = useState(getInitialIsMobile());

  useEffect(() => {
    const handleResize = () => {
      const mobile =
        window.innerWidth <= MOBILE_MAX_WIDTH ||
        checkUserAgent() ||
        checkTouchSupport() ||
        checkDevicePixelRatio();
      setIsMobile(mobile);
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
    };
  }, []);

  if (typeof children === "function") {
    return children(isMobile);
  }
  return <>{isMobile ? children.mobile : children.desktop}</>;
};

export default TelOrPc;
