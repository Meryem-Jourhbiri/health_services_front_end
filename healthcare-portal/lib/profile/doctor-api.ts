// lib/profile/doctor-api.ts
import { ApiError } from "@/lib/auth/api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export type DoctorProfile = {
  firstName: string;
  lastName: string;
  phone: string;
  gender: string;
  profilePhotoBase64?: string;
  licenseNumber: string;
  specialization: string;
  experience: number;
  education: string;
  bio: string;
  languages: string[];
  clinicAddress: string;
};

type BackendDoctorProfile = Omit<DoctorProfile, "phone" | "experience" | "languages"> & {
  phone: string | null;
  experience: number | null;
  languages: string[] | null;
};

function normalizeProfile(profile: BackendDoctorProfile): DoctorProfile {
  return {
    ...profile,
    phone: profile.phone ?? "",
    experience: profile.experience ?? 0,
    languages: profile.languages ?? [],
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

export async function getDoctorProfile(
  token: string | null,
): Promise<DoctorProfile> {
  const backend = await authedRequest<BackendDoctorProfile>(
    "/api/profile/doctor",
    token,
    { method: "GET" },
  );
  return normalizeProfile(backend);
}

export async function updateDoctorProfile(
  token: string | null,
  payload: DoctorProfile,
): Promise<DoctorProfile> {
  const backend = await authedRequest<BackendDoctorProfile>(
    "/api/profile/doctor",
    token,
    {
      method: "PUT",
      body: JSON.stringify(payload),
    },
  );
  return normalizeProfile(backend);
}
