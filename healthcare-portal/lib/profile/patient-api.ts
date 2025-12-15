// lib/profile/patient-api.ts
import { ApiError } from "@/lib/auth/api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export type PatientProfile = {
  firstName: string;
  lastName: string;
  dob: string; // YYYY-MM-DD
  phone: string;
  address: string;
  gender: string;
  insuranceInfo: string;
  medicalHistory: Record<string, unknown>;
  profilePhotoBase64?: string;
};

type BackendPatientProfile = Omit<PatientProfile, "phone" | "address" | "insuranceInfo"> & {
  phone: string | null;
  address: string | null;
  insuranceInfo: string | null;
};

function normalizeProfile(p: BackendPatientProfile): PatientProfile {
  return {
    ...p,
    phone: p.phone ?? "",
    address: p.address ?? "",
    insuranceInfo: p.insuranceInfo ?? "",
    medicalHistory: (p.medicalHistory ?? {}) as Record<string, unknown>,
  };
}

async function authedRequest<T>(
  path: string,
  token: string | null,
  init: RequestInit,
): Promise<T> {
  if (!API_BASE_URL) {
    throw new ApiError("API base URL is not set (NEXT_PUBLIC_API_BASE_URL).");
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers || {}),
    },
  });

  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");

  if (!res.ok) {
    let message = "Request failed";
    try {
      if (isJson) {
        const body = await res.json();
        message = body?.message || JSON.stringify(body);
      } else {
        message = await res.text();
      }
    } catch {
      // ignore
    }
    throw new ApiError(message || "Request failed", res.status);
  }

  if (res.status === 204) {
    return {} as T;
  }

  return (await res.json()) as T;
}

export async function getPatientProfile(token: string | null): Promise<PatientProfile> {
  const backend = await authedRequest<BackendPatientProfile>("/api/profile/patient", token, {
    method: "GET",
  });
  return normalizeProfile(backend);
}

export async function updatePatientProfile(
  token: string | null,
  payload: PatientProfile,
): Promise<PatientProfile> {
  const backend = await authedRequest<BackendPatientProfile>("/api/profile/patient", token, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return normalizeProfile(backend);
}

