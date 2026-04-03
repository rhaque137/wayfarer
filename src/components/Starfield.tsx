"use client";

import { useEffect, useRef } from "react";

type Star = {
  x: number;
  y: number;
  z: number;
  r: number;
  tw: number;
};

export function Starfield({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const starsRef = useRef<Star[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (!starsRef.current.length) {
      const count = 220;
      const list: Star[] = [];
      for (let i = 0; i < count; i++) {
        list.push({
          x: Math.random(),
          y: Math.random(),
          z: Math.random(),
          r: 0.6 + Math.random() * 1.8,
          tw: Math.random() * Math.PI * 2,
        });
      }
      starsRef.current = list;
    }

    let raf = 0;
    let w = 0;
    let h = 0;
    let dpr = 1;
    let scrollY = 0;
    const mouse = { x: 0.5, y: 0.5 };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = Math.floor(window.innerWidth);
      h = Math.floor(window.innerHeight);
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const onScroll = () => {
      scrollY = window.scrollY || 0;
    };
    const onMove = (e: PointerEvent) => {
      mouse.x = e.clientX / Math.max(1, w);
      mouse.y = e.clientY / Math.max(1, h);
    };

    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h);

      ctx.fillStyle = "#040710";
      ctx.fillRect(0, 0, w, h);

      const parallaxX = (mouse.x - 0.5) * 22;
      const parallaxY = (mouse.y - 0.5) * 18 + Math.min(28, scrollY * 0.04);

      for (const s of starsRef.current) {
        const depth = 0.4 + s.z * 0.9;
        const x = s.x * w + parallaxX * depth;
        const y = s.y * h + parallaxY * depth;
        const tw = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * 0.001 + s.tw));
        const a = 0.18 + 0.48 * tw * depth;

        ctx.beginPath();
        ctx.fillStyle = `rgba(234,242,255,${a.toFixed(3)})`;
        ctx.arc(x, y, s.r * depth, 0, Math.PI * 2);
        ctx.fill();
      }

      // subtle cyan nebula glow
      const g = ctx.createRadialGradient(w * 0.68, h * 0.32, 0, w * 0.68, h * 0.32, Math.max(w, h) * 0.72);
      g.addColorStop(0, "rgba(0,229,255,0.14)");
      g.addColorStop(1, "rgba(0,229,255,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      raf = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointermove", onMove, { passive: true });
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return <canvas ref={canvasRef} className={className} />;
}
