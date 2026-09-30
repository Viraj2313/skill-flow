CREATE TABLE IF NOT EXISTS mock_interview_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  topic TEXT NOT NULL,
  problem_title TEXT NOT NULL,
  verdict TEXT NOT NULL,
  overall_score INTEGER NOT NULL,
  rubric_scores JSONB NOT NULL DEFAULT '{}'::jsonb,
  duration_seconds INTEGER NOT NULL DEFAULT 0,
  transcript JSONB NOT NULL DEFAULT '[]'::jsonb,
  user_code TEXT,
  feedback JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mock_interview_sessions_user_created ON mock_interview_sessions(user_id, created_at DESC);

ALTER TABLE mock_interview_sessions ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'mock_interview_sessions' AND policyname = 'Users read own mock interviews'
  ) THEN
    CREATE POLICY "Users read own mock interviews"
      ON mock_interview_sessions FOR SELECT USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'mock_interview_sessions' AND policyname = 'Users insert own mock interviews'
  ) THEN
    CREATE POLICY "Users insert own mock interviews"
      ON mock_interview_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;
