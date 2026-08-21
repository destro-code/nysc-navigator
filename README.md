# NYSC Buddy — Frontend-Only Prototype

NYSC Buddy is a mobile-first web app that helps NYSC corps members track the most stressful parts of service in one place: posting milestones, monthly allowance, clearance tasks, community forum discussions, and profile/admin workflows.

> **This build is a frontend-only prototype.** There is no backend, database, or auth provider — all data lives in the browser (localStorage) and is seeded with realistic mock data. A future backend will replace the mock services described in [BACKEND_HANDOFF.md](docs/BACKEND_HANDOFF.md).

## Run locally

```bash
npm install
npm run dev
```

That's it. No `.env` setup, no database, no external services.

### Demo accounts

Because auth is fake, you can log in with any email/password combination — a new local account is created on first signup. Two convenience accounts:

- **Demo user:** `demo@demo.nysc` / any password (loads the seeded profile "Ada Okonkwo").
- **Demo admin:** `admin@demo.nysc` / any password (unlocks the `/admin` panel).

## Scripts

```bash
npm run dev        # Vite dev server
npm run build      # Production build
npm run preview    # Preview built app
npm run lint       # ESLint
```

## Feature tour

- **Home** — dashboard summary with days remaining and clearance percentage.
- **Posting tracker** — editable reg number/stream/state and milestone timeline.
- **Allowance tracker** — seeded monthly entries; toggle paid/pending and add new months.
- **Clearance checklist** — in-camp and out-camp checklist with progress bar.
- **Forum** — seeded posts with categories, voting, reporting, create/delete.
- **Notifications** — sample notifications with mark-read and dismiss.
- **Profile** — edit username/bio/state/stream/batch, view your posts and likes.
- **Admin** — mock stats, moderation queue, and announcement composer.

## Project structure

```text
src/
  types/          Shared TypeScript contracts (the backend seam)
  data/           Seed data + localStorage wrapper
  services/      *Mock repository layer — swap these for real APIs later*
  contexts/       React contexts (Auth, User)
  hooks/          UI hooks
  components/     Reusable UI, feature panels, and layout
  pages/          Route-level screens
```

## Backend to be added later

The next phase will replace every function inside `src/services/*.service.ts` with real API calls. UI components already consume typed service interfaces, so no rewiring is expected. See [BACKEND_HANDOFF.md](docs/BACKEND_HANDOFF.md) for the endpoint/table sketch a backend developer can implement against.
