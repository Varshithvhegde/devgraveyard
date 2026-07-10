"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { CAUSES_OF_DEATH, SORT_OPTIONS } from "@/lib/constants";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function TombstoneFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const update = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(`/graveyard?${params.toString()}`);
  };

  return (
    <div className="flex flex-wrap gap-3 items-center">
      <Select
        value={searchParams.get("sort") ?? "newest"}
        onValueChange={(v) => v && update("sort", v)}
      >
        <SelectTrigger className="w-52 bg-zinc-900 border-zinc-700 text-zinc-300">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent className="bg-zinc-900 border-zinc-700">
          {SORT_OPTIONS.map((o) => (
            <SelectItem key={o.value} value={o.value} className="text-zinc-300 focus:bg-zinc-800">
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={searchParams.get("cause") ?? "all"}
        onValueChange={(v) => v && update("cause", v)}
      >
        <SelectTrigger className="w-52 bg-zinc-900 border-zinc-700 text-zinc-300">
          <SelectValue placeholder="Cause of Death" />
        </SelectTrigger>
        <SelectContent className="bg-zinc-900 border-zinc-700">
          <SelectItem value="all" className="text-zinc-300 focus:bg-zinc-800">All Causes</SelectItem>
          {CAUSES_OF_DEATH.filter((c) => c !== "Custom...").map((cause) => (
            <SelectItem key={cause} value={cause} className="text-zinc-300 focus:bg-zinc-800">
              {cause}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
