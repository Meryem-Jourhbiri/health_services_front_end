# Project Plan

## Duration

November 3, 2025 - January 31, 2026 (13 weeks)

---

## Milestone Schedule

| Milestone | Date | Focus |
| ----------- | ------ | ------------------ |
| M0 | Nov 03 | Requirements, Planning, and Setup |
| M1 | Nov 17 | Authentication and Frontend Foundations |
| M2 | Dec 08 | Profiles and Availability Integration |
| M3 | Jan 12 | Appointments, Search, Reviews, and Admin |
| M4 | Jan 26 | Deployment, Testing |
| Final | Jan 31 | Final Delivery |

---

## Milestone 1 – Authentication and Frontend Foundations (Nov 4 – Nov 17)

Build the complete **authentication layer and app structure** for the Health Services App frontend.  

This milestone focuses on all user-facing flows related to **Sign Up, Login, Email Verification, Password Reset, and Session Handling**, in alignment with the backend’s authentication endpoints.

### M1 Scope

#### Project Setup

- Initialize **Next.js + TypeScript** project.
- Set up routing, shared layout, and responsive base styles.
- Configure environment variables for API base URL.

#### Authentication Flows

- **Sign Up (patient only):** name, email, password with form validation.
- **Login (both roles):** email, password with error handling.
- **Email Verification:** “check your email” screen, success/expired token pages.
- **Password Reset:**  
  - Request reset (“Forgot Password”)  
  - Set new password using token
- **Sign Out** button and session clear.

#### State & Routing

- Implement **auth state management**
  - `user`, `role`, `isAuthenticated`, and `token` (if needed).
- Protect routes:
  - `/patient/*` → accessible only to patients  
  - `/doctor/*` → accessible only to doctors
- Redirect unauthenticated users to `/`.
- Add placeholder pages for post-login navigation:  
  `/patient/home` and `/doctor/dashboard`.

#### API Integration

- Create an **API client** for authentication endpoints:
  - `/auth/register`
  - `/auth/login`
  - `/auth/verify-email`
  - `/auth/password/forgot`
  - `/auth/password/reset`
- Implement consistent **error messages** for 401/400/409 responses.
- Display loading and empty states for all auth pages.

### M1 Deliverables

- Functional Sign Up, Login, Email Verification, Forgot Password, and Reset Password screens.
- Working session handling and route protection.
- Shared auth store and API client layer.
- Responsive layout and accessible form components.
- Updated frontend milestone plan for next phase.

### M1 Acceptance Criteria

- App builds and runs locally.  
- User can register, verify email, and log in successfully.  
- Password reset and logout work end-to-end.  
- Protected routes redirect unauthenticated users.  
- Session persists securely across browser refresh.  
- Clear loading and error states on all auth pages.

### M1 Demo Checklist

- Register a new patient → see “Check your email” screen.  
- Click verification link → log in → arrive at `/patient/home`.  
- Log in as doctor → arrive at `/doctor/dashboard`.  
- Use Forgot Password flow → set new password → log in.  
- Try to access protected page while logged out → redirect to Login.  

---

## Milestone 2 – Profiles, Availability Integration

Expand the frontend to support **profile management** for both patients and doctors, and integrate **availability scheduling** on the doctor side.

This milestone focuses on enabling users to **view and edit their profiles**, upload profile photos, manage availability, and connect all these flows with the new backend endpoints.

---

### M2 Scope

#### Profile Management

- **Patient Profile**
  - Display and edit patient information (name, email, age, phone, etc.).
  - Support profile photo upload (base64 image preview + API upload).
  - Display patient’s **medical record**.
  - Allow editing of medical record.
- **Doctor Profile**
  - Display and edit doctor information (name, specialty, city, contact info, etc.).
  - Support profile photo upload (base64 image preview + API upload).
  - Display additional doctor-specific details such as description, experience, and clinic address.
- **Shared Components**
  - Reusable **profile form components** for both roles.
  - Responsive **profile layout** (mobile for patient, desktop for doctor).
  - Clear **save / cancel** actions with inline feedback.
- **API Integration**
  - `/profile/patient` and `/profile/doctor` endpoints (GET, PUT).
  - `/profile/upload-photo` for base64 image uploads.
  - `/profile/medical-record` for fetching and updating medical record.
- **UX / Validation**
  - Field validation (email format, required fields).
  - Show success or error toasts after saving.
  - Disable Save button when no changes made.

#### Availability Management

- **Doctor Availability Dashboard**
  - Display weekly calendar view of available and unavailable time slots.
  - Allow doctor to **add / remove availability blocks** via date picker or time range selector.
  - Show **break times** visually (greyed out or marked as unavailable).
  - Integrate API endpoints for:
    - `/availability` (CRUD)
    - `/availability/unavailable`
  - Implement **time slot generation UI** to visualize generated slots.
- **Validation & States**
  - Prevent overlapping availability ranges.
  - Display feedback messages for successful saves or conflicts.
  - Handle loading, empty, and error states consistently.

### M2 API Integration

- Connect to backend’s **Profile CRUD** and **Availability endpoints**.
- Use the authenticated session token (from Milestone 1) in all requests.
- Update `/docs/api-contract.md` to include:
  - Patient & Doctor profile schemas
  - Medical record JSON format
  - Availability data model and endpoints
- Ensure consistent 401/403 handling and error mapping from backend.

### M2 Deliverables

- Functional **Patient and Doctor Profile** pages with editable forms.
- Working **photo upload** (base64 preview + server update).
- Integrated **medical record** view and edit support.
- **Doctor Availability** dashboard with add/remove time blocks.
- Updated API documentation and milestone plan for Milestone 3.

### M2 Acceptance Criteria

- Patient and Doctor can view and edit their profiles.
- Profile photo upload and update work as expected.  
- Medical record displays and updates correctly.  
- Doctor can manage weekly availability (add/remove time slots).  
- All data updates persist via live API endpoints (no mock data).  
- Proper form validation and responsive design for both roles.  
- Clear success/error messages for all profile and availability actions.

### M2 Demo Checklist

- Log in as **patient** → open Profile → edit name + upload photo → save changes.  
- View medical record → modify a field → save successfully.  
- Log in as **doctor** → open Profile → edit details → upload photo.  
- Go to **Availability** section → add available hours → refresh → verify saved data.  
- Try overlapping slots or invalid input → see validation/error messages.  
- Confirm all requests handled securely with session token.

---

## Milestone 3 – Appointments, Search, Reviews, and Admin

Finalize functionality and UX for demo readiness.

### M3 Scope

- Cancel/confirm appointments (if supported by API).  
- Basic patient card view.  
- Accessibility & performance improvements.  
- Session expiry, toasts, edge cases handled.

### M3 Deliverables

- QA builds, bug list, known limitations.  
- 1–2 min demo video.

### M3 Acceptance

- All MVP features complete or documented as out-of-scope.  
- No blockers in main flows.

---

## Milestone 4 – Deployment, Testing

Deliver a polished, documented, and demo-ready product.

### M4 Scope

- UI polishing (spacing, contrast, copy).  
- Complete docs:
- `README.md` (this file)  
- API mapping  
- FR coverage table (FR → screen → endpoint)  
- Tag final release.

### M4 Deliverables

- Live demo + final repo state + slide deck.

### M4 Acceptance

- End-to-end flow demo (patient booking + doctor view).  
- Documentation complete and reproducible.
