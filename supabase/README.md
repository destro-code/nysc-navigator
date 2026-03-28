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
