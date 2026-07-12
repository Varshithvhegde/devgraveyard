"use client";

import { useEffect, useRef, ReactNode } from "react";

interface ScrollRevealProps {
  children: ReactNode;
  delay?: number;
  className?: string;
  direction?: "up" | "down" | "left" | "right";
}

export default function ScrollReveal({
  children,
  delay = 0,
  className = "",
  direction = "up",
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            el.style.opacity = "1";
            el.style.transform = "translate(0, 0)";
          }, delay);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  const initialTransform = {
    up: "translateY(32px)",
    down: "translateY(-32px)",
    left: "translateX(32px)",
    right: "translateX(-32px)",
  }[direction];

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: 0,
        transform: initialTransform,
        transition: `opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1)`,
      }}
    >
      {children}
    </div>
  );
}
