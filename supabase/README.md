# Database migrations

This project uses Supabase SQL migrations as the migration framework.

## Baseline files

- `supabase/migrations/20260328173201_5a538af7-d0d3-4177-8754-0460897bb1d5.sql` (existing app schema)
- `supabase/migrations/20260328200000_core_platform_schema.sql` (core platform baseline extension)
- `supabase/seed.sql` (non-production-only seed data)

## Workflow

1. Create a new migration file in `supabase/migrations/` with a timestamp prefix.
2. Apply migrations with `supabase db push` (or local reset for fresh state).
3. Seed only when `app.environment` is set to a non-production value.

## Environment-safe seed rule

`supabase/seed.sql` exits without inserting rows unless `app.environment` is explicitly set and is **not** `production`.

## RLS policy assumptions (app tables)

The app currently writes directly to these tables: `profiles`, `follows`, `forum_posts`, `post_votes`, `allowance_records`, `clearance_progress`.

Security assumptions enforced in SQL policies:

- Ownership rule: all user-initiated writes must satisfy `auth.uid() = <row user owner column>`.
- Immutable ownership columns (`user_id`, and relation keys like `post_id`/`item_id` where applicable) are locked on UPDATE by comparing against the existing row.
- System-managed counters/timestamps on `forum_posts` (e.g. `upvotes`, `downvotes`, `comments_count`, `created_at`) are not user-writable through normal user UPDATE policies.
- Admin-only operations must be enforced in the database layer via role-aware policies/functions (`public.is_admin(...)`) and not only by client/UI route guards.

Notes:

- RLS cannot natively express full per-column ACLs. We model "permitted fields" with `WITH CHECK` constraints that prevent updates to disallowed columns by requiring critical fields to remain unchanged.
- Elevated/admin writes should go through admin-scoped policies or SECURITY DEFINER RPCs with explicit role checks.
