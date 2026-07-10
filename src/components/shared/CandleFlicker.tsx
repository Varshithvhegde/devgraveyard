interface CandleFlickerProps {
  lit?: boolean;
  size?: number;
}

export default function CandleFlicker({ lit = true, size = 24 }: CandleFlickerProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={lit ? "candle-lit" : "opacity-40"}
    >
      {lit && (
        <ellipse
          cx="12"
          cy="5"
          rx="2.5"
          ry="3.5"
          fill="#fbbf24"
          className="candle-flame"
          opacity="0.9"
        />
      )}
      <rect x="10" y="7" width="4" height="12" rx="1" fill={lit ? "#f5f0e8" : "#6b7280"} />
      <rect x="9" y="19" width="6" height="2" rx="0.5" fill={lit ? "#e5e7eb" : "#4b5563"} />
      {lit && (
        <line x1="12" y1="7" x2="12" y2="5" stroke="#d4d4d4" strokeWidth="0.5" />
      )}
    </svg>
  );
}
