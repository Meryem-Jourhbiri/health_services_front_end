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
  - A **mobile app for patients** (Android/iOS).
  - A **web app for doctors** (browser-based).
  - A **cloud backend** that exposes APIs for both frontends.
- This repository focuses mainly on the **frontend side**; the backend is planned/maintained separately.

-

## 2. Architecture (Tiered)

Per project specification:

- **Frontend – Patient (Mobile)**  
  - iPhone/Android mobile-ready app (Next.js).  
  - Handles patient-facing flows (e.g. login, appointments, basic information).

- **Frontend – Doctor (Web)**  
  - Browser-based web application (React).  
  - Provides views on patients and appointments and supports doctor workflows.

- **Middle/Backend**
  - Containerized services in the cloud.  
  - Exposes HTTP/JSON APIs consumed by both frontends.

-

## 3. Technologies

| Layer                    | Technology                              | Reason                                                                                              |
|--------------------------|-----------------------------------------|-----------------------------------------------------------------------------------------------------|
| Frontend (Mobile)        | TypeScript + React (Next.js)               | Single codebase for iOS and Android, strong type safety;                                            |
| Frontend (Doctor Web)    | TypeScript + React (Next.js)            | Shared language and patterns with the mobile app; modern web framework for the doctor-facing portal;|
| Framework tools (Mobile) | DevTools mobile view                                   | Simplified setup, testing and deployment for the mobile prototype;                                  |
| Version control          | GitHub                                  | Centralized repo for code and documentation;                                                        |
| Design tools             | MS Word prototypes                      | Simple visual prototypes and user flows;                                                            |
| Backend                  | Containerized services in the cloud     | Scalable and deployable middle layer (implementation details TBD);                                  |

-

## 4. Repository Structure (planned)

```text
/mobile        # Patient mobile app (React (Next.js)  + TypeScript)
/doctor-web    # Doctor web app (TypeScript + React + Next.js) – planned
/docs          # Project documentation, diagrams, plans
