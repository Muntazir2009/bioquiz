"use client";

import { useRef, useEffect } from "react";

interface BackgroundBeamsProps {
  className?: string;
}

export function BackgroundBeams({ className = "" }: BackgroundBeamsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let beams: Array<{
      x: number;
      y: number;
      length: number;
      angle: number;
      speed: number;
      opacity: number;
      width: number;
    }> = [];

    function resize() {
      if (!canvas) return;
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx!.scale(window.devicePixelRatio, window.devicePixelRatio);
    }

    function initBeams() {
      if (!canvas) return;
      beams = Array.from({ length: 6 }, () => ({
        x: Math.random() * canvas.offsetWidth,
        y: Math.random() * canvas.offsetHeight,
        length: 80 + Math.random() * 200,
        angle: Math.random() * Math.PI * 2,
        speed: 0.2 + Math.random() * 0.5,
        opacity: 0.02 + Math.random() * 0.04,
        width: 1 + Math.random() * 2,
      }));
    }

    function draw() {
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

      for (const b of beams) {
        const endX = b.x + Math.cos(b.angle) * b.length;
        const endY = b.y + Math.sin(b.angle) * b.length;

        const grad = ctx.createLinearGradient(b.x, b.y, endX, endY);
        grad.addColorStop(0, `rgba(46, 185, 223, 0)`);
        grad.addColorStop(0.5, `rgba(46, 185, 223, ${b.opacity})`);
        grad.addColorStop(1, `rgba(46, 185, 223, 0)`);

        ctx.beginPath();
        ctx.moveTo(b.x, b.y);
        ctx.lineTo(endX, endY);
        ctx.strokeStyle = grad;
        ctx.lineWidth = b.width;
        ctx.stroke();

        b.y -= b.speed;
        b.angle += (Math.random() - 0.5) * 0.01;

        if (b.y + b.length < 0) {
          b.y = canvas.offsetHeight + b.length;
          b.x = Math.random() * canvas.offsetWidth;
        }
      }

      animId = requestAnimationFrame(draw);
    }

    resize();
    initBeams();
    draw();

    window.addEventListener("resize", () => {
      resize();
      initBeams();
    });

    return () => {
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none absolute inset-0 z-0 ${className}`}
    />
  );
}
