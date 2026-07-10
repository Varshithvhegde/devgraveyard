export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  pushed_at: string;
  created_at: string;
  fork: boolean;
  private: boolean;
}

export interface GitHubCommit {
  sha: string;
  commit: {
    author: {
      name: string;
      date: string;
    };
    message: string;
  };
}

export interface CommitAnalysis {
  firstCommitDate: string;
  lastCommitDate: string;
  lastCommitMessage: string;
  totalCommits: number;
  peakStreakDays: number;
  latestNightCommitTime: string | null;
  mostCommitsOneDay: number;
  mostCommitsDay: string | null;
  languages: Record<string, number>;
}
