
## Goal

Turn this app into a polished, frontend-only NYSC demo. No Supabase, no backend calls, no env dependency. Every feature works via local state + localStorage, structured so a real backend can be dropped in later without touching UI.

## New architecture

```text
src/
  types/                shared TS types (User, Post, Notification, etc.)
  data/
    seed.ts             realistic mock data for users/posts/notifications/...
    storage.ts          typed localStorage wrapper (get/set/namespace/version)
  services/             repository layer — the future backend seam
    auth.service.ts     login/signup/logout/forgot/reset (fake)
    profile.service.ts  getCurrentUser, updateProfile, follow/unfollow
    forum.service.ts    list/create/vote/edit/delete/report/filter
    notifications.service.ts  list/markRead/markAllRead/remove
    posting.service.ts  read/save posting tracker
    clearance.service.ts toggle checklist items
    allowance.service.ts list/add/markPaid
    admin.service.ts    stats, reports, announcements (mock)
  hooks/                thin hooks that call services (useAuth, useForum, ...)
  contexts/             AuthContext + UserContext, backed by services
  components/, pages/   unchanged structure, rewired to hooks/services
```

All service functions are async and return typed data, matching realistic API shapes — swapping localStorage for fetch later is a one-file change per service.

## Removals

- Delete `src/integrations/supabase/` (client + types).
- Delete `supabase/` folder, `packages/types`, `docs/api/openapi.yaml`, `docs/adr/*`, `docs/architecture.md`.
- Remove Supabase-related lines from `.env` and `README.md`; the app runs with `npm i && npm run dev`, no env required.
- Remove `src/lib/api-error.ts` Supabase branches (keep a small generic helper).
- Purge every `supabase.*`, `.from(...)`, `.rpc(...)`, `.auth.*`, `.channel(...)` call from the files listed under Technical notes.

## Feature behavior (all local)

- **Auth**: Login/Signup/Forgot/Reset are pure UI flows. A successful submit stores a fake session `{ id, email, username, isAdmin }` in localStorage; refresh restores it. Logout clears it. Password-reset screen shows a success toast. A demo admin account (e.g. `admin@demo.nysc` / any password) flips `isAdmin`.
- **Profile**: Edit username, bio, state, stream, batch, PPA, reg number, avatar initials. Follow/unfollow mock users; follower/following counts update from local state. Persisted.
- **Forum**: Seeded posts with authors, categories/flair, timestamps, vote counts. Create, edit/delete (author only), upvote/downvote (one vote per user tracked locally), report (stored + toast), filter by category, load-more. Empty/success/error states + skeletons.
- **Notifications**: Seeded list. Mark one read, mark all read, remove one. New notifications auto-fired on local actions (e.g. someone "replied" to your post).
- **Posting tracker**: Editable reg number, stream, state, milestone dates with a timeline, progress card. Persisted.
- **Clearance checklist**: Toggle items, progress bar updates, saved locally.
- **Allowance tracker**: Seeded entries, add new, mark paid/received, totals + monthly summary card. Persisted.
- **Admin dashboard**: Uses mock stats (users, posts, open reports, announcements). Resolve/dismiss reports and create announcements — all local. `ProtectedRoute` for admin checks `isAdmin` from the fake session; a visible "Prototype admin panel" banner is shown.
- **Static pages**: Privacy, Terms, Contact, ServerError, NotFound kept as-is (content only).

## UX polish

- Mobile-first, existing design system preserved.
- Skeleton loaders during simulated fetch delays (~200ms) in each service.
- Toasts for every create/edit/delete/report/vote/follow action.
- Empty states for forum, notifications, allowance, checklist.
- Bottom nav + header consistent across pages.

## Persistence

Single versioned namespace `nysc.v1.*` in localStorage: `session`, `profile`, `users`, `posts`, `votes`, `reports`, `notifications`, `posting`, `clearance`, `allowance`, `admin.announcements`. Seed lazily on first load if a key is missing.

## Handoff doc

Add `docs/BACKEND_HANDOFF.md` describing:
- Which service files are the swap points.
- Data contracts (link to `src/types/`).
- Suggested endpoints/tables per service.
- Notes where realtime/notifications would plug in.
Update `README.md` to say "frontend-only prototype; backend to be added later" with a short "Backend to be added later" section.

## Technical notes

Files rewired to services (Supabase removed):
- `src/contexts/AuthContext.tsx`, `src/contexts/UserContext.tsx`
- `src/hooks/useActiveBatch.ts`, `src/hooks/useDashboardStats.ts`
- `src/components/forum/{Forum,CreatePostDialog,DeletePostDialog,ReportPostDialog}.tsx`
- `src/components/notifications/NotificationsDropdown.tsx`
- `src/components/posting/PostingTracker.tsx`
- `src/components/clearance/ClearanceChecklist.tsx`
- `src/components/allowance/AllowanceTracker.tsx`
- `src/components/profile/UserProfile.tsx`
- `src/pages/admin/AdminDashboard.tsx`
- `src/components/auth/ProtectedRoute.tsx` (reads fake session)

Deleted: `src/integrations/supabase/**`, `supabase/**`, `packages/types/**`, `docs/api/**`, `docs/adr/**`, `docs/architecture.md`.

`.env` cleared of `VITE_SUPABASE_*`. `package.json` keeps `@supabase/supabase-js` removed.

## Out of scope

- No real network calls of any kind.
- No new visual redesign — keep current styling, just make it feel complete.
- No test suite additions.
