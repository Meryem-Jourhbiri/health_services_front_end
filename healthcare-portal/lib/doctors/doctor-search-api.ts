import { ApiError, authHeaders } from "@/lib/auth/api";
import type { DoctorPublicProfileDTO, DoctorSearchResponse } from "@/lib/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export type DoctorSearchItem = DoctorPublicProfileDTO;

export type DoctorSearchParams = {
  name?: string;
  specialization?: string;
  languages?: string[]; // backend expects "languages" repeated in query
  minRating?: number;
  availableDate?: string; // YYYY-MM-DD (swagger: string($date))
  sortBy?: "rating" | "experience";
  page?: number;
  size?: number; // swagger says "size" (not pageSize)
};

type DoctorSearchResponseDTO = DoctorSearchResponse;

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

  if (res.status === 204) return {} as T;
  return (await res.json()) as T;
}

function buildQuery(params: DoctorSearchParams) {
  const qs = new URLSearchParams();

  if (params.name?.trim()) qs.set("name", params.name.trim());
  if (params.specialization?.trim())
    qs.set("specialization", params.specialization.trim());

  if (params.languages?.length) {
    for (const lang of params.languages.map((l) => l.trim()).filter(Boolean)) {
      qs.append("languages", lang);
    }
  }

  if (params.minRating != null) qs.set("minRating", String(params.minRating));
  if (params.availableDate) qs.set("availableDate", params.availableDate);

  if (params.sortBy) qs.set("sortBy", params.sortBy);

  if (params.page != null) qs.set("page", String(params.page));
  if (params.size != null) qs.set("size", String(params.size));

  const s = qs.toString();
  return s ? `?${s}` : "";
}

export async function searchDoctors(
  token: string | null,
  params: DoctorSearchParams = {},
): Promise<DoctorSearchItem[]> {
  const query = buildQuery(params);

  const res = await authedRequest<DoctorSearchResponseDTO>(
    `/api/doctors/search${query}`,
    token,
    { method: "GET" },
  );

  return res?.doctors ?? [];
}

export async function getDoctorDetails(
  token: string | null,
  id: string,
): Promise<DoctorPublicProfileDTO> {
  const safeId = encodeURIComponent(id);
  const res = await authedRequest<DoctorPublicProfileDTO>(
    `/api/doctors/${safeId}`,
    token,
    { method: "GET" },
  );

  return res;
}
