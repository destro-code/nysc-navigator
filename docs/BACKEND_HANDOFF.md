# Backend Handoff

This document explains how a backend developer picks up where the frontend-only prototype leaves off.

## Ground rules

- **Every UI file talks to a service, never to a network client directly.** Services live in `src/services/*.service.ts` and are the *only* files a backend developer needs to modify.
- **Shared contracts live in `src/types/index.ts`.** Preserve those interfaces (or evolve them together with the UI). They match what components already render.
- **Seed data lives in `src/data/seed.ts`.** Use it as a fixture reference for the initial database migration.

## Swap points

| Service file | Responsibility | Suggested backend surface |
| --- | --- | --- |
| `services/auth.service.ts` | login, signup, logout, forgot/reset password | `POST /auth/signup`, `POST /auth/login`, `POST /auth/logout`, `POST /auth/password/forgot`, `POST /auth/password/reset` — or a managed auth provider. |
| `services/profile.service.ts` | current user profile, list users, follow/unfollow | `profiles` table + `follows` table; `GET /users/me`, `PATCH /users/me`, `POST /users/:id/follow`, `DELETE /users/:id/follow`. |
| `services/forum.service.ts` | posts, votes, reports | `forum_posts`, `post_votes`, `post_reports` tables; `GET/POST /forum/posts`, `POST /forum/posts/:id/vote`, `POST /forum/posts/:id/report`. |
| `services/notifications.service.ts` | in-app notification feed | `notifications` table; `GET /notifications`, `PATCH /notifications/:id`, `POST /notifications/mark-all-read`. Realtime push is a good fit. |
| `services/posting.service.ts` | posting tracker fields + milestone dates | Extend `profiles` or new `posting_progress` table; `GET /users/me/posting`, `PATCH /users/me/posting`. |
| `services/clearance.service.ts` | per-item completion state | `clearance_progress(user_id, item_id, section_id, tab, completed, completed_at)`; `GET /clearance`, `PUT /clearance/:itemId`. |
| `services/allowance.service.ts` | monthly allowance entries | `allowance_records(user_id, month, year, amount, status, notes)`; `GET /allowance`, `POST /allowance`, `PATCH /allowance/:id`. |
| `services/admin.service.ts` | admin stats + announcements | `announcements` table + aggregate queries; `GET /admin/stats`, `GET/POST /admin/announcements`. |
| `services/batch.service.ts` | current NYSC batch metadata | `batches` table with `is_active`; `GET /batches/active`. |

## Auth expectations

- The frontend today keeps a fake `Session` in localStorage under the `nysc.v1.session` key. When wiring real auth, replace the body of `authService.getSession` with a session read from HTTP-only cookies or a token store.
- Every other service currently takes a `userId` argument. A real backend should ignore that argument and derive the caller from the session server-side.

## Row-level authorization

Suggested policies once backend exists:

- Profiles: any authenticated user can read, only the owner can update.
- Forum posts: any authenticated user can read/create; only author can delete; admin can moderate.
- Post votes/reports: scoped to authenticated user.
- Allowance/clearance/posting: only the owner can read/write.
- Announcements: read-all authenticated; write requires admin role.

## Migration seed reference

Use `src/data/seed.ts` as the reference dataset. It contains:

- 5 seed users, 6 forum posts, 4 notifications, 4 allowance rows, 1 posting progress row, 5 clearance rows, 1 pending report, 1 announcement, 1 active batch.

## Realtime hooks (later)

- Notifications and forum vote counts are the natural candidates for realtime subscriptions once a backend exists. The frontend already refetches on user actions, so realtime is an enhancement, not a requirement.

## Removing local storage

When the backend is live, delete `src/data/storage.ts` and `src/data/seed.ts`, then remove the `nysc.v1.*` cleanup UI (if any). The service interfaces remain unchanged.
