# Project Plan

## Duration

November 3, 2025 - January 31, 2026 (13 weeks)

---

## Milestone Schedule

| Milestone | Date | Focus |
| ----------- | ------ | ------------------ |
| M0 | ✅ DONE | Requirements, Planning, and Setup |
| M1 | ✅ DONE | Authentication and Frontend Foundations |
| M2 | ✅ DONE | Profiles and Availability Integration |
| M3 | 🔄 IN PROGRESS | Appointments, Search, Reviews, and Admin |
| M4 | Jan 26 | Deployment, Testing |
| Final | Jan 31 | Final Delivery |

---

## ✅ Milestone 1 – Authentication and Frontend Foundations (COMPLETED)

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

## ✅ Milestone 2 – Profiles, Availability Integration (COMPLETED)

Expand the frontend to support **profile management** for both patients and doctors, and integrate **availability scheduling** on the doctor side.

This milestone focuses on enabling users to **view and edit their profiles**, upload profile photos, manage availability, and connect all these flows with the new backend endpoints.

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

#### M2 API Integration

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

## 🔄 Milestone 3 – Appointments, Doctor Search, and Review Management (IN PROGRESS)

Milestone 3 delivers the end-to-end care discovery and scheduling experience. It adds patient booking flows, doctor and patient views of scheduled appointments with status management, and a full doctor search + review system so patients can find providers, view details, and leave ratings after completed visits.

### M3 Scope

#### Appointment Management

- **Patient Booking**
  - Select doctor
  - Select time slot
  - handle/prevent double-booking
  - Cancel booking
  - Reschedule booking
- **Doctor/Patient View**
  - Patients can see their bookings
  - Doctors can see their schedule
  - Filter by status (PENDING, CONFIRMED, COMPLETED, CANCELLED), date range
- **Appointment Endpoints**
  - `POST /api/appointments` - Book appointment
  - `GET /api/appointments` - List user's appointments
  - `GET /api/appointments/{id}` - Get appointment details
  - `PUT /api/appointments/{id}/cancel` - Cancel appointment
  - `PUT /api/appointments/{id}/reschedule` - Reschedule appointment
  - `PUT /api/appointments/{id}/status` - Update status (doctor only)

#### Doctor Search

- **Doctor Search**
  - Search by name (fuzzy matching)
  - Filter by specialization
  - Filter by languages spoken
  - Filter by availability (date/time)
  - Filter by minimum rating
  - Sort by: rating, experience
- **Doctor Detail**
  - View public profile
  - Average rating
  - Available time-slots
- **Doctor Search Endpoints**
  - `GET /api/doctors/search` - Search doctors
  - `GET /api/doctors/{id}` - Get doctor details
    - Profile
    - Availability
    - Reviews

#### Review System

- **Review Submission**
- **Review Management**
- **Review Endpoints**
  - `POST /api/reviews` - Submit review
    - Patients only
    - One review per completed appointment
    - Rating (1-5 stars) + comment
  - `GET /api/reviews/doctor/{id}` - Get doctor's reviews
    - Pagination
    - Sort by date (newest first)
  - `PUT /api/reviews/{id}` - Update review (author only)
  - `DELETE /api/reviews/{id}` - Delete review (author only)

### M3 Deliverables

- Appointment booking, cancellation, and rescheduling flows connected to appointment endpoints.
- Doctor and patient appointment views with status filtering and date range support.
- Doctor search with filters (specialization, language, availability, rating) and sorting.
- Doctor detail page showing profile, availability, and reviews.
- Review submission and management (create, update, delete) tied to completed appointments.

---

## ⏳ Milestone 4 – Admin Panel and Deployment (PLANNED)

Finalize the admin experience and ship the frontend to production. This milestone delivers an **admin-only dashboard** for oversight (users, doctors, system stats, and audit logs) and completes **deployment, performance tuning, and security hardening** for a stable release.

### M4 Scope

#### Admin Dashboard

- **Admin layout + routes** with role-based protection for all `/admin/*` pages.
- **System stats** view tied to `/api/admin/dashboard` (users, doctors, patients, appointments by status, reviews).
- **User management** list with pagination, search, and filters.
- **Suspend / Reactivate** user actions with confirmation states and feedback.
- **Doctor approvals** queue with approve/reject actions.
- **Audit log viewer** with filters by user, action type, and date range.

#### Deployment & Release Hardening

- Configure **production environment variables** and API base URL.
- Build production bundle and resolve warnings.
- Frontend **performance optimizations** (code splitting, image optimization, caching headers).
- Security review for admin routes (role checks, error handling, safe UI states).
- Final **API contract updates** for admin endpoints.

### M4 Deliverables

- Admin dashboard pages wired to admin endpoints (stats, users, approvals, audit logs).
- Role-based route protection for all admin views.
- User moderation actions (suspend/reactivate) and doctor approval workflow.
- Filterable audit log view with robust empty/error states.
- Production-ready build and deployment configuration.
- Updated frontend documentation and final milestone plan.

## Final Milestone – Final Delivery (PROJECTED)

### Final Delivery Items

- Production frontend deployed and verified against live API.
- Final demo walkthrough covering patient, doctor, and admin flows.
- Release-ready README with setup, environment variables, and run instructions.
- Updated API contract and UI flow documentation.
- Test results summary (unit/integration/e2e if applicable) and known issues list.
- Tagged release in the repository with final source code.
