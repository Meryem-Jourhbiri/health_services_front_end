// lib/availability/availability-api.ts
import { ApiError, authHeaders } from "@/lib/auth/api";
import type { DayOfWeek, UnavailabilityDTO } from "@/lib/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export type AvailabilitySchedule = {
  id: string;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  breakStartTime?: string | null;
  breakEndTime?: string | null;
  slotDurationMinutes: number;
};

export type AvailabilityPayload = Omit<AvailabilitySchedule, "id">;

export type UnavailabilityPeriod = UnavailabilityDTO;

export type UnavailabilityPayload = Omit<UnavailabilityPeriod, "id">;

export type TimeSlot = {
  date: string;
  startTime: string;
  endTime: string;
  available: boolean;
};

async function request<T>(path: string, init: RequestInit): Promise<T> {
  if (!API_BASE_URL) {
    throw new ApiError("API base URL is not set (NEXT_PUBLIC_API_BASE_URL).");
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
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


export async function createAvailability(
  token: string | null,
  payload: AvailabilityPayload,
): Promise<AvailabilitySchedule> {
  return request<AvailabilitySchedule>("/api/availability", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
}

export async function getAvailabilities(
  token: string | null,
): Promise<AvailabilitySchedule[]> {
  return request<AvailabilitySchedule[]>("/api/availability", {
    method: "GET",
    headers: authHeaders(token),
  });
}

export async function updateAvailability(
  token: string | null,
  id: string,
  payload: AvailabilityPayload,
): Promise<AvailabilitySchedule> {
  return request<AvailabilitySchedule>(`/api/availability/${id}`, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
}

export async function deleteAvailability(
  token: string | null,
  id: string,
): Promise<{ message?: string; success?: boolean }> {
  return request<{ message?: string; success?: boolean }>(
    `/api/availability/${id}`,
    {
      method: "DELETE",
      headers: authHeaders(token),
    },
  );
}

export async function createUnavailability(
  token: string | null,
  payload: UnavailabilityPayload,
): Promise<UnavailabilityPeriod> {
  return request<UnavailabilityPeriod>("/api/availability/unavailability", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
}

export async function getUnavailabilities(
  token: string | null,
): Promise<UnavailabilityPeriod[]> {
  return request<UnavailabilityPeriod[]>(
    "/api/availability/unavailability",
    {
      method: "GET",
      headers: authHeaders(token),
    },
  );
}

export async function deleteUnavailability(
  token: string | null,
  id: string,
): Promise<{ message?: string; success?: boolean }> {
  return request<{ message?: string; success?: boolean }>(
    `/api/availability/unavailability/${id}`,
    {
      method: "DELETE",
      headers: authHeaders(token),
    },
  );
}

export async function getAvailableSlots(
  doctorId: string,
  date: string,
): Promise<TimeSlot[]> {
  const query = new URLSearchParams({ date }).toString();
  return request<TimeSlot[]>(`/api/availability/slots/${doctorId}?${query}`, {
    method: "GET",
  });
}
