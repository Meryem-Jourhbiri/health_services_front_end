// lib/profile/patient-api.ts
import { ApiError, authHeaders } from "@/lib/auth/api";
import type { PatientProfileDTO } from "@/lib/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export type PatientProfile = PatientProfileDTO;

type BackendPatientProfile = Omit<
  PatientProfileDTO,
  "phone" | "address" | "insuranceInfo"
> & {
  phone?: string | null;
  address?: string | null;
  insuranceInfo?: string | null;
};

function normalizeProfile(p: BackendPatientProfile): PatientProfileDTO {
  return {
    ...p,
    phone: p.phone ?? "",
    address: p.address ?? "",
    insuranceInfo: p.insuranceInfo ?? "",
    medicalHistory:
      (p.medicalHistory ?? {}) as Record<string, Record<string, unknown>>,
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
      ...(authHeaders(token) || {}),
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

export async function getPatientProfile(
  token: string | null,
): Promise<PatientProfileDTO> {
  const backend = await authedRequest<BackendPatientProfile>("/api/profile/patient", token, {
    method: "GET",
  });
  return normalizeProfile(backend);
}

export async function updatePatientProfile(
  token: string | null,
  payload: PatientProfileDTO,
): Promise<PatientProfileDTO> {
  const backend = await authedRequest<BackendPatientProfile>("/api/profile/patient", token, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return normalizeProfile(backend);
}
