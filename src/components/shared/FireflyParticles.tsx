"use client";

import { useEffect, useRef } from "react";

interface Firefly {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  opacity: number;
  opacityDir: number;
  color: string;
  wobble: number;
  wobbleSpeed: number;
  phase: number;
}

export default function FireflyParticles({ count = 28 }: { count?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number>(0);
  const firefliesRef = useRef<Firefly[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const colors = [
      "rgba(251,191,36,",   // amber
      "rgba(167,139,250,",  // lavender
      "rgba(139,92,246,",   // purple
      "rgba(253,224,71,",   // gold
    ];

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const spawn = (y?: number): Firefly => ({
      x: Math.random() * canvas.width,
      y: y ?? canvas.height + Math.random() * 100,
      size: 1.5 + Math.random() * 2.5,
      speedY: 0.3 + Math.random() * 0.5,
      speedX: (Math.random() - 0.5) * 0.3,
      opacity: 0,
      opacityDir: 0.008 + Math.random() * 0.012,
      color: colors[Math.floor(Math.random() * colors.length)],
      wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: 0.01 + Math.random() * 0.02,
      phase: Math.random(),
    });

    firefliesRef.current = Array.from({ length: count }, () =>
      spawn(Math.random() * (canvas.height ?? 800))
    );

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const f of firefliesRef.current) {
        f.wobble += f.wobbleSpeed;
        f.x += f.speedX + Math.sin(f.wobble) * 0.4;
        f.y -= f.speedY;
        f.opacity += f.opacityDir;

        if (f.opacity > 0.85 || f.opacity < 0) f.opacityDir *= -1;
        f.opacity = Math.max(0, Math.min(0.85, f.opacity));

        if (f.y < -20) Object.assign(f, spawn());

        const grd = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.size * 4);
        grd.addColorStop(0, `${f.color}${f.opacity})`);
        grd.addColorStop(0.4, `${f.color}${f.opacity * 0.4})`);
        grd.addColorStop(1, `${f.color}0)`);

        ctx.beginPath();
        ctx.arc(f.x, f.y, f.size * 4, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(f.x, f.y, f.size * 0.6, 0, Math.PI * 2);
        ctx.fillStyle = `${f.color}${Math.min(f.opacity * 1.5, 1)})`;
        ctx.fill();
      }

      frameRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [count]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 1 }}
    />
  );
}
