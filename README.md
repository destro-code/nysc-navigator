# NYSC Navigator

NYSC Navigator is a mobile-first web app that helps NYSC members track the most stressful parts of service in one place: posting milestones, monthly allowance, clearance tasks, community forum discussions, and profile/admin workflows.

## App purpose

The app is designed to reduce coordination stress during service year by combining:

- **Personal tracking** for posting progress, allowance entries, and clearance checklists.
- **Community support** through forum posting, reporting, and discussion.
- **Account + role management** with Supabase Auth and admin-gated access.

## Key user flows

1. **Authentication and onboarding**
   - User signs up, logs in, resets password if needed, and is redirected into the protected app shell.
2. **Daily dashboard usage**
   - User lands on the Home tab and navigates via bottom tabs to Posting, Allowance, Clearance, Forum, or Profile.
3. **Forum participation**
   - User creates posts, reports content, and follows discussions with moderation hooks available for admins.
4. **Admin moderation**
   - Admin users can access `/admin`, while non-admin authenticated users are redirected away.

---

## Local setup

### Runtime requirements

- **Node.js:** 22.x LTS (recommended; aligns with backend architecture baseline).
- **Bun:** latest 1.x (repo contains both `bun.lock` and `bun.lockb`; Bun can be used for install/run if preferred).
- **npm:** available for standard scripts in `package.json`.
- **Supabase CLI:** required for local DB migration/reset workflows.

### 1) Clone and install

```bash
git clone <your-repo-url>
cd nysc-navigator
npm install
```

(Alternative)

```bash
bun install
```

### 2) Environment variables

Create a `.env.local` (or `.env`) with:

```bash
VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<your-anon-or-publishable-key>
```

These are required by `src/integrations/supabase/client.ts`.

Startup now performs **fail-fast config validation**:
- Missing/empty `VITE_SUPABASE_URL` or `VITE_SUPABASE_PUBLISHABLE_KEY` throws a descriptive error naming the exact missing key.
- Invalid `VITE_SUPABASE_URL` format throws a clear URL configuration error.

### 3) Supabase project requirements

- A Supabase project with **Auth enabled** (email/password flow used by app).
- SQL migrations from `supabase/migrations/` must be applied.
- `public.has_role(...)` must exist for admin checks in auth context.
- RLS policies from baseline migration should be in place for profile/forum/allowance/clearance access.
- Optional non-production seed data can be applied with environment-safe rule in `supabase/seed.sql`.

Recommended DB bootstrap sequence:

```bash
# Link to your Supabase project first (if needed)
supabase link --project-ref <your-project-ref>

# Apply migrations
npm run db:migrate

# Optional: rebuild local DB + seed
npm run db:reset
```

---

## Run, build, lint, and test commands

### App lifecycle

```bash
npm run dev        # Vite dev server
npm run build      # Production build
npm run build:dev  # Development-mode build
npm run preview    # Preview built app
npm run lint       # ESLint
```

### Database

```bash
npm run db:migrate # Supabase db push
npm run db:reset   # Supabase db reset
```

### Tests

There is currently no dedicated automated test script in `package.json` (for example, no `npm test` target yet).

---

## Architecture map

### Frontend modules

- **App composition + providers**: `src/App.tsx`
  - React Query provider
  - Auth and User context providers
  - Router + protected routes
- **Routing + shells**:
  - Protected root experience: `src/pages/Index.tsx`
  - Auth pages: `src/pages/Login.tsx`, `src/pages/Signup.tsx`, `src/pages/ForgotPassword.tsx`, `src/pages/ResetPassword.tsx`
  - Admin page: `src/pages/admin/AdminDashboard.tsx`
- **Feature modules**:
  - Home: `src/components/home/*`
  - Posting tracker: `src/components/posting/PostingTracker.tsx`
  - Allowance tracker: `src/components/allowance/AllowanceTracker.tsx`
  - Clearance checklist: `src/components/clearance/ClearanceChecklist.tsx`
  - Forum: `src/components/forum/*`
  - Profile: `src/components/profile/*`
- **Auth guard**: `src/components/auth/ProtectedRoute.tsx`
- **Supabase integration**: `src/integrations/supabase/client.ts`, `src/integrations/supabase/types.ts`

### Backend/data schema touchpoints

Current frontend behavior relies primarily on tables/functions created in `supabase/migrations/20260328173201_5a538af7-d0d3-4177-8754-0460897bb1d5.sql`, including:

- **Auth role checks**
  - `public.user_roles`
  - `public.has_role(_user_id, _role)` RPC function used by `AuthContext`
- **User-facing features**
  - Profiles: `public.profiles`
  - Forum: `public.forum_posts`, `public.post_votes`, `public.post_reports`
  - Allowance: `public.allowance_records`
  - Clearance: `public.clearance_progress`
  - Posting tracker: `public.posting_progress`
  - Notifications: `public.notifications`

Additionally, `supabase/migrations/20260328200000_core_platform_schema.sql` defines a broader platform baseline (users, sessions, reports, support, admin actions) that serves as the forward-looking data architecture.

---

## Deployment steps

This repository is a Vite frontend and can be deployed to any static host (Vercel, Netlify, Cloudflare Pages, S3+CDN, etc.).

1. **Prepare environment**
   - Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in deployment environment variables.
2. **Build artifact**
   - Run `npm ci` (or `bun install --frozen-lockfile`) and `npm run build`.
3. **Publish**
   - Deploy the generated `dist/` directory.
4. **Database alignment**
   - Ensure target Supabase project has latest migrations applied.
5. **Post-deploy smoke checks**
   - Verify login/signup, protected route access, tab navigation, and forum read/write behavior.

### Rollback basics

- **Frontend rollback:** redeploy the previous successful `dist/` artifact or revert to prior git commit and redeploy.
- **Config rollback:** restore previous deployment environment variables if a key/URL change caused breakage.
- **Database rollback:** avoid ad-hoc destructive rollback in production; instead ship a new corrective migration. For severe incidents, restore from Supabase backup/snapshot following your environment’s recovery policy.

---

## Known limitations

- No first-class automated test suite script is defined yet.
- Some home screen metrics are currently static placeholders.
- Migration history includes both legacy feature tables and broader future-core schema, which may need consolidation.
- Backend service modules documented in `docs/architecture.md` are planning artifacts; this repo is presently frontend + Supabase-first.

## Roadmap

- Add automated tests (unit + integration + end-to-end smoke tests).
- Consolidate/normalize schema evolution path across legacy and core baseline migrations.
- Replace placeholder dashboard stats with live computed values.
- Expand admin workflows and moderation tooling.
- Introduce CI checks for lint/build/migration validation before deploy.
