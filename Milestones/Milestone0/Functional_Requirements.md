# Functional Requirements

This outlines a high-level list of initial functional requirements for the frontend application.

## Background and Purpose

The goal of the **Health Services App** is to connect patients with doctors through a unified, responsive digital platform.

- **Patients** use the app primarily on mobile browsers.  
- **Doctors** access it via desktop devices.  

The frontend is built with **Next.js (React + TypeScript)** to ensure:

- Consistent design across roles
- Shared logic
- Fast iteration  

> This document covers only the **frontend behavior** for both patient and doctor interfaces.

## A. Authentication & User Session (Shared)

1. Patient can **Sign Up** (name, email, password).  
2. Both patients and doctors can **Sign In** (email, password).  
3. App stores a **session token** and reuses it on browser restart.  
4. **Sign Out** clears session data.  
5. Show validation and API error messages (401/400).

## B. Patient Interface (Responsive Web)

### Home & Doctor Discovery

1. See list of doctors (name, specialty, city).  
2. Filter/search by **specialty** and **city**.  
3. View detailed **doctor profile**.

### Availability & Booking

1. View doctor’s **available time slots** by date.  
2. **Book an appointment** by selecting and confirming a slot.  
3. Show confirmation on success.  
4. If slot unavailable → show conflict + refresh.

### My Appointments

1. List of upcoming appointments.  
2. View appointment details (doctor, time, notes).  
3. Cancel appointment (with confirmation).

### Profile

1. View profile (name, email).  
2. Edit profile (name; email change may need re-authentication).

### App States & UX

1. Show loading states.  
2. Show empty states.  
3. Show error states with retry actions.

## C. Doctor Interface (Responsive Web)

### Dashboard

1. Doctor logs in and lands on a dashboard.  
2. View calendar/list of appointments (today / range).  
3. Filter by date range.

### Appointment Details

1. Open appointment details (patient, time, notes).  
2. Confirm or cancel appointments.

### Patient Chart

1. View basic patient card (name, contact, medical data).  
2. Persistent session across logins.  
3. Consistent loading/empty/error states.

## D. General Frontend Behavior

1. Loading, Empty, and Error states applied globally.  
2. Form validation for login/sign-up.  
3. 401 handling → redirect to Sign In.  
4. Secure token storage.  
5. Consistent headers and primary CTA layout.  
6. Date/time shown in **local device time**.
