"use client";

import { Textarea } from "@/components/ui/textarea";

interface EpitaphInputProps {
  value: string;
  onChange: (value: string) => void;
}

const MAX = 100;

export default function EpitaphInput({ value, onChange }: EpitaphInputProps) {
  const remaining = MAX - value.length;

  return (
    <div className="space-y-2">
      <Textarea
        placeholder='e.g. "It worked on localhost. That was enough."'
        value={value}
        onChange={(e) => onChange(e.target.value.slice(0, MAX))}
        rows={3}
        className="bg-zinc-900 border-zinc-700 text-zinc-200 placeholder:text-zinc-500 resize-none font-gothic italic text-lg"
      />
      <div
        className={`text-right text-xs font-mono transition-colors ${
          remaining < 10
            ? "text-red-400"
            : remaining < 25
            ? "text-amber-400"
            : "text-zinc-600"
        }`}
      >
        {remaining} chars left
      </div>
    </div>
  );
}
