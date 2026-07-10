-- ============================================================
-- DEVGRAVEYARD — SUPABASE SCHEMA
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. USERS (extends auth.users)
CREATE TABLE public.users (
  id               UUID        REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  github_username  TEXT        NOT NULL,
  github_avatar_url TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TOMBSTONES
CREATE TABLE public.tombstones (
  id               UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id          UUID        REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  github_repo_id   BIGINT      NOT NULL,
  repo_name        TEXT        NOT NULL,
  repo_full_name   TEXT        NOT NULL,
  repo_url         TEXT        NOT NULL,
  born_at          TIMESTAMPTZ NOT NULL,
  died_at          TIMESTAMPTZ NOT NULL,
  buried_at        TIMESTAMPTZ DEFAULT NOW(),
  cause_of_death   TEXT        NOT NULL,
  epitaph          TEXT        CHECK (char_length(epitaph) <= 100),
  last_words       TEXT,
  languages        JSONB       DEFAULT '{}',
  stars_count      INT         DEFAULT 0,
  commits_count    INT         DEFAULT 0,
  peak_streak_days          INT  DEFAULT 0,
  latest_night_commit_time  TEXT,
  most_commits_one_day      INT  DEFAULT 0,
  most_commits_day          DATE,
  eulogy                    TEXT,
  eulogy_generated_at       TIMESTAMPTZ,
  is_public        BOOLEAN     DEFAULT TRUE,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, github_repo_id)
);

-- 3. CANDLES
CREATE TABLE public.candles (
  id             UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  tombstone_id   UUID        REFERENCES public.tombstones(id) ON DELETE CASCADE NOT NULL,
  user_id        UUID        REFERENCES public.users(id) ON DELETE SET NULL,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (tombstone_id, user_id)
);

-- 4. RIP MESSAGES
CREATE TABLE public.rip_messages (
  id             UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  tombstone_id   UUID        REFERENCES public.tombstones(id) ON DELETE CASCADE NOT NULL,
  user_id        UUID        REFERENCES public.users(id) ON DELETE SET NULL,
  author_name    TEXT        NOT NULL,
  author_avatar  TEXT,
  message        TEXT        NOT NULL CHECK (char_length(message) <= 280),
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- 5. RESURRECTION VOTES
CREATE TABLE public.resurrection_votes (
  id             UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  tombstone_id   UUID        REFERENCES public.tombstones(id) ON DELETE CASCADE NOT NULL,
  user_id        UUID        REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (tombstone_id, user_id)
);

-- ============================================================
-- AGGREGATION VIEW
-- ============================================================
CREATE VIEW public.tombstone_stats AS
SELECT
  t.*,
  COALESCE(c.candle_count, 0)       AS candle_count,
  COALESCE(r.rip_count, 0)          AS rip_count,
  COALESCE(v.resurrection_votes, 0) AS resurrection_votes
FROM public.tombstones t
LEFT JOIN (
  SELECT tombstone_id, COUNT(*)::INT AS candle_count
  FROM public.candles GROUP BY tombstone_id
) c ON c.tombstone_id = t.id
LEFT JOIN (
  SELECT tombstone_id, COUNT(*)::INT AS rip_count
  FROM public.rip_messages GROUP BY tombstone_id
) r ON r.tombstone_id = t.id
LEFT JOIN (
  SELECT tombstone_id, COUNT(*)::INT AS resurrection_votes
  FROM public.resurrection_votes GROUP BY tombstone_id
) v ON v.tombstone_id = t.id;

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_tombstones_user    ON public.tombstones(user_id);
CREATE INDEX idx_tombstones_cause   ON public.tombstones(cause_of_death);
CREATE INDEX idx_tombstones_public  ON public.tombstones(is_public) WHERE is_public = TRUE;
CREATE INDEX idx_tombstones_created ON public.tombstones(created_at DESC);
CREATE INDEX idx_candles_tombstone  ON public.candles(tombstone_id);
CREATE INDEX idx_rip_tombstone      ON public.rip_messages(tombstone_id);
CREATE INDEX idx_resurrect_tomb     ON public.resurrection_votes(tombstone_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE public.users               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tombstones          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candles             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rip_messages        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resurrection_votes  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_read_own"   ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "users_insert_own" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "users_update_own" ON public.users FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "tombstones_public_read" ON public.tombstones FOR SELECT USING (is_public = TRUE);
CREATE POLICY "tombstones_own_read"    ON public.tombstones FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "tombstones_own_insert"  ON public.tombstones FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "tombstones_own_update"  ON public.tombstones FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "tombstones_own_delete"  ON public.tombstones FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "candles_read_all"    ON public.candles FOR SELECT USING (TRUE);
CREATE POLICY "candles_insert_auth" ON public.candles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "candles_delete_own"  ON public.candles FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "rip_read_all"    ON public.rip_messages FOR SELECT USING (TRUE);
CREATE POLICY "rip_insert_auth" ON public.rip_messages FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "resurrect_read_all"    ON public.resurrection_votes FOR SELECT USING (TRUE);
CREATE POLICY "resurrect_insert_auth" ON public.resurrection_votes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "resurrect_delete_own"  ON public.resurrection_votes FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- TRIGGER: auto-create user profile on GitHub OAuth signup
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.users (id, github_username, github_avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'user_name',
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
