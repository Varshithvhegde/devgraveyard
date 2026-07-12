"use client";

import { useEffect, useRef, useState } from "react";

function AnimatedNumber({ target }: { target: number }) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        const duration = 1600;
        const start = performance.now();
        const tick = (now: number) => {
          const p = Math.min((now - start) / duration, 1);
          const ease = 1 - Math.pow(1 - p, 4);
          setValue(Math.round(ease * target));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target]);

  return <span ref={ref}>{value.toLocaleString()}</span>;
}

interface StatsClientProps {
  buried: number;
  candles: number;
  messages: number;
}

export default function GraveyardStatsClient({ buried, candles, messages }: StatsClientProps) {
  const stats = [
    { value: buried,   label: "Projects Buried",   icon: "⚰️", color: "rgba(167,139,250,0.9)" },
    { value: candles,  label: "Candles Lit",        icon: "🕯️", color: "rgba(251,191,36,0.9)"  },
    { value: messages, label: "RIP Messages",       icon: "🪦", color: "rgba(110,231,183,0.7)"  },
  ];

  return (
    <section className="relative py-16 overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-800/40 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-800/20 to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_100%_at_50%_50%,rgba(88,28,135,0.06),transparent)]" />

      <div className="relative max-w-4xl mx-auto px-6">
        <div className="grid grid-cols-3 gap-6 text-center">
          {stats.map((s) => (
            <div key={s.label} className="group">
              <div className="text-3xl mb-3 select-none transition-transform duration-300 group-hover:scale-110">
                {s.icon}
              </div>
              <div
                className="font-gothic text-4xl sm:text-5xl font-bold leading-none mb-2"
                style={{
                  color: s.color,
                  textShadow: `0 0 32px ${s.color.replace("0.9", "0.2").replace("0.7", "0.15")}`,
                }}
              >
                <AnimatedNumber target={s.value} />
              </div>
              <div className="text-zinc-600 text-xs uppercase tracking-widest">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
