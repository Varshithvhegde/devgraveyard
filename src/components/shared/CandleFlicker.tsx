interface CandleFlickerProps {
  lit?: boolean;
  size?: number;
}

export default function CandleFlicker({ lit = true, size = 24 }: CandleFlickerProps) {
  return (
    <svg
      width={size}
      height={size * 1.1}
      viewBox="0 0 20 22"
      fill="none"
      className={lit ? "candle-lit" : "opacity-30"}
    >
      {/* Outer glow halo */}
      {lit && (
        <ellipse
          cx="10"
          cy="4"
          rx="4"
          ry="5"
          fill="rgba(251,191,36,0.08)"
          className="candle-flame"
        />
      )}
      {/* Flame */}
      {lit && (
        <path
          d="M10 1 C9 2.5 7.5 3.5 8 5.5 C8.5 7 10 7.5 10 7.5 C10 7.5 11.5 7 12 5.5 C12.5 3.5 11 2.5 10 1Z"
          fill="#fbbf24"
          className="candle-flame"
        />
      )}
      {/* Inner bright flame core */}
      {lit && (
        <path
          d="M10 2.5 C9.4 3.5 9 4.5 9.3 5.5 C9.6 6.5 10 6.8 10 6.8 C10 6.8 10.4 6.5 10.7 5.5 C11 4.5 10.6 3.5 10 2.5Z"
          fill="#fde68a"
          className="candle-flame"
          opacity="0.8"
        />
      )}
      {/* Wick */}
      <line
        x1="10" y1={lit ? "7.5" : "7"}
        x2="10" y2="9"
        stroke={lit ? "#92400e" : "#4b5563"}
        strokeWidth="0.8"
        strokeLinecap="round"
      />
      {/* Candle body */}
      <rect
        x="7.5" y="9" width="5" height="10"
        rx="0.5"
        fill={lit ? "rgba(245,240,232,0.9)" : "rgba(107,114,128,0.6)"}
      />
      {/* Wax drip */}
      {lit && (
        <path d="M7.5 11 Q6.8 12 7.5 13" stroke="rgba(245,240,232,0.3)" strokeWidth="0.8" fill="none" />
      )}
      {/* Base */}
      <rect
        x="6.5" y="19" width="7" height="2"
        rx="0.5"
        fill={lit ? "rgba(245,240,232,0.6)" : "rgba(75,85,99,0.5)"}
      />
      {/* Candlelight floor glow */}
      {lit && (
        <ellipse cx="10" cy="21.5" rx="5" ry="1" fill="rgba(251,191,36,0.06)" />
      )}
    </svg>
  );
}
