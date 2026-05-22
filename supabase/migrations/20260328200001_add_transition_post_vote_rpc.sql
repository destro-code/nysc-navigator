CREATE OR REPLACE FUNCTION public.transition_post_vote(
  p_post_id UUID,
  p_vote_type TEXT
)
RETURNS TABLE (
  upvotes INTEGER,
  downvotes INTEGER,
  user_vote TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_current_vote TEXT;
  v_next_vote TEXT;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  IF p_vote_type NOT IN ('up', 'down') THEN
    RAISE EXCEPTION 'Invalid vote type: %', p_vote_type;
  END IF;

  SELECT vote_type
  INTO v_current_vote
  FROM public.post_votes
  WHERE user_id = v_user_id AND post_id = p_post_id
  FOR UPDATE;

  IF v_current_vote = p_vote_type THEN
    v_next_vote := NULL;
    DELETE FROM public.post_votes
    WHERE user_id = v_user_id AND post_id = p_post_id;
  ELSE
    v_next_vote := p_vote_type;
    INSERT INTO public.post_votes (user_id, post_id, vote_type)
    VALUES (v_user_id, p_post_id, p_vote_type)
    ON CONFLICT (user_id, post_id)
    DO UPDATE SET vote_type = EXCLUDED.vote_type;
  END IF;

  UPDATE public.forum_posts
  SET
    upvotes = upvotes
      + CASE WHEN v_current_vote = 'up' THEN -1 ELSE 0 END
      + CASE WHEN v_next_vote = 'up' THEN 1 ELSE 0 END,
    downvotes = downvotes
      + CASE WHEN v_current_vote = 'down' THEN -1 ELSE 0 END
      + CASE WHEN v_next_vote = 'down' THEN 1 ELSE 0 END,
    updated_at = now()
  WHERE id = p_post_id
  RETURNING forum_posts.upvotes, forum_posts.downvotes
  INTO upvotes, downvotes;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Post not found';
  END IF;

  user_vote := v_next_vote;
  RETURN NEXT;
END;
$$;

REVOKE ALL ON FUNCTION public.transition_post_vote(UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.transition_post_vote(UUID, TEXT) TO authenticated;
