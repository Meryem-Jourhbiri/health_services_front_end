# Health Services Frontend

Frontend for a healthcare portal that connects patients with doctors and provides administration tools for managing the platform. The application is built with Next.js App Router, TypeScript, Tailwind CSS, and HeroUI.

The runnable application is in [`healthcare-portal/`](</Users/meryemjourhbiri/GitHub/health_services_front_end/healthcare-portal>).

## Features

- Public landing page with links into the authentication flows.
- Authentication flows for login, patient registration, email verification, forgot password, and password reset.
- Role-aware navigation and protected routes for patients, doctors, and administrators.
- Patient dashboard with doctor search, doctor details, appointment booking, appointment management, and reviews.
- Doctor dashboard with profile management, appointments, availability, and unavailability management.
- Admin dashboard with user management, doctor approval workflows, and audit logs.
- Mock API mode for local UI development without a running backend.
- Live API mode backed by the Health Services backend.
- Jest and Testing Library coverage for authentication, navigation, and dashboard components.

## Technology stack

- [Next.js 16](https://nextjs.org/) with the App Router
- [React 19](https://react.dev/)
- TypeScript
- [HeroUI](https://www.heroui.com/) components
- Tailwind CSS v4
- Jest, `ts-jest`, and Testing Library
- ESLint with the Next.js configuration

## Project structure

```text
health_services_front_end/
├── healthcare-portal/
│   ├── app/                 # App Router pages, layouts, and global styles
│   ├── components/          # Shared UI and route-protection components
│   ├── lib/
│   │   ├── auth/            # Auth context, API client, and auth types
│   │   ├── admin/           # Admin API integration
│   │   ├── appointments/    # Appointment API integration
│   │   ├── availability/    # Doctor availability API integration
│   │   ├── doctors/         # Doctor search and details API integration
│   │   ├── profile/         # Patient and doctor profile API integration
│   │   └── reviews/         # Doctor review API integration
│   ├── public/              # Static assets
│   ├── __tests__/           # Jest and Testing Library tests
│   └── package.json
├── Milestones/              # Product, architecture, and milestone documentation
└── README.md
```

## Routes

### Public routes

| Route | Purpose |
| --- | --- |
| `/` | Landing page |
| `/auth/login` | Login for all supported roles |
| `/auth/signup` | Patient registration |
| `/auth/forgot-password` | Request a password reset |
| `/auth/reset-password` | Set a new password using a reset token |
| `/auth/verify-email` | Verify an account and display verification status |

### Patient routes

| Route | Purpose |
| --- | --- |
| `/patient` | Patient dashboard |
| `/patient/profile` | View and edit the patient profile |
| `/patient/doctors` | Search for doctors |
| `/patient/doctors/[id]` | View doctor details, availability, and reviews |
| `/patient/appointments` | View, book, cancel, and reschedule appointments |

### Doctor routes

| Route | Purpose |
| --- | --- |
| `/doctor` | Doctor dashboard |
| `/doctor/profile` | View and edit the doctor profile |
| `/doctor/appointments` | Manage doctor appointments |
| `/doctor/availability` | Manage availability and unavailability |

### Admin routes

| Route | Purpose |
| --- | --- |
| `/admin` | Admin dashboard |
| `/admin/users` | Manage users |
| `/admin/users/[id]` | View a user and manage account status |
| `/admin/doctors` | Review pending doctors and approve or reject them |
| `/admin/audit-logs` | View audit logs |

## Requirements

- Node.js compatible with the installed Next.js and React versions
- npm
- A backend is optional for local development because the frontend defaults to mock API responses

## Getting started

From the repository root:

```bash
cd healthcare-portal
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The development server uses Webpack:

```bash
npm run dev
```

## Environment configuration

The frontend reads `NEXT_PUBLIC_API_BASE_URL` from `healthcare-portal/.env.local`.

### Mock mode

Leave `NEXT_PUBLIC_API_BASE_URL` unset to use the built-in mock API. This mode adds a short simulated network delay and allows the authentication and UI flows to be exercised without a backend. In mock login mode, an email containing `doctor` is treated as a doctor account; other emails are treated as patient accounts.

### Live API mode

To connect to a backend, create `healthcare-portal/.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=https://healthapp-backend-v2-186862202342.us-central1.run.app
```

For a locally hosted backend, use its base URL instead:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
```

The API modules use this base URL for authentication, profiles, appointments, availability, doctor search, reviews, and admin operations. Do not commit `.env.local` or other environment files.

## Available scripts

Run these commands from `healthcare-portal/`:

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm start` | Serve the production build |
| `npm run lint` | Run ESLint |
| `npm test` | Run the Jest test suite |

Before opening a pull request, run:

```bash
npm run lint
npm test
npm run build
```

## Architecture notes

- `app/layout.tsx` provides application metadata, global styles, the HeroUI provider, and the authentication provider.
- `lib/auth/auth-context.tsx` exposes authentication state through `useAuth()` and persists `{ token, user }` in `localStorage` under `health-services-auth`.
- `components/auth/ProtectedRoute.tsx` waits for auth hydration, redirects unauthenticated users to login, and enforces role-specific access.
- API modules support mock and live modes and use `ApiError` for user-facing request failures.
- The application currently enables HeroUI’s dark theme globally.
- Pages are client components because they use interactive forms, auth state, navigation, and API calls.

## Testing

Tests are in [`healthcare-portal/__tests__/`](</Users/meryemjourhbiri/GitHub/health_services_front_end/healthcare-portal/__tests__>) and run in a JSDOM environment. [`setupTests.ts`](</Users/meryemjourhbiri/GitHub/health_services_front_end/healthcare-portal/setupTests.ts>) provides shared mocks for Next navigation and UI dependencies.

To run tests during development:

```bash
cd healthcare-portal
npm test
```

## Documentation

Additional project documentation is organized by milestone:

- [`Milestones/Milestone0/`](</Users/meryemjourhbiri/GitHub/health_services_front_end/Milestones/Milestone0>) — requirements, project planning, and technology choices
- [`Milestones/Milestone1/`](</Users/meryemjourhbiri/GitHub/health_services_front_end/Milestones/Milestone1>) — architecture and initial application foundations
- [`Milestones/Milestone2/`](</Users/meryemjourhbiri/GitHub/health_services_front_end/Milestones/Milestone2>) — milestone planning
- [`Milestones/Milestone3/`](</Users/meryemjourhbiri/GitHub/health_services_front_end/Milestones/Milestone3>) — milestone planning
- [`Milestones/Milestone4/`](</Users/meryemjourhbiri/GitHub/health_services_front_end/Milestones/Milestone4>) — milestone planning

## Deployment

Create a production build and start it with:

```bash
cd healthcare-portal
npm run build
npm start
```

When deploying to a hosting provider, configure `NEXT_PUBLIC_API_BASE_URL` in the provider’s environment settings and ensure the backend allows requests from the deployed frontend origin.
