-- NYSC Navigator initial production schema
-- Authentication is handled by Supabase Auth (auth.users).

create extension if not exists pgcrypto;

do $$ begin
  create type public.user_status as enum ('in-camp', 'serving', 'cleared');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.allowance_status as enum ('paid', 'late', 'pending');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.post_flair as enum ('cleared', 'stuck', 'info', 'question');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.report_status as enum ('pending', 'reviewed', 'dismissed');
exception when duplicate_object then null; end $$;

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  username text not null,
  batch text,
  stream text,
  state text,
  lga text,
  ppa text,
  status public.user_status not null default 'in-camp',
  bio text not null default '',
  avatar_url text not null default '',
  reg_number text,
  follower_count integer not null default 0 check (follower_count >= 0),
  following_count integer not null default 0 check (following_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.posting_progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  reg_number text,
  stream text,
  state text,
  registration_date timestamptz,
  camp_start_date timestamptz,
  ppa_assigned_date timestamptz,
  cds_assigned_date timestamptz,
  pop_date timestamptz,
  updated_at timestamptz not null default now()
);

create table if not exists public.clearance_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  item_id text not null,
  section_id text not null,
  tab text not null,
  completed boolean not null default false,
  completed_at timestamptz,
  primary key (user_id, item_id)
);

create table if not exists public.allowance_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  month text not null,
  year integer not null,
  amount numeric(12,2) not null default 0 check (amount >= 0),
  status public.allowance_status not null default 'pending',
  notes text not null default '',
  created_at timestamptz not null default now(),
  unique (user_id, month, year)
);

create table if not exists public.forum_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  content text not null check (char_length(trim(content)) between 1 and 5000),
  flair public.post_flair not null default 'info',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.post_votes (
  post_id uuid not null references public.forum_posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  value smallint not null check (value in (-1, 1)),
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

create table if not exists public.post_reports (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.forum_posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  reason text not null,
  status public.report_status not null default 'pending',
  created_at timestamptz not null default now()
);

create table if not exists public.follows (
  follower_id uuid not null references auth.users(id) on delete cascade,
  following_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id),
  check (follower_id <> following_id)
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null,
  title text not null,
  message text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.batches (
  id uuid primary key default gen_random_uuid(),
  year integer not null,
  batch text not null,
  stream text not null,
  start_date timestamptz not null,
  end_date timestamptz not null,
  is_active boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  is_active boolean not null default true
);

create index if not exists idx_forum_posts_created_at on public.forum_posts(created_at desc);
create index if not exists idx_notifications_user_created on public.notifications(user_id, created_at desc);
create index if not exists idx_allowance_user_year on public.allowance_records(user_id, year);
create index if not exists idx_follows_following on public.follows(following_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$ begin
  new.updated_at = now();
  return new;
end; $$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles for each row execute function public.set_updated_at();
drop trigger if exists posting_set_updated_at on public.posting_progress;
create trigger posting_set_updated_at before update on public.posting_progress for each row execute function public.set_updated_at();
drop trigger if exists posts_set_updated_at on public.forum_posts;
create trigger posts_set_updated_at before update on public.forum_posts for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$ begin
  insert into public.profiles (user_id, username)
  values (new.id, coalesce(nullif(new.raw_user_meta_data ->> 'username', ''), split_part(coalesce(new.email, 'corper'), '@', 1)))
  on conflict (user_id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where user_id = auth.uid()
      and lower(coalesce(auth.jwt() ->> 'email', '')) = 'admin@demo.nysc'
  );
$$;

alter table public.profiles enable row level security;
alter table public.posting_progress enable row level security;
alter table public.clearance_progress enable row level security;
alter table public.allowance_records enable row level security;
alter table public.forum_posts enable row level security;
alter table public.post_votes enable row level security;
alter table public.post_reports enable row level security;
alter table public.follows enable row level security;
alter table public.notifications enable row level security;
alter table public.batches enable row level security;
alter table public.announcements enable row level security;

-- Profiles are visible to authenticated community members; users can only mutate their own.
create policy profiles_select_authenticated on public.profiles for select to authenticated using (true);
create policy profiles_insert_own on public.profiles for insert to authenticated with check (user_id = auth.uid());
create policy profiles_update_own on public.profiles for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy posting_select_own on public.posting_progress for select to authenticated using (user_id = auth.uid());
create policy posting_insert_own on public.posting_progress for insert to authenticated with check (user_id = auth.uid());
create policy posting_update_own on public.posting_progress for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy posting_delete_own on public.posting_progress for delete to authenticated using (user_id = auth.uid());

create policy clearance_select_own on public.clearance_progress for select to authenticated using (user_id = auth.uid());
create policy clearance_insert_own on public.clearance_progress for insert to authenticated with check (user_id = auth.uid());
create policy clearance_update_own on public.clearance_progress for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy clearance_delete_own on public.clearance_progress for delete to authenticated using (user_id = auth.uid());

create policy allowance_select_own on public.allowance_records for select to authenticated using (user_id = auth.uid());
create policy allowance_insert_own on public.allowance_records for insert to authenticated with check (user_id = auth.uid());
create policy allowance_update_own on public.allowance_records for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy allowance_delete_own on public.allowance_records for delete to authenticated using (user_id = auth.uid());

create policy forum_select_authenticated on public.forum_posts for select to authenticated using (true);
create policy forum_insert_own on public.forum_posts for insert to authenticated with check (user_id = auth.uid());
create policy forum_update_own on public.forum_posts for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy forum_delete_own on public.forum_posts for delete to authenticated using (user_id = auth.uid());

create policy votes_select_authenticated on public.post_votes for select to authenticated using (true);
create policy votes_insert_own on public.post_votes for insert to authenticated with check (user_id = auth.uid());
create policy votes_update_own on public.post_votes for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy votes_delete_own on public.post_votes for delete to authenticated using (user_id = auth.uid());

create policy reports_insert_own on public.post_reports for insert to authenticated with check (user_id = auth.uid());
create policy reports_select_own_or_admin on public.post_reports for select to authenticated using (user_id = auth.uid() or public.is_admin());
create policy reports_update_admin on public.post_reports for update to authenticated using (public.is_admin()) with check (public.is_admin());

create policy follows_select_authenticated on public.follows for select to authenticated using (true);
create policy follows_insert_own on public.follows for insert to authenticated with check (follower_id = auth.uid());
create policy follows_delete_own on public.follows for delete to authenticated using (follower_id = auth.uid());

create policy notifications_select_own on public.notifications for select to authenticated using (user_id = auth.uid());
create policy notifications_update_own on public.notifications for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy batches_select_authenticated on public.batches for select to authenticated using (true);
create policy batches_admin_insert on public.batches for insert to authenticated with check (public.is_admin());
create policy batches_admin_update on public.batches for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy batches_admin_delete on public.batches for delete to authenticated using (public.is_admin());

create policy announcements_select_authenticated on public.announcements for select to authenticated using (is_active = true or public.is_admin());
create policy announcements_admin_insert on public.announcements for insert to authenticated with check (public.is_admin() and created_by = auth.uid());
create policy announcements_admin_update on public.announcements for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy announcements_admin_delete on public.announcements for delete to authenticated using (public.is_admin());
