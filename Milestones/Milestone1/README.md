# Milestone 1 – Authentication and Frontend Foundations

## Achievements

### Foundation

- Initialized a production-ready Next.js + TypeScript codebase, including basic app/directory routing, strict mode, and built-in server components support.
- Configured global UI structure using shared layouts, metadata, and a responsive design system (HeroUI + custom utility classes).
- Established project-wide folder architecture for `app/`, `components/`, and `lib/` to enforce consistency and scalability across the frontend.
- Set up global provider, for theming support, shared state, and UI component acess inside app/providers.tsx.
- Added inital public route and routing placeholders (`/patient/*`, `/doctor/*`).
- Installed and configured development tooling: ESLint, TypeScript strict mode, and path aliases for cleaner imports.

Ensured application-wide responsive layout behavior, typography scales, and mobile-first UI consistency across all auth pages.

### Application

- Built a reusable auth layer with context, localStorage persistence, submission/hydration flags, and mockable API endpoints that fall back to demo responses when `NEXT_PUBLIC_API_BASE_URL` is unset (`healthcare-portal/lib/auth/auth-context.tsx`, `.../lib/auth/api.ts`, `.../lib/auth/types.ts`).
- Added role-aware protection via `<ProtectedRoute>` to gate pages and redirect unauthenticated/unauthorized users (`healthcare-portal/components/auth/ProtectedRoute.tsx`), and wired the provider into the app wrapper (`healthcare-portal/app/providers.tsx`).
- Implemented complete UI flows: login with role-based redirect, patient-only signup with pending email state, verify-email status handling, forgot/reset password with validation and feedback, plus protected doctor and patient dashboards with switch links and sign-out (`healthcare-portal/app/login|signup|verify-email|forgot-password|reset-password|doctor|patient/page.tsx`).
Documented the new shared flows and local API configuration in `healthcare-portal/README.md`, noting mock-mode behavior for local testing.

### Testing

#### Authentication Pages

##### Login Page

- Renders email input
- Renders password input
- Renders submit button
- Includes navigation link to signup

##### Signup Page

- Renders name, email, and password fields
- Renders submit button
  
##### Forgot Password Page

- Renders email input
- Renders submit button
- Renders link back to the Login page

##### Verify Email Page

- Displays verification message
- Uses email extracted from query parameters
- Includes button to return to the Login page

##### Patient Dashboard

- Displays “Your next appointment”
- Displays “Quick actions”
- Includes one snapshot test to ensure layout consistency over time

##### Excluded from this milestone:

- API calls
- Redirect or navigation logic
- Protected route validation
- Real authentication flows


The purpose is to ensure that core screens load correctly without relying on backend systems.
