"use client";

import { useState } from "react";
import { CAUSES_OF_DEATH } from "@/lib/constants";
import { Input } from "@/components/ui/input";

interface CauseOfDeathSelectProps {
  value: string;
  onChange: (value: string) => void;
}

export default function CauseOfDeathSelect({ value, onChange }: CauseOfDeathSelectProps) {
  const [custom, setCustom] = useState(false);
  const [customValue, setCustomValue] = useState("");

  const presets = CAUSES_OF_DEATH.filter((c) => c !== "Custom...");

  const handleSelect = (cause: string) => {
    if (cause === "Custom...") {
      setCustom(true);
      onChange(customValue);
    } else {
      setCustom(false);
      onChange(cause);
    }
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        {presets.map((cause) => (
          <button
            key={cause}
            type="button"
            onClick={() => handleSelect(cause)}
            className={`text-left px-3 py-2.5 rounded-lg border text-sm transition-all ${
              value === cause && !custom
                ? "border-purple-500 bg-purple-950/40 text-purple-300"
                : "border-zinc-700/50 bg-zinc-900/50 text-zinc-400 hover:border-zinc-600 hover:text-zinc-300"
            }`}
          >
            {cause}
          </button>
        ))}
        <button
          type="button"
          onClick={() => handleSelect("Custom...")}
          className={`text-left px-3 py-2.5 rounded-lg border text-sm transition-all ${
            custom
              ? "border-purple-500 bg-purple-950/40 text-purple-300"
              : "border-zinc-700/50 bg-zinc-900/50 text-zinc-400 hover:border-zinc-600 hover:text-zinc-300"
          }`}
        >
          Custom...
        </button>
      </div>
      {custom && (
        <Input
          placeholder="Write your own cause of death..."
          value={customValue}
          onChange={(e) => {
            setCustomValue(e.target.value);
            onChange(e.target.value);
          }}
          className="bg-zinc-900 border-zinc-700 text-zinc-200 placeholder:text-zinc-500"
          maxLength={80}
          autoFocus
        />
      )}
    </div>
  );
}
