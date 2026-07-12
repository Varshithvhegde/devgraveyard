"use client";

import { useState, useEffect } from "react";
import { GitHubRepo } from "@/types/github";
import { formatDate } from "@/lib/utils";
import LanguageBadge from "@/components/shared/LanguageBadge";
import { Input } from "@/components/ui/input";

interface RepoPickerProps {
  onSelect: (repo: GitHubRepo) => void;
  selected: GitHubRepo | null;
}

export default function RepoPicker({ onSelect, selected }: RepoPickerProps) {
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [buriedIds, setBuriedIds] = useState<Set<number>>(new Set());
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/github/repos")
      .then((r) => r.json())
      .then(async (data) => {
        if (data.error) throw new Error(data.error);
        setRepos(data.repos);
        // Fetch already-buried repo IDs for this user
        const buried = await fetch("/api/tombstones/buried-repos").then(r => r.json()).catch(() => ({ ids: [] }));
        setBuriedIds(new Set(buried.ids ?? []));
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = repos.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-16 bg-zinc-800/50 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-400 bg-red-950/30 border border-red-800/40 rounded-lg p-4 text-sm">
        Failed to load repositories: {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search your repos..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="bg-zinc-900 border-zinc-700 text-zinc-200 placeholder:text-zinc-500"
      />
      <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
        {filtered.length === 0 && (
          <p className="text-zinc-500 text-sm text-center py-8">No repos found</p>
        )}
        {filtered.map((repo) => {
          const alreadyBuried = buriedIds.has(repo.id);
          return (
            <button
              key={repo.id}
              onClick={() => !alreadyBuried && onSelect(repo)}
              disabled={alreadyBuried}
              className={`w-full text-left p-4 rounded-lg border transition-all ${
                alreadyBuried
                  ? "border-zinc-800 bg-zinc-900/30 opacity-50 cursor-not-allowed"
                  : selected?.id === repo.id
                  ? "border-purple-500 bg-purple-950/30"
                  : "border-zinc-700/50 bg-zinc-900/50 hover:border-zinc-600 hover:bg-zinc-800/50"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-zinc-200 truncate">{repo.name}</p>
                    {alreadyBuried && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded font-mono text-zinc-500"
                        style={{ border: "1px solid rgba(255,255,255,0.08)", background: "rgba(0,0,0,0.3)" }}>
                        already buried
                      </span>
                    )}
                  </div>
                  {repo.description && (
                    <p className="text-zinc-500 text-xs mt-0.5 line-clamp-1">{repo.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {repo.language && <LanguageBadge language={repo.language} small />}
                  <span className="text-zinc-600 text-xs font-mono">{formatDate(repo.pushed_at)}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
