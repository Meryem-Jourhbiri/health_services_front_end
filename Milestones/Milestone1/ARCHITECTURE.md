# Health Services Frontend – Milestone 1 Architecture

This document orients newcomers to the code you just shipped for Milestone 1 (auth + frontend foundations). It covers stack, structure, key flows, and where to extend next.

## Tech Stack

- Next.js 16 (App Router, client components for all pages)
- TypeScript + Jest + Testing Library
- Tailwind CSS v4 + HeroUI (component library)
- LocalStorage-based auth persistence with mockable API client

## Project Layout (top-level)

- `healthcare-portal/` – Next.js app
  - `app/` – routes, layouts, global styles, providers
  - `components/` – shared UI (e.g., auth guards)
  - `lib/` – auth logic (`auth-context`, `api`, `types`)
  - `public/` – static assets
  - `__tests__/` – Jest suites for auth screens and dashboard
- `Milestones/Milestone1` – milestone notes, this architecture doc

## App & Providers

- `app/layout.tsx` sets metadata and wraps all pages with `<Providers>`, forcing dark theme by default.
- `app/providers.tsx` registers HeroUI with Next navigation and injects `<AuthProvider>` so `useAuth` works everywhere.

## Styling

- Tailwind v4 via `app/globals.css` with HeroUI plugin (`app/hero.ts`). Dark mode enabled globally (`<html className="dark">`), `bg-background`/`text-foreground` come from HeroUI theme tokens.

## Authentication Model

- State lives in `lib/auth/auth-context.tsx`:
  - Stores `{ token, user }` in `localStorage` under `health-services-auth`; hydrates on mount (`isHydrating`) and tracks submissions (`isSubmitting`).
  - Exposes `login`, `register`, `logout`, `requestPasswordReset`, `resetPassword`, `verifyEmail`, and `setVerificationEmail`.
  - Derives `role`, `isAuthenticated`, and `verificationEmail` from state.
- API client in `lib/auth/api.ts`:
  - If `NEXT_PUBLIC_API_BASE_URL` is unset, returns mock responses after a short delay and infers role from email containing “doctor”.
  - If set, posts to backend endpoints: `/auth/login`, `/auth/register`, `/auth/password/forgot`, `/auth/password/reset`, `/auth/verify-email`.
  - Throws `ApiError` with status/message for consistent UX.
- Types live in `lib/auth/types.ts`.

## Route Protection

- `components/auth/ProtectedRoute.tsx` is a client wrapper that:
  - Blocks render while hydrating; shows “Checking your session…”.
  - Redirects unauthenticated users to `/login`.
  - Optionally enforces roles via `allowRoles`; unauthorized users bounce to their role’s dashboard (`/doctor` or `/patient`).

## Pages & Flows (all client components)

- Public:
  - `/` (`app/page.tsx`): landing with CTAs to doctor/patient dashboards.
  - `/login`: unified login; on success, redirects by role (doctor→`/doctor`, patient→`/patient`), respects `next` query param.
  - `/signup`: patient-only sign-up; on success sets `verificationEmail` and moves to verify screen.
  - `/forgot-password`: request reset link.
  - `/reset-password`: accepts `token` query; validates length/match before calling API.
  - `/verify-email`: supports `status=pending|success|expired`, optional `token` and `email`; when `status=success`+`token`, auto-calls `verifyEmail` then sends user to `/login`.
- Protected:
  - `/doctor`: dashboard with sample stats/table; requires role `doctor`.
  - `/patient`: dashboard with next-appointment + quick actions; requires role `patient`.

## Environment & Config

- `.env.local` (optional) sets `NEXT_PUBLIC_API_BASE_URL` for real backend calls; otherwise mocks are used.
- `package.json` scripts: `dev`, `build`, `start`, `lint`, `test`.

## Testing

- Jest + Testing Library in `__tests__/`:
  - Auth pages: presence of form inputs/buttons/links for login, signup, forgot-password, verify-email.
  - Patient dashboard: renders key sections and has a snapshot for layout stability.
- Tests mock `useAuth` and Next navigation; no network calls.

## How to Run Locally

1) `cd healthcare-portal`  
2) Optional: create `.env.local` with `NEXT_PUBLIC_API_BASE_URL=http://localhost:4000` to hit a backend; omit for mock mode.  
3) `npm install` (once)  
4) `npm run dev` → http://localhost:3000  
5) `npm test` for Jest, `npm run lint` for ESLint.

## Extension Pointers (post–Milestone 1)

- Swap mock API with live endpoints by setting `NEXT_PUBLIC_API_BASE_URL` and aligning payloads/error shapes.
- Add server actions or RSC-backed data fetching for dashboards once APIs exist.
- Broaden tests to cover navigation/redirects, error states, and role-guarding behavior.
- Add theming toggle and light mode support if desired (currently forced dark).
