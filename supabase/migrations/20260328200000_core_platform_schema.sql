-- Core platform schema: users, social graph, moderation, and operations
-- Uses IF NOT EXISTS so it can be safely applied on top of existing environments.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  email TEXT NOT NULL,
  display_name TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT users_username_unique UNIQUE (username),
  CONSTRAINT users_email_unique UNIQUE (email)
);

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  bio TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  state_code TEXT,
  lga TEXT,
  ppa_name TEXT,
  nysc_batch TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT profiles_user_id_unique UNIQUE (user_id)
);

CREATE TABLE IF NOT EXISTS public.sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  session_token TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT sessions_session_token_unique UNIQUE (session_token)
);

CREATE TABLE IF NOT EXISTS public.roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  granted_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT roles_name_check CHECK (name IN ('admin', 'moderator', 'user')),
  CONSTRAINT roles_user_name_unique UNIQUE (user_id, name)
);

CREATE TABLE IF NOT EXISTS public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  visibility TEXT NOT NULL DEFAULT 'public',
  status TEXT NOT NULL DEFAULT 'published',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT posts_visibility_check CHECK (visibility IN ('public', 'followers', 'private')),
  CONSTRAINT posts_status_check CHECK (status IN ('draft', 'published', 'archived'))
);

CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  vote_value SMALLINT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT votes_value_check CHECK (vote_value IN (-1, 1)),
  CONSTRAINT votes_one_target_check CHECK (
    (post_id IS NOT NULL AND comment_id IS NULL)
    OR (post_id IS NULL AND comment_id IS NOT NULL)
  )
);

CREATE UNIQUE INDEX IF NOT EXISTS votes_user_post_unique
  ON public.votes(user_id, post_id)
  WHERE post_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS votes_user_comment_unique
  ON public.votes(user_id, comment_id)
  WHERE comment_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  priority SMALLINT NOT NULL DEFAULT 3,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  CONSTRAINT reports_status_check CHECK (status IN ('pending', 'triaged', 'resolved', 'dismissed')),
  CONSTRAINT reports_priority_check CHECK (priority BETWEEN 1 AND 5),
  CONSTRAINT reports_target_check CHECK (
    (post_id IS NOT NULL AND comment_id IS NULL)
    OR (post_id IS NULL AND comment_id IS NOT NULL)
  )
);

CREATE TABLE IF NOT EXISTS public.follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  following_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT follows_unique UNIQUE (follower_user_id, following_user_id),
  CONSTRAINT follows_self_check CHECK (follower_user_id <> following_user_id)
);

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  actor_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  notification_type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  read_at TIMESTAMPTZ,
  CONSTRAINT notifications_type_check CHECK (
    notification_type IN ('comment', 'vote', 'follow', 'report_update', 'system')
  )
);

CREATE TABLE IF NOT EXISTS public.clearance_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  label TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  due_date DATE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT clearance_status_check CHECK (status IN ('pending', 'in_progress', 'done', 'blocked')),
  CONSTRAINT clearance_unique UNIQUE (user_id, category, label)
);

CREATE TABLE IF NOT EXISTS public.posting_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_date DATE NOT NULL,
  location TEXT,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT posting_events_type_check CHECK (
    event_type IN ('deployment', 'clearance', 'relocation', 'orientation', 'camp')
  )
);

CREATE TABLE IF NOT EXISTS public.allowance_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  allowance_month DATE NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'NGN',
  payment_status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT allowance_amount_check CHECK (amount >= 0),
  CONSTRAINT allowance_status_check CHECK (payment_status IN ('pending', 'paid', 'failed', 'reversed')),
  CONSTRAINT allowance_user_month_unique UNIQUE (user_id, allowance_month)
);

CREATE TABLE IF NOT EXISTS public.support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  priority SMALLINT NOT NULL DEFAULT 3,
  assigned_admin_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  CONSTRAINT support_status_check CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  CONSTRAINT support_priority_check CHECK (priority BETWEEN 1 AND 5)
);

CREATE TABLE IF NOT EXISTS public.admin_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  target_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  report_id UUID REFERENCES public.reports(id) ON DELETE SET NULL,
  support_ticket_id UUID REFERENCES public.support_tickets(id) ON DELETE SET NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT admin_action_type_check CHECK (
    action_type IN ('warn_user', 'suspend_user', 'restore_user', 'resolve_report', 'ticket_update')
  )
);

-- High-read path indexes
CREATE INDEX IF NOT EXISTS idx_posts_feed_published_created_at
  ON public.posts(created_at DESC)
  WHERE status = 'published' AND visibility IN ('public', 'followers');

CREATE INDEX IF NOT EXISTS idx_posts_feed_user_created_at
  ON public.posts(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_reports_queue
  ON public.reports(status, priority ASC, created_at ASC)
  WHERE status IN ('pending', 'triaged');

CREATE INDEX IF NOT EXISTS idx_notifications_unread
  ON public.notifications(user_id, created_at DESC)
  WHERE is_read = false;

CREATE INDEX IF NOT EXISTS idx_users_lookup_username
  ON public.users(LOWER(username));

CREATE INDEX IF NOT EXISTS idx_users_lookup_email
  ON public.users(LOWER(email));

CREATE INDEX IF NOT EXISTS idx_profiles_lookup_user
  ON public.profiles(user_id);

CREATE INDEX IF NOT EXISTS idx_sessions_user_active
  ON public.sessions(user_id, expires_at DESC)
  WHERE revoked_at IS NULL;
