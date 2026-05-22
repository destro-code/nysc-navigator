ALTER TABLE public.forum_posts
ADD COLUMN IF NOT EXISTS moderation_flags_count INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS recent_posts_1h INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS repeat_content_detected BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS public.forum_post_user_moderation (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  posts_last_hour INTEGER NOT NULL DEFAULT 0,
  posts_last_24h INTEGER NOT NULL DEFAULT 0,
  total_posts INTEGER NOT NULL DEFAULT 0,
  flags_received INTEGER NOT NULL DEFAULT 0,
  last_posted_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.forum_post_user_moderation ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'forum_post_user_moderation' AND policyname = 'Users can view their own forum moderation stats'
  ) THEN
    CREATE POLICY "Users can view their own forum moderation stats"
    ON public.forum_post_user_moderation
    FOR SELECT
    USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.validate_forum_post_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_trimmed_content TEXT;
  v_recent_10m_count INTEGER;
  v_recent_1h_count INTEGER;
  v_flags_count INTEGER;
BEGIN
  v_trimmed_content := btrim(NEW.content);

  IF NEW.user_id IS NULL OR NEW.user_id != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized post insert.' USING ERRCODE = '42501';
  END IF;

  IF v_trimmed_content = '' THEN
    RAISE EXCEPTION 'Post content cannot be empty.' USING ERRCODE = 'P0001';
  END IF;

  IF char_length(v_trimmed_content) > 500 THEN
    RAISE EXCEPTION 'Post content is too long. Maximum is 500 characters.' USING ERRCODE = 'P0001';
  END IF;

  IF v_trimmed_content ~* '^(.{1,40})\1{2,}$' THEN
    RAISE EXCEPTION 'Post content looks repetitive/spammy.' USING ERRCODE = 'P0001';
  END IF;

  SELECT COUNT(*)
    INTO v_recent_10m_count
  FROM public.forum_posts
  WHERE user_id = NEW.user_id
    AND is_deleted = false
    AND created_at >= now() - interval '10 minutes';

  IF v_recent_10m_count >= 3 THEN
    RAISE EXCEPTION 'Rate limit exceeded: wait before posting again.' USING ERRCODE = 'P0001';
  END IF;

  SELECT COUNT(*)
    INTO v_recent_1h_count
  FROM public.forum_posts
  WHERE user_id = NEW.user_id
    AND is_deleted = false
    AND created_at >= now() - interval '1 hour';

  SELECT COUNT(*)
    INTO v_flags_count
  FROM public.post_reports pr
  JOIN public.forum_posts fp ON fp.id = pr.post_id
  WHERE fp.user_id = NEW.user_id
    AND pr.status = 'pending';

  NEW.content := v_trimmed_content;
  NEW.recent_posts_1h := v_recent_1h_count;
  NEW.moderation_flags_count := v_flags_count;
  NEW.repeat_content_detected := false;

  INSERT INTO public.forum_post_user_moderation (
    user_id,
    posts_last_hour,
    posts_last_24h,
    total_posts,
    flags_received,
    last_posted_at,
    updated_at
  )
  VALUES (
    NEW.user_id,
    v_recent_1h_count + 1,
    (
      SELECT COUNT(*)
      FROM public.forum_posts
      WHERE user_id = NEW.user_id
        AND is_deleted = false
        AND created_at >= now() - interval '24 hours'
    ) + 1,
    (
      SELECT COUNT(*)
      FROM public.forum_posts
      WHERE user_id = NEW.user_id
    ) + 1,
    v_flags_count,
    now(),
    now()
  )
  ON CONFLICT (user_id) DO UPDATE
  SET posts_last_hour = EXCLUDED.posts_last_hour,
      posts_last_24h = EXCLUDED.posts_last_24h,
      total_posts = EXCLUDED.total_posts,
      flags_received = EXCLUDED.flags_received,
      last_posted_at = EXCLUDED.last_posted_at,
      updated_at = now();

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_forum_post_insert ON public.forum_posts;
CREATE TRIGGER validate_forum_post_insert
BEFORE INSERT ON public.forum_posts
FOR EACH ROW
EXECUTE FUNCTION public.validate_forum_post_insert();

CREATE OR REPLACE FUNCTION public.get_forum_post_cooldown_seconds(p_user_id UUID DEFAULT auth.uid())
RETURNS INTEGER
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT GREATEST(
    0,
    COALESCE(
      CEIL(EXTRACT(EPOCH FROM ((MAX(created_at) + interval '10 minutes') - now())))::INTEGER,
      0
    )
  )
  FROM public.forum_posts
  WHERE user_id = COALESCE(p_user_id, auth.uid())
    AND is_deleted = false;
$$;

GRANT EXECUTE ON FUNCTION public.get_forum_post_cooldown_seconds(UUID) TO authenticated;
