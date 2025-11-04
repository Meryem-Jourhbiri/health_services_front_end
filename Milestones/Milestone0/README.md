# Health Services App - Project Overview

This project is a **mobile-first patient health portal**, designed to simulate a modern healthcare app experience. It enables patients to **search for doctors, book and manage appointments, and access their personal health information**.

Complementing this, the **Desktop doctor portal**, provides healthcare professionals with a **comprehensive view of each patient's chart**, as well as their **daily schedule and upcoming appointments** to efficiently manage consultations.

**Status:**

- **Last updated:** November 2025
- **Current focus:** UI prototyping and API design alignment
- **Next milestone:**

## 1. Scope & Goals

- Connect **patients** and **doctors** through a digital platform.
- Provide:
  - A **patient interface** (mobile-first web).
  - A **doctor interface** (desktop-focused web).
  - A **cloud backend** that exposes APIs for both frontends.
- This repository focuses mainly on the **frontend side**; the backend is planned/maintained separately.

-

## 2. Architecture (Tiered)

Per project specification:

- **Frontend – Unified Web (Next.js)**  
  - One Next.js application with role-based areas, e.g.:  
    - `/patient/login`, `/patient/home`, `/patient/booking`, `/patient/appointments`, `/patient/profile`  
    - `/doctor/login`, `/doctor/dashboard`, `/doctor/patients`  
  - Responsive layout so that:
    - Patients get a **mobile-first** experience.
    - Doctors get a **desktop-friendly** view (wider layouts, tables, etc.).

- **Middle/Backend**  
  - Containerized services in the cloud.  
  - Exposes HTTP/JSON APIs consumed by both frontends.

-

## 3. Technologies

| Layer                    | Technology                              | Reason                                                                                              |
|--------------------------|-----------------------------------------|-----------------------------------------------------------------------------------------------------|
| Frontend (unified)       | TypeScript + React (Next.js)            | Single responsive web app for both patient and doctor; modern web tooling and fast iteration        |
| Version control          | GitHub                                  | Centralized repo for code and documentation;                                                        |
| Design tools             | MS Word prototypes                      | Simple visual prototypes and user flows;                                                            |

-

## 4. Repository Structure (planned)

```text
/mobile        # Patient mobile app (React Native + TypeScript + Expo)
/doctor-web    # Doctor web app (TypeScript + React + Next.js) – planned
/docs          # Project documentation, diagrams, plans
