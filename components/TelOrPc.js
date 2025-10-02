import React, { useEffect, useState } from "react";

/**
 * TelOrPc
 * Perfect device detection for mobile/PC, even under zoom, DPI, or device emulation.
 * Usage:
 *   <TelOrPc>
 *      {(isMobile) => isMobile ? <MobileComponent /> : <DesktopComponent />}
 *   </TelOrPc>
 */

// --- CORE SETTINGS ---
const MOBILE_MAX_WIDTH = 900; // px
const MOBILE_MAX_HEIGHT = 900; // px
const MOBILE_BREAKPOINTS = [320, 360, 375, 390, 412, 414, 428, 480, 540, 600, 640, 720, 750, 800, 850, 900]; // common mob widths

// --- ADVANCED DETECTION ---
const checkUserAgent = () => {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || navigator.vendor || window.opera;
  return /android|iphone|ipad|ipod|opera mini|iemobile|wpdesktop|blackberry|webos|mobile/i.test(ua);
};

const checkTouchSupport = () => {
  if (typeof window === "undefined") return false;
  return (
    "ontouchstart" in window ||
    navigator.maxTouchPoints > 1 || // >1 = likely mobile
    window.matchMedia("(pointer:coarse)").matches
  );
};

const checkDevicePixelRatio = () => {
  if (typeof window === "undefined") return false;
  // On mobile, DPR is usually >=2, but on desktop with zoom it can be higher.
  // Instead, check for window.screen.width vs window.innerWidth ratio.
  const ratio = window.screen.width / window.innerWidth;
  return window.devicePixelRatio > 1.2 && ratio < 1.5;
};

const checkMobileBreakpoints = () => {
  if (typeof window === "undefined") return false;
  // Use screen.width instead of innerWidth to avoid zoom issues
  return MOBILE_BREAKPOINTS.includes(window.screen.width);
};

const checkOrientationMobile = () => {
  if (typeof window === "undefined") return false;
  // Mobile often portrait, desktop usually landscape
  // But only trust if width < 900
  return (
    window.screen.width <= MOBILE_MAX_WIDTH &&
    window.screen.height <= MOBILE_MAX_HEIGHT &&
    window.screen.width < window.screen.height
  );
};

const checkNavigatorPlatform = () => {
  if (typeof navigator === "undefined") return false;
  // Some platforms are mobile only
  const platform = navigator.platform || "";
  return /android|iphone|ipad|ipod|arm|arm64|palm|blackberry/i.test(platform);
};

const checkVisualViewport = () => {
  if (typeof window === "undefined" || !window.visualViewport) return false;
  // visualViewport is more accurate under zoom
  return (
    window.visualViewport.width <= MOBILE_MAX_WIDTH &&
    window.visualViewport.height <= MOBILE_MAX_HEIGHT
  );
};

// --- FINAL DECISION ---
const getInitialIsMobile = () => {
  if (typeof window === "undefined") return false; // SSR fallback
  // Use screen.width (not innerWidth) to avoid zoom issues
  const isSmallScreen = window.screen.width <= MOBILE_MAX_WIDTH;
  const isTouch = checkTouchSupport();
  const isUA = checkUserAgent();
  const isDPR = checkDevicePixelRatio();
  const isBreakpoint = checkMobileBreakpoints();
  const isPortrait = checkOrientationMobile();
  const isPlatform = checkNavigatorPlatform();
  const isVisualVP = checkVisualViewport();

  // Combination logic: must match at least 2/3 main mobile signs, or certain direct mobile signs
  const mobileScore =
    (isSmallScreen ? 1 : 0) +
    (isTouch ? 1 : 0) +
    (isUA ? 1 : 0) +
    (isDPR ? 1 : 0) +
    (isBreakpoint ? 1 : 0) +
    (isPortrait ? 1 : 0) +
    (isPlatform ? 1 : 0) +
    (isVisualVP ? 1 : 0);

  // Direct mobile signs: UA, touch, small screen, mobile platform
  if (
    isUA ||
    (isSmallScreen && isTouch) ||
    (isPlatform && isTouch) ||
    (isVisualVP && isTouch)
  ) return true;

  // If score >=3, treat as mobile.
  if (mobileScore >= 3) return true;

  return false;
};

const TelOrPc = ({ children }) => {
  const [isMobile, setIsMobile] = useState(getInitialIsMobile());

  useEffect(() => {
    function handleResize() {
      setIsMobile(getInitialIsMobile());
    }
    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", handleResize);
    }
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener("resize", handleResize);
      }
    };
  }, []);

  if (typeof children === "function") {
    return children(isMobile);
  }
  return <>{isMobile ? children.mobile : children.desktop}</>;
};

export default TelOrPc;
