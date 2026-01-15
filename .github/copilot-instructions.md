# Health Services Frontend – Copilot Instructions

## Project Overview

Healthcare portal connecting patients with doctors. Frontend is a Next.js 16 TypeScript app with role-based dashboards (patient/doctor). All pages are **client components** (`"use client"`). Currently at Milestone 1: auth flows are functional, with mock/real API toggle via environment variable.

## Architecture & Key Files

### Auth State Management

- **[lib/auth/auth-context.tsx](../healthcare-portal/lib/auth/auth-context.tsx)** – React Context providing `useAuth()` hook. Stores `{ token, user }` in `localStorage` under `health-services-auth`. Exposes methods: `login`, `register`, `logout`, `requestPasswordReset`, `resetPassword`, `verifyEmail`, `setVerificationEmail`.
- **[lib/auth/api.ts](../healthcare-portal/lib/auth/api.ts)** – API client with mock/live mode. If `NEXT_PUBLIC_API_BASE_URL` is unset, returns mock responses (800ms delay, role inferred from email containing "doctor"). When set, posts to backend endpoints like `/auth/login`, `/auth/register`. Throws `ApiError` with `{ status, message }`.
- **[lib/auth/types.ts](../healthcare-portal/lib/auth/types.ts)** – TypeScript types: `AuthUser`, `UserRole`, payloads, responses.

### App Structure

- **[app/layout.tsx](../healthcare-portal/app/layout.tsx)** – Root layout wraps everything in `<Providers>`, forces dark theme via `<html className="dark">`.
- **[app/providers.tsx](../healthcare-portal/app/providers.tsx)** – Injects HeroUI provider and `<AuthProvider>` so `useAuth()` works everywhere.
- **[components/auth/ProtectedRoute.tsx](../healthcare-portal/components/auth/ProtectedRoute.tsx)** – Client wrapper that blocks render while `isHydrating`, redirects unauthenticated users to `/login`, enforces `allowRoles` prop (e.g., `allowRoles={["patient"]}`). Unauthorized users redirect to their role's dashboard.

### Pages (all client components)

- `/login` – unified login; on success redirects by role (`/doctor` or `/patient`), respects `?next=` query param.
- `/signup` – patient-only sign-up; sets `verificationEmail` state and navigates to `/verify-email`.
- `/forgot-password`, `/reset-password` – password recovery flows; reset page requires `?token=` query.
- `/verify-email` – handles `?status=pending|success|expired`; auto-calls `verifyEmail(token)` if `status=success` and `?token=` present.
- `/doctor`, `/patient` – protected dashboards wrapped in `<ProtectedRoute>` with role enforcement.

## Development Workflows

### Running Locally

```bash
cd healthcare-portal
npm install          # first time only
npm run dev          # starts dev server on http://localhost:3000
npm test             # runs Jest tests
npm run lint         # runs ESLint
```

### Environment Configuration

Create `healthcare-portal/.env.local` to enable live API (omit for mock mode):

```
NEXT_PUBLIC_API_BASE_URL=https://healthapp-backend-v2-186862202342.us-central1.run.app
```

With env unset, app uses mock responses so all flows work without backend.

### Testing

- Tests live in **[**tests**/](../healthcare-portal/**tests**/)** using Jest + Testing Library.
- **[setupTests.ts](../healthcare-portal/setupTests.ts)** mocks `next/navigation`, `@heroui/button`, and `framer-motion` to avoid DOM animation issues.
- Tests mock `useAuth` via `jest.mock("@/lib/auth/auth-context")` and verify UI elements (inputs, buttons, links) are present. See **[**tests**/auth/login-page.test.tsx](../healthcare-portal/**tests**/auth/login-page.test.tsx)** for pattern.
- Path aliases (`@/components`, `@/lib`, `@/app`) configured in **[jest.config.js](../healthcare-portal/jest.config.js)**.

## Conventions & Patterns

### Styling

- **Tailwind v4** via **[app/globals.css](../healthcare-portal/app/globals.css)** with HeroUI plugin config in **[app/hero.ts](../healthcare-portal/app/hero.ts)**.
- Dark mode is global; use HeroUI theme tokens like `bg-background`, `text-foreground`, `border-default-100`, `bg-content1`.
- HeroUI components from `@heroui/react`: `Button`, `Card`, `Input`, etc. Always import specific component packages (e.g., `@heroui/button`).

### Form Handling

- Use controlled inputs with `useState` for `formValues` object.
- Handle submission in `handleSubmit` (async, calls auth context methods, catches errors).
- Display errors via state (`error` string) rendered conditionally.
- Example pattern from **[app/login/page.tsx](../healthcare-portal/app/login/page.tsx)**:

  ```tsx
  const [formValues, setFormValues] = useState({ email: '', password: '' });
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    try {
      const user = await login(formValues);
      router.replace(user.role === 'doctor' ? '/doctor' : '/patient');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to log in.');
    }
  };
  ```

### Route Protection

- Wrap protected pages in `<ProtectedRoute>`. Use `allowRoles` prop to enforce specific roles:
  ```tsx
  <ProtectedRoute allowRoles={['patient']}>
    {/* patient-only content */}
  </ProtectedRoute>
  ```
- Unauthenticated users bounce to `/login`; wrong role bounces to own dashboard.

### Auth Context Usage

- Import `useAuth()` from `@/lib/auth/auth-context`.
- Access `{ user, token, role, isAuthenticated, isHydrating, isSubmitting, verificationEmail }` and methods.
- Always check `isHydrating` before rendering auth-dependent UI to avoid flicker.

### API Integration

- **Backend API**: https://healthapp-backend-v2-186862202342.us-central1.run.app/swagger-ui/index.html
- **Base URL**: `https://healthapp-backend-v2-186862202342.us-central1.run.app`)
- **Key API Endpoints**:
  - **Authentication**: `/api/auth/login`, `/api/auth/register`, `/api/auth/verify-email`, `/api/auth/forgot-password`, `/api/auth/reset-password`, `/api/auth/logout`
  - **Profile Management**: `/api/profile/patient`, `/api/profile/doctor` (GET, PUT, DELETE)
  - **Availability Management**: `/api/availability`, `/api/availability/slots/{doctorId}`, `/api/availability/unavailability`
- To add new endpoints, extend **[lib/auth/api.ts](../healthcare-portal/lib/auth/api.ts)** or create new API modules in `lib/`. Follow pattern:
  1. Add mock response logic (return mock data after `wait()` if no `API_BASE_URL`).
  2. Add real fetch call using `request<T>()` helper with proper path and payload.
  3. Use `authHeaders(token)` helper for protected endpoints.
  4. Throw `ApiError` for failures; consumer catches and displays message.
- For non-auth APIs (e.g., appointments, availability), create separate files in `lib/` following same mock/live pattern (see `lib/profile/patient-api.ts`).

### Next.js App Router Specifics

- All pages are **client components** (`"use client"` at top). No server components or server actions yet.
- Use `useRouter()` from `next/navigation` for navigation (`router.push()`, `router.replace()`).
- Use `useSearchParams()` to read query params (e.g., `searchParams.get("next")`).
- Path aliases: `@/components`, `@/lib`, `@/app` (configured in tsconfig + jest).

## Extension Points (Post-Milestone 1)

- Swap mock API by setting `NEXT_PUBLIC_API_BASE_URL` and ensuring backend payload/error shapes match.
- Add appointment booking, doctor search, profile editing by creating new pages + API modules in `lib/`.
- Expand tests to cover navigation, error states, role guards (currently only smoke tests exist).
- Consider migrating to server components for data-heavy pages once backend is stable.
- Add light mode toggle if needed (currently forced dark via layout).

## Documentation Reference

### Frontend Docs

- **[Frontend Project Plan](../Milestones/Milestone0/Project_Plan.md)** – detailed project planning and milestones overview.
- **[Milestones/Milestone0/Functional_Requirements.md](../Milestones/Milestone0/Functional_Requirements.md)** – high-level product requirements .
- **[Milestones/Milestone1/Architecture.md](../Milestones/Milestone1/Architecture.md)** – Milestone 1 architecture.
- **[healthcare-portal/README.md](../healthcare-portal/README.md)** – quick start guide and API configuration.

### Backend Docs

- **[Backend API Swagger](https://healthapp-backend-v2-186862202342.us-central1.run.app/swagger-ui/index.html)** – full API reference for all endpoints, payloads, responses.
- **[Backend Project Plan](https://github.com/sweng-plus/res-spw25-health_services_backend/blob/main/Milestones/Milestone3/Project_Plan.md)** – backend development roadmap and milestones.
- **[Milestones/Milestone1/01_API_Documentation.md](https://github.com/sweng-plus/res-spw25-health_services_backend/blob/main/Milestones/Milestone1/01_API_Documentation.md)**
- **[Milestones/Milestone2/01_API_Documentation.md](https://github.com/sweng-plus/res-spw25-health_services_backend/blob/main/Milestones/Milestone2/01_API_Documentation.md)**
- **[Milestones/Milestone3/01_API_Documentation.md](https://github.com/sweng-plus/res-spw25-health_services_backend/blob/main/Milestones/Milestone3/01_API_Documentation.md)**
