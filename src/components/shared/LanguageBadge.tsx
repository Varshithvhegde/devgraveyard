import { LANGUAGE_COLORS } from "@/lib/constants";

interface LanguageBadgeProps {
  language: string;
  small?: boolean;
}

export default function LanguageBadge({ language, small }: LanguageBadgeProps) {
  const color = LANGUAGE_COLORS[language] ?? "#888";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full bg-white/5 border border-white/10 text-zinc-300 ${
        small ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs"
      }`}
    >
      <span
        className="rounded-full flex-shrink-0"
        style={{
          width: small ? 6 : 8,
          height: small ? 6 : 8,
          backgroundColor: color,
        }}
      />
      {language}
    </span>
  );
}
