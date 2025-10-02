import React, { useRef, useEffect } from "react";

/**
 * Luxury animated background: waves, coins, particles.
 * Works both on desktop and mobile.
 * Use type="waves-coins", "particles", etc.
 */
export default function ParticleBackground({ type = "waves-coins" }) {
  const canvasRef = useRef();

  useEffect(() => {
    // Simple animated background (waves + shimmering coins).
    // For ultra luxury, use a canvas with animated gradients and circles.
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animationFrameId;
    let width = window.innerWidth;
    let height = window.innerHeight;

    canvas.width = width;
    canvas.height = height;

    const coins = [];
    for (let i = 0; i < 18; i++) {
      coins.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: 16 + Math.random() * 26,
        speed: 0.7 + Math.random() * 1.2,
        color: [
          "#60A5FA",
          "#3B82F6",
          "#FFD700",
          "#7b6cfb",
          "#1E3A8A",
        ][Math.floor(Math.random() * 5)],
        angle: Math.random() * Math.PI * 2,
      });
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);

      // Gradient background
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, "#1E3A8A");
      grad.addColorStop(0.5, "#3B82F6");
      grad.addColorStop(1, "#060A38");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Waves
      for (let i = 0; i < 3; i++) {
        ctx.globalAlpha = 0.08 + i * 0.03;
        ctx.beginPath();
        for (let x = 0; x < width; x += 16) {
          ctx.lineTo(
            x,
            height / 2 +
              Math.sin(x / 200 + Date.now() / 900 + i * 2) * (22 + i * 12)
          );
        }
        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.closePath();
        ctx.fillStyle = ["#60A5FA", "#3B82F6", "#7b6cfb"][i];
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Coins
      coins.forEach((coin, idx) => {
        coin.y -= coin.speed;
        coin.angle += 0.02;
        if (coin.y < -coin.r) {
          coin.y = height + coin.r;
          coin.x = Math.random() * width;
        }
        ctx.save();
        ctx.translate(coin.x, coin.y);
        ctx.rotate(Math.sin(coin.angle) * 0.2);
        ctx.beginPath();
        ctx.arc(0, 0, coin.r, 0, Math.PI * 2);
        ctx.fillStyle = coin.color;
        ctx.shadowColor = "#fff";
        ctx.shadowBlur = 18;
        ctx.globalAlpha = 0.16 + 0.18 * Math.abs(Math.sin(coin.angle));
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(draw);
    }
    draw();

    // Responsive canvas
    function handleResize() {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    }
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, [type]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 0,
        pointerEvents: "none",
      }}
      aria-hidden
    />
  );
}
