import { CommitAnalysis, GitHubCommit } from "@/types/github";

export function computePeakObsession(commits: GitHubCommit[]): Omit<
  CommitAnalysis,
  "firstCommitDate" | "lastCommitDate" | "lastCommitMessage" | "languages"
> {
  if (commits.length === 0) {
    return {
      totalCommits: 0,
      peakStreakDays: 0,
      latestNightCommitTime: null,
      mostCommitsOneDay: 0,
      mostCommitsDay: null,
    };
  }

  const sorted = [...commits].sort(
    (a, b) =>
      new Date(a.commit.author.date).getTime() -
      new Date(b.commit.author.date).getTime()
  );

  // commits per day
  const byDay = new Map<string, number>();
  let latestNightHour = -1;
  let latestNightTime: string | null = null;

  for (const c of sorted) {
    const date = new Date(c.commit.author.date);
    const day = date.toISOString().split("T")[0];
    byDay.set(day, (byDay.get(day) ?? 0) + 1);

    const hour = date.getHours();
    // "night" = midnight to 5am
    if (hour >= 0 && hour < 5 && hour > latestNightHour) {
      latestNightHour = hour;
      const mins = date.getMinutes().toString().padStart(2, "0");
      const ampm = hour < 12 ? "AM" : "PM";
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      latestNightTime = `${displayHour}:${mins} ${ampm}`;
    }
  }

  let mostCommitsOneDay = 0;
  let mostCommitsDay: string | null = null;
  for (const [day, count] of byDay.entries()) {
    if (count > mostCommitsOneDay) {
      mostCommitsOneDay = count;
      mostCommitsDay = day;
    }
  }

  // streak calculation
  const days = Array.from(byDay.keys()).sort();
  let maxStreak = 1;
  let currentStreak = 1;
  for (let i = 1; i < days.length; i++) {
    const prev = new Date(days[i - 1]).getTime();
    const curr = new Date(days[i]).getTime();
    if (curr - prev === 86400000) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      currentStreak = 1;
    }
  }

  return {
    totalCommits: commits.length,
    peakStreakDays: days.length > 0 ? maxStreak : 0,
    latestNightCommitTime: latestNightTime,
    mostCommitsOneDay,
    mostCommitsDay,
  };
}

export function ageString(bornAt: string, diedAt: string): string {
  const born = new Date(bornAt);
  const died = new Date(diedAt);
  const days = Math.floor((died.getTime() - born.getTime()) / 86400000);
  if (days < 1) return "less than a day";
  if (days < 30) return `${days} day${days === 1 ? "" : "s"}`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months === 1 ? "" : "s"}`;
  const years = Math.floor(days / 365);
  const remMonths = Math.floor((days % 365) / 30);
  return remMonths > 0
    ? `${years}y ${remMonths}m`
    : `${years} year${years === 1 ? "" : "s"}`;
}
