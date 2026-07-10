export interface Tombstone {
  id: string;
  user_id: string;
  github_repo_id: number;
  repo_name: string;
  repo_full_name: string;
  repo_url: string;
  born_at: string;
  died_at: string;
  buried_at: string;
  cause_of_death: string;
  epitaph: string | null;
  last_words: string | null;
  languages: Record<string, number>;
  stars_count: number;
  commits_count: number;
  peak_streak_days: number;
  latest_night_commit_time: string | null;
  most_commits_one_day: number;
  most_commits_day: string | null;
  eulogy: string | null;
  eulogy_generated_at: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface TombstoneWithStats extends Tombstone {
  candle_count: number;
  rip_count: number;
  resurrection_votes: number;
  github_username?: string;
  github_avatar_url?: string;
}

export interface BurialFormData {
  repo: {
    id: number;
    name: string;
    full_name: string;
    url: string;
  };
  cause_of_death: string;
  epitaph: string;
}

export interface RipMessage {
  id: string;
  tombstone_id: string;
  user_id: string;
  author_name: string;
  author_avatar: string | null;
  message: string;
  created_at: string;
}

export interface FilterState {
  cause?: string;
  language?: string;
  sort: string;
}
