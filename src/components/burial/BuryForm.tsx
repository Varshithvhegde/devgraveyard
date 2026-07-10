"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GitHubRepo } from "@/types/github";
import RepoPicker from "./RepoPicker";
import CauseOfDeathSelect from "./CauseOfDeathSelect";
import EpitaphInput from "./EpitaphInput";
import TombstoneCard from "@/components/tombstone/TombstoneCard";
import { TombstoneWithStats } from "@/types/tombstone";
import { toast } from "sonner";

type Step = 1 | 2 | 3;

export default function BuryForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepo | null>(null);
  const [cause, setCause] = useState("");
  const [epitaph, setEpitaph] = useState("");
  const [commitData, setCommitData] = useState<Record<string, unknown> | null>(null);
  const [loadingCommits, setLoadingCommits] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const goToStep2 = async () => {
    if (!selectedRepo) return;
    setLoadingCommits(true);
    try {
      const res = await fetch(
        `/api/github/commits?repo=${selectedRepo.full_name}`
      );
      const data = await res.json();
      setCommitData(data);
      setStep(2);
    } catch {
      toast.error("Failed to analyze repository");
    } finally {
      setLoadingCommits(false);
    }
  };

  const previewTombstone: TombstoneWithStats = {
    id: "preview",
    user_id: "",
    github_repo_id: selectedRepo?.id ?? 0,
    repo_name: selectedRepo?.name ?? "your-project",
    repo_full_name: selectedRepo?.full_name ?? "",
    repo_url: selectedRepo?.html_url ?? "",
    born_at:
      (commitData?.firstCommitDate as string) ??
      selectedRepo?.created_at ??
      new Date().toISOString(),
    died_at:
      (commitData?.lastCommitDate as string) ??
      selectedRepo?.pushed_at ??
      new Date().toISOString(),
    buried_at: new Date().toISOString(),
    cause_of_death: cause || "Cause of death TBD",
    epitaph: epitaph || null,
    last_words: (commitData?.lastCommitMessage as string) ?? null,
    languages: (commitData?.languages as Record<string, number>) ?? {},
    stars_count: selectedRepo?.stargazers_count ?? 0,
    commits_count: (commitData?.totalCommits as number) ?? 0,
    peak_streak_days: (commitData?.peakStreakDays as number) ?? 0,
    latest_night_commit_time:
      (commitData?.latestNightCommitTime as string) ?? null,
    most_commits_one_day: (commitData?.mostCommitsOneDay as number) ?? 0,
    most_commits_day: (commitData?.mostCommitsDay as string) ?? null,
    eulogy: null,
    eulogy_generated_at: null,
    is_public: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    candle_count: 0,
    rip_count: 0,
    resurrection_votes: 0,
  };

  const handleBury = async () => {
    if (!selectedRepo || !cause) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/tombstones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repo: {
            id: selectedRepo.id,
            name: selectedRepo.name,
            full_name: selectedRepo.full_name,
            url: selectedRepo.html_url,
          },
          cause_of_death: cause,
          epitaph,
          ...commitData,
          starsCount: selectedRepo.stargazers_count,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Project buried. Rest in peace. 🕯️");
      router.push(`/tombstone/${data.tombstone.id}`);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to bury project");
    } finally {
      setSubmitting(false);
    }
  };

  const steps = [
    { n: 1, label: "Choose Victim" },
    { n: 2, label: "Write Epitaph" },
    { n: 3, label: "Confirm Burial" },
  ];

  return (
    <div className="max-w-2xl mx-auto">
      {/* Step indicator */}
      <div className="flex items-center justify-center gap-2 mb-10">
        {steps.map((s, i) => (
          <div key={s.n} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-mono transition-all ${
                step === s.n
                  ? "border-purple-500 bg-purple-500/20 text-purple-300"
                  : step > s.n
                  ? "border-zinc-500 bg-zinc-700 text-zinc-400"
                  : "border-zinc-700 text-zinc-600"
              }`}
            >
              {step > s.n ? "✓" : s.n}
            </div>
            <span
              className={`text-sm hidden sm:block ${
                step === s.n ? "text-zinc-300" : "text-zinc-600"
              }`}
            >
              {s.label}
            </span>
            {i < steps.length - 1 && (
              <div
                className={`w-8 h-px ${
                  step > s.n ? "bg-zinc-500" : "bg-zinc-700"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Pick repo */}
      {step === 1 && (
        <div className="space-y-6">
          <div>
            <h2 className="font-gothic text-2xl text-bone mb-1">
              Choose a Victim
            </h2>
            <p className="text-zinc-500 text-sm">
              Select the project you&apos;d like to give a proper burial.
            </p>
          </div>
          <RepoPicker onSelect={setSelectedRepo} selected={selectedRepo} />
          <button
            onClick={goToStep2}
            disabled={!selectedRepo || loadingCommits}
            className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-zinc-700 disabled:text-zinc-500 text-white font-semibold rounded-lg transition-colors"
          >
            {loadingCommits ? "Analyzing commit history..." : "Proceed to Burial →"}
          </button>
        </div>
      )}

      {/* Step 2: Cause + epitaph */}
      {step === 2 && (
        <div className="space-y-6">
          <div>
            <h2 className="font-gothic text-2xl text-bone mb-1">
              Write the Epitaph
            </h2>
            <p className="text-zinc-500 text-sm">
              How did <span className="text-zinc-300">{selectedRepo?.name}</span> meet its end?
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-zinc-500">
              Cause of Death *
            </label>
            <CauseOfDeathSelect value={cause} onChange={setCause} />
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-zinc-500">
              Epitaph{" "}
              <span className="normal-case text-zinc-600">(optional)</span>
            </label>
            <EpitaphInput value={epitaph} onChange={setEpitaph} />
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep(1)}
              className="flex-1 py-3 border border-zinc-700 text-zinc-400 hover:text-zinc-300 hover:border-zinc-600 font-semibold rounded-lg transition-colors"
            >
              ← Back
            </button>
            <button
              onClick={() => setStep(3)}
              disabled={!cause}
              className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-zinc-700 disabled:text-zinc-500 text-white font-semibold rounded-lg transition-colors"
            >
              Preview →
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Preview + confirm */}
      {step === 3 && (
        <div className="space-y-6">
          <div>
            <h2 className="font-gothic text-2xl text-bone mb-1">
              Confirm the Burial
            </h2>
            <p className="text-zinc-500 text-sm">
              Take one last look before committing to the ground.
            </p>
          </div>

          <div className="max-w-xs mx-auto">
            <TombstoneCard tombstone={previewTombstone} interactive={false} />
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep(2)}
              className="flex-1 py-3 border border-zinc-700 text-zinc-400 hover:text-zinc-300 hover:border-zinc-600 font-semibold rounded-lg transition-colors"
            >
              ← Edit
            </button>
            <button
              onClick={handleBury}
              disabled={submitting}
              className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-zinc-700 disabled:text-zinc-500 text-white font-semibold rounded-lg transition-colors"
            >
              {submitting ? "Digging the grave..." : "⚰️ Bury It"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
