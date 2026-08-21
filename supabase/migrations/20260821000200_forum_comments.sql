-- Forum comments
create table if not exists public.forum_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.forum_posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  content text not null check (char_length(trim(content)) between 1 and 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_forum_comments_post_created
  on public.forum_comments(post_id, created_at asc);

alter table public.forum_comments enable row level security;

create policy comments_select_authenticated
  on public.forum_comments for select to authenticated
  using (true);

create policy comments_insert_own
  on public.forum_comments for insert to authenticated
  with check (user_id = auth.uid());

create policy comments_update_own
  on public.forum_comments for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy comments_delete_own
  on public.forum_comments for delete to authenticated
  using (user_id = auth.uid());

create or replace function public.forum_post_comments_count(post uuid)
returns integer
language sql
stable
security invoker
as $$
  select count(*)::integer from public.forum_comments where post_id = post;
$$;

create or replace function public.set_comment_updated_at()
returns trigger
language plpgsql
as $$ begin
  new.updated_at = now();
  return new;
end; $$;

drop trigger if exists forum_comments_set_updated_at on public.forum_comments;
create trigger forum_comments_set_updated_at
before update on public.forum_comments
for each row execute function public.set_comment_updated_at();
