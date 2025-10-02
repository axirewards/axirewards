import React, { useRef, useEffect } from "react";

/**
 * Top-notch animated background: waves, coins, particles.
 * Navy blue theme, always fits viewport perfectly (no overflow/out-of-bounds), works for PC and mobile.
 * Black replaces gold bubbles.
 */
export default function ParticleBackground({ type = "waves-coins" }) {
  const canvasRef = useRef();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animationFrameId;
    // Set canvas size to viewport only, never bigger
    let width = window.innerWidth;
    let height = window.innerHeight;

    function resizeCanvas() {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    }
    resizeCanvas();

    // Responsive coins per width
    const coins = [];
    const coinCount = Math.floor(Math.max(width, height) / 110);
    for (let i = 0; i < coinCount; i++) {
      coins.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: 14 + Math.random() * 22,
        speed: 0.6 + Math.random() * 1.1,
        color: [
          "#23395d", // DARK navy
          "#1E3A8A", // navy
          "#2C3E50", // navy blue
          "#3B82F6", // blue accent
          "#181A1B", // black (replaces gold)
        ][Math.floor(Math.random() * 5)],
        angle: Math.random() * Math.PI * 2,
      });
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);

      // Navy gradient background
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, "#1E2746");
      grad.addColorStop(0.22, "#1E3A8A");
      grad.addColorStop(0.44, "#23395d");
      grad.addColorStop(0.66, "#2C3E50");
      grad.addColorStop(1, "#060A38");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Waves - navy/blue/black
      for (let i = 0; i < 3; i++) {
        ctx.globalAlpha = 0.09 + i * 0.04;
        ctx.beginPath();
        for (let x = 0; x < width; x += 16) {
          ctx.lineTo(
            x,
            height / 2 +
              Math.sin(x / (180 + i * 35) + Date.now() / (900 + i * 200)) * (22 + i * 12)
          );
        }
        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.closePath();
        ctx.fillStyle = ["#23395d", "#3B82F6", "#181A1B"][i];
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Coins - navy and black
      coins.forEach((coin) => {
        coin.y -= coin.speed;
        coin.angle += 0.018;
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
        ctx.shadowColor = "#181A1B";
        ctx.shadowBlur = 10;
        ctx.globalAlpha = 0.14 + 0.14 * Math.abs(Math.sin(coin.angle));
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(draw);
    }
    draw();

    window.addEventListener("resize", resizeCanvas);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resizeCanvas);
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
        background: "linear-gradient(135deg, #1E2746 0%, #23395d 60%, #060A38 100%)",
      }}
      aria-hidden
    />
  );
}
