# 🏥 Health Services App – Frontend Plan

## 1. Background and Purpose

The goal of the **Health Services App** is to connect patients with doctors through a unified, responsive digital platform.

- **Patients** use the app primarily on mobile browsers.  
- **Doctors** access it via desktop devices.  

The frontend is built with **Next.js (React + TypeScript)** to ensure:

- Consistent design across roles
- Shared logic
- Fast iteration  

> This document covers only the **frontend behaviour** for both patient and doctor interfaces.

---

## 2. Technologies

| Layer | Technology | Reason |
|-------|-------------|--------|
| **Frontend (Unified Web)** | TypeScript + React (Next.js) | Single responsive web app for both patient and doctor; modern web tooling and fast iteration |
| **Version Control** | GitHub | Centralized repo for code and documentation |
| **Design Tools** | MS Word prototypes | Visual prototypes and user flows |

---

## 3. Functional Requirements

### A. Authentication & User Session (Shared)

1. Patient can **Sign Up** (name, email, password).  
2. Both patients and doctors can **Sign In** (email, password).  
3. App stores a **session token** and reuses it on browser restart.  
4. **Sign Out** clears session data.  
5. Show validation and API error messages (401/400).

---

## B. Patient Interface (Responsive Web)

### Home & Doctor Discovery

1. See list of doctors (name, specialty, city).  
2. Filter/search by **specialty** and **city**.  
3. View detailed **doctor profile**.

### Availability & Booking

4. View doctor’s **available time slots** by date.  
5. **Book an appointment** by selecting and confirming a slot.  
6. Show confirmation on success.  
7. If slot unavailable → show conflict + refresh.

### 📋 My Appointments

8. List of upcoming appointments.  
9. View appointment details (doctor, time, notes).  
10. Cancel appointment (with confirmation).

### Profile

11. View profile (name, email).  
12. Edit profile (name; email change may need re-authentication).

### App States & UX

13. Show loading states.  
14. Show empty states.  
15. Show error states with retry actions.

---

## C. Doctor Interface (Responsive Web)

### Dashboard

1. Doctor logs in and lands on a dashboard.  
2. View calendar/list of appointments (today / range).  
3. Filter by date range.

### Appointment Details

4. Open appointment details (patient, time, notes).  
5. Confirm or cancel appointments.

### Patient Chart

6. View basic patient card (name, contact, medical data).  
7. Persistent session across logins.  
8. Consistent loading/empty/error states.

---

## D. Cross-Cutting Frontend Behaviour

- Loading, Empty, and Error states applied globally.  
- Form validation for login/sign-up.  
- 401 handling → redirect to Sign In.  
- Secure token storage.  
- Consistent headers and primary CTA layout.  
- Date/time shown in **local device time**.

---

## Milestone 1 – Authentication & Frontend Foundations (Nov 4 – Nov 17)

### Objective

Build the complete **authentication layer and app structure** for the Health Services App frontend.  
This milestone focuses on all user-facing flows related to **Sign Up, Login, Email Verification, Password Reset, and Session Handling**, in alignment with the backend’s authentication endpoints.

---

### Scope

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

- Implement **auth state management** (Context/Zustand/Redux):
  - `user`, `role`, `isAuthenticated`, and `token` (if needed).
- Protect routes:
  - `/patient/*` → accessible only to patients  
  - `/doctor/*` → accessible only to doctors
- Redirect unauthenticated users to `/login`.
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

---

### Deliverables

- Functional Sign Up, Login, Email Verification, Forgot Password, and Reset Password screens.
- Working session handling and route protection.
- Shared auth store and API client layer.
- Responsive layout and accessible form components.
- Updated frontend milestone plan for next phase.

---

### Acceptance Criteria

- App builds and runs locally.  
- User can register, verify email, and log in successfully.  
- Password reset and logout work end-to-end.  
- Protected routes redirect unauthenticated users.  
- Session persists securely across browser refresh.  
- Clear loading and error states on all auth pages.

---

### Demo Checklist

- Register a new patient → see “Check your email” screen.  
- Click verification link → log in → arrive at `/patient/home`.  
- Log in as doctor → arrive at `/doctor/dashboard`.  
- Use Forgot Password flow → set new password → log in.  
- Try to access protected page while logged out → redirect to Login.  

---


## Milestone 2 – Profiles & Availability Integration

### Objective

Expand the frontend to support **profile management** for both patients and doctors, and integrate **availability scheduling** on the doctor side.  
This milestone focuses on enabling users to **view and edit their profiles**, upload profile photos, manage availability, and connect all these flows with the new backend endpoints.

---

### Scope

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

---

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

---

### API Integration

- Connect to backend’s **Profile CRUD** and **Availability endpoints**.
- Use the authenticated session token (from Milestone 1) in all requests.
- Update `/docs/api-contract.md` to include:
  - Patient & Doctor profile schemas
  - Medical record JSON format
  - Availability data model and endpoints
- Ensure consistent 401/403 handling and error mapping from backend.

---

### Deliverables

- Functional **Patient and Doctor Profile** pages with editable forms.
- Working **photo upload** (base64 preview + server update).
- Integrated **medical record** view and edit support.
- **Doctor Availability** dashboard with add/remove time blocks.
- Updated API documentation and milestone plan for Milestone 3.

---

### Acceptance Criteria

- Patient and Doctor can view and edit their profiles.
- Profile photo upload and update work as expected.  
- Medical record displays and updates correctly.  
- Doctor can manage weekly availability (add/remove time slots).  
- All data updates persist via live API endpoints (no mock data).  
- Proper form validation and responsive design for both roles.  
- Clear success/error messages for all profile and availability actions.

---

### Demo Checklist

- Log in as **patient** → open Profile → edit name + upload photo → save changes.  
- View medical record → modify a field → save successfully.  
- Log in as **doctor** → open Profile → edit details → upload photo.  
- Go to **Availability** section → add available hours → refresh → verify saved data.  
- Try overlapping slots or invalid input → see validation/error messages.  
- Confirm all requests handled securely with session token.

---

## Milestone 3 – Enhancements & Reliability

### Objective
Finalize functionality and UX for demo readiness.

### Scope

- Cancel/confirm appointments (if supported by API).  
- Basic patient card view.  
- Accessibility & performance improvements.  
- Session expiry, toasts, edge cases handled.

### Deliverables

- QA builds, bug list, known limitations.  
- 1–2 min demo video.

### Acceptance

- All MVP features complete or documented as out-of-scope.  
- No blockers in main flows.

---

## Milestone 4 – Final Demo

### Objective
Deliver a polished, documented, and demo-ready product.

### Scope

- UI polishing (spacing, contrast, copy).  
- Complete docs:
- `README.md` (this file)  
- API mapping  
- FR coverage table (FR → screen → endpoint)  
- Tag final release.

### Deliverables

- Live demo + final repo state + slide deck.

### Acceptance

- End-to-end flow demo (patient booking + doctor view).  
- Documentation complete and reproducible.

---

## Summary

| Milestone | Focus | Key Outcome |
|------------|--------|-------------|
| **M1** | Technical setup | Working structure & navigation |
| **M2** | API integration | Real backend connectivity |
| **M3** | UX & reliability | Polished and stable app |
| **M4** | Demo & docs | Final presentation and documentation |

---

