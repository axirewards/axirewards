import React, { useRef, useEffect } from "react";

/**
 * Ultra luxury animated background: waves, coins, particles.
 * Navy blue theme, covers even largest PC screens.
 * Use type="waves-coins", "particles", etc.
 */
export default function ParticleBackground({ type = "waves-coins" }) {
  const canvasRef = useRef();

  useEffect(() => {
    // Super large canvas for all screens
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animationFrameId;
    // Always set much larger than viewport for scroll
    let width = Math.max(window.innerWidth, 3000);
    let height = Math.max(window.innerHeight, 3000);

    canvas.width = width;
    canvas.height = height;

    // More coins for big screens
    const coins = [];
    for (let i = 0; i < Math.floor(width / 150); i++) {
      coins.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: 18 + Math.random() * 28,
        speed: 0.6 + Math.random() * 1.3,
        color: [
          "#23395d", // DARK navy
          "#1E3A8A", // navy
          "#2C3E50", // navy blue
          "#3B82F6", // blue accent
          "#FFD700", // gold
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

      // Waves - navy/blue/gold
      for (let i = 0; i < 3; i++) {
        ctx.globalAlpha = 0.09 + i * 0.04;
        ctx.beginPath();
        for (let x = 0; x < width; x += 18) {
          ctx.lineTo(
            x,
            height / 2 +
              Math.sin(x / (180 + i * 35) + Date.now() / (900 + i * 200)) * (28 + i * 14)
          );
        }
        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.closePath();
        ctx.fillStyle = ["#23395d", "#3B82F6", "#FFD700"][i];
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Coins - navy and gold
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
        ctx.shadowColor = "#FFD700";
        ctx.shadowBlur = 13;
        ctx.globalAlpha = 0.15 + 0.15 * Math.abs(Math.sin(coin.angle));
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(draw);
    }
    draw();

    // Responsive canvas
    function handleResize() {
      width = Math.max(window.innerWidth, 3000);
      height = Math.max(window.innerHeight, 3000);
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
        minWidth: "3000px",
        minHeight: "3000px",
        zIndex: 0,
        pointerEvents: "none",
        background: "linear-gradient(135deg, #1E2746 0%, #23395d 60%, #060A38 100%)",
      }}
      aria-hidden
    />
  );
}
