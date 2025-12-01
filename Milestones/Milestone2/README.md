# Milestone 2 – Profiles & Availability Integration

## Objective

Expand the frontend to support **profile management** for both patients and doctors, and integrate **availability scheduling** on the doctor side.  
This milestone focuses on enabling users to **view and edit their profiles**, upload profile photos, manage availability, and connect all these flows with the new backend endpoints.

---

## Scope

### Profile Management

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

### Availability Management

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

## API Integration

- Connect to backend’s **Profile CRUD** and **Availability endpoints**.
- Use the authenticated session token (from Milestone 1) in all requests.
- Update `/docs/api-contract.md` to include:
  - Patient & Doctor profile schemas
  - Medical record JSON format
  - Availability data model and endpoints
- Ensure consistent 401/403 handling and error mapping from backend.

---

## Deliverables

- Functional **Patient and Doctor Profile** pages with editable forms.
- Working **photo upload** (base64 preview + server update).
- Integrated **medical record** view and edit support.
- **Doctor Availability** dashboard with add/remove time blocks.
- Updated API documentation and milestone plan for Milestone 3.

---

## Acceptance Criteria

- Patient and Doctor can view and edit their profiles.
- Profile photo upload and update work as expected.  
- Medical record displays and updates correctly.  
- Doctor can manage weekly availability (add/remove time slots).  
- All data updates persist via live API endpoints (no mock data).  
- Proper form validation and responsive design for both roles.  
- Clear success/error messages for all profile and availability actions.

---

## Demo Checklist

- Log in as **patient** → open Profile → edit name + upload photo → save changes.  
- View medical record → modify a field → save successfully.  
- Log in as **doctor** → open Profile → edit details → upload photo.  
- Go to **Availability** section → add available hours → refresh → verify saved data.  
- Try overlapping slots or invalid input → see validation/error messages.  
- Confirm all requests handled securely with session token.

---