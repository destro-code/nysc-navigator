-- Harden RLS ownership and field-level write constraints for app-facing tables.

CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = 'admin'::public.app_role
  );
$$;

-- PROFILES
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id
  AND user_id = (SELECT user_id FROM public.profiles p WHERE p.id = profiles.id)
  AND created_at = (SELECT created_at FROM public.profiles p WHERE p.id = profiles.id)
);

-- FOLLOWS
DROP POLICY IF EXISTS "Users can follow" ON public.follows;
CREATE POLICY "Users can follow" ON public.follows
FOR INSERT
WITH CHECK (auth.uid() = follower_id);

DROP POLICY IF EXISTS "Users can unfollow" ON public.follows;
CREATE POLICY "Users can unfollow" ON public.follows
FOR DELETE
USING (auth.uid() = follower_id);

-- FORUM POSTS
DROP POLICY IF EXISTS "Authenticated users can create posts" ON public.forum_posts;
CREATE POLICY "Authenticated users can create posts" ON public.forum_posts
FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND upvotes = 0
  AND downvotes = 0
  AND comments_count = 0
  AND is_deleted = false
);

DROP POLICY IF EXISTS "Users can update their own posts" ON public.forum_posts;
CREATE POLICY "Users can update their own posts" ON public.forum_posts
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id
  AND user_id = (SELECT user_id FROM public.forum_posts fp WHERE fp.id = forum_posts.id)
  AND upvotes = (SELECT upvotes FROM public.forum_posts fp WHERE fp.id = forum_posts.id)
  AND downvotes = (SELECT downvotes FROM public.forum_posts fp WHERE fp.id = forum_posts.id)
  AND comments_count = (SELECT comments_count FROM public.forum_posts fp WHERE fp.id = forum_posts.id)
  AND created_at = (SELECT created_at FROM public.forum_posts fp WHERE fp.id = forum_posts.id)
);

DROP POLICY IF EXISTS "Admins can manage all posts" ON public.forum_posts;
CREATE POLICY "Admins can manage all posts" ON public.forum_posts
FOR ALL
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- POST VOTES
DROP POLICY IF EXISTS "Users can vote" ON public.post_votes;
CREATE POLICY "Users can vote" ON public.post_votes
FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can change their vote" ON public.post_votes;
CREATE POLICY "Users can change their vote" ON public.post_votes
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id
  AND user_id = (SELECT user_id FROM public.post_votes pv WHERE pv.id = post_votes.id)
  AND post_id = (SELECT post_id FROM public.post_votes pv WHERE pv.id = post_votes.id)
  AND created_at = (SELECT created_at FROM public.post_votes pv WHERE pv.id = post_votes.id)
);

DROP POLICY IF EXISTS "Users can remove their vote" ON public.post_votes;
CREATE POLICY "Users can remove their vote" ON public.post_votes
FOR DELETE
USING (auth.uid() = user_id);

-- ALLOWANCE RECORDS
DROP POLICY IF EXISTS "Users can manage their own allowance" ON public.allowance_records;
CREATE POLICY "Users can manage their own allowance" ON public.allowance_records
FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND amount >= 0
  AND status IN ('paid', 'pending', 'late')
);

DROP POLICY IF EXISTS "Users can update their own allowance" ON public.allowance_records;
CREATE POLICY "Users can update their own allowance" ON public.allowance_records
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id
  AND user_id = (SELECT user_id FROM public.allowance_records ar WHERE ar.id = allowance_records.id)
  AND created_at = (SELECT created_at FROM public.allowance_records ar WHERE ar.id = allowance_records.id)
);

-- CLEARANCE PROGRESS
DROP POLICY IF EXISTS "Users can manage their own clearance" ON public.clearance_progress;
CREATE POLICY "Users can manage their own clearance" ON public.clearance_progress
FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own clearance" ON public.clearance_progress;
CREATE POLICY "Users can update their own clearance" ON public.clearance_progress
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id
  AND user_id = (SELECT user_id FROM public.clearance_progress cp WHERE cp.id = clearance_progress.id)
  AND item_id = (SELECT item_id FROM public.clearance_progress cp WHERE cp.id = clearance_progress.id)
  AND created_at = (SELECT created_at FROM public.clearance_progress cp WHERE cp.id = clearance_progress.id)
);
