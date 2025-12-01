# Milestone 1 – Authentication & Frontend Foundations

## Objective

Build the complete **authentication layer and app structure** for the Health Services App frontend.  
This milestone focuses on all user-facing flows related to **Sign Up, Login, Email Verification, Password Reset, and Session Handling**, in alignment with the backend’s authentication endpoints.

---

## Scope

### Project Setup

- Initialize **Next.js + TypeScript** project.
- Set up routing, shared layout, and responsive base styles.
- Configure environment variables for API base URL.

### Authentication Flows

- **Sign Up (patient only):** name, email, password with form validation.
- **Login (both roles):** email, password with error handling.
- **Email Verification:** “check your email” screen, success/expired token pages.
- **Password Reset:**  
  - Request reset (“Forgot Password”)  
  - Set new password using token
- **Sign Out** button and session clear.

### State & Routing

- Implement **auth state management** (Context/Zustand/Redux):
  - `user`, `role`, `isAuthenticated`, and `token` (if needed).
- Protect routes:
  - `/patient/*` → accessible only to patients  
  - `/doctor/*` → accessible only to doctors
- Redirect unauthenticated users to `/login`.
- Add placeholder pages for post-login navigation:  
  `/patient/home` and `/doctor/dashboard`.

### API Integration

- Create an **API client** for authentication endpoints:
  - `/auth/register`
  - `/auth/login`
  - `/auth/verify-email`
  - `/auth/password/forgot`
  - `/auth/password/reset`
- Implement consistent **error messages** for 401/400/409 responses.
- Display loading and empty states for all auth pages.

---

## Deliverables

- Functional Sign Up, Login, Email Verification, Forgot Password, and Reset Password screens.
- Working session handling and route protection.
- Shared auth store and API client layer.
- Responsive layout and accessible form components.
- Updated frontend milestone plan for next phase.

---

## Acceptance Criteria

- App builds and runs locally.  
- User can register, verify email, and log in successfully.  
- Password reset and logout work end-to-end.  
- Protected routes redirect unauthenticated users.  
- Session persists securely across browser refresh.  
- Clear loading and error states on all auth pages.

---

## Demo Checklist

- Register a new patient → see “Check your email” screen.  
- Click verification link → log in → arrive at `/patient/home`.  
- Log in as doctor → arrive at `/doctor/dashboard`.  
- Use Forgot Password flow → set new password → log in.  
- Try to access protected page while logged out → redirect to Login.  

---

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
