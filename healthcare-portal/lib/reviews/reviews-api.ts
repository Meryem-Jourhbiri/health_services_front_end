import { ApiError } from "@/lib/auth/api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export type Review = {
  id: string;
  appointmentId: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  rating: number;
  comment?: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateReviewPayload = {
  appointmentId: string;
  rating: number;
  comment?: string;
};

export type ReviewPage = {
  content: Review[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  numberOfElements: number;
  first: boolean;
  last: boolean;
  empty: boolean;
};

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

export async function createReview(
  token: string | null,
  payload: CreateReviewPayload,
): Promise<Review> {
  return authedRequest<Review>("/api/reviews", token, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateReview(
  token: string | null,
  id: string,
  payload: CreateReviewPayload,
): Promise<Review> {
  return authedRequest<Review>(`/api/reviews/${id}`, token, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteReview(
  token: string | null,
  id: string,
): Promise<{ success?: boolean; message?: string }> {
  return authedRequest<{ success?: boolean; message?: string }>(
    `/api/reviews/${id}`,
    token,
    { method: "DELETE" },
  );
}

export async function getReviewsByDoctor(
  token: string | null,
  doctorId: string,
  page = 0,
  size = 10,
): Promise<ReviewPage> {
  const query = new URLSearchParams({
    page: String(page),
    size: String(size),
  }).toString();

  return authedRequest<ReviewPage>(
    `/api/reviews/doctor/${doctorId}?${query}`,
    token,
    { method: "GET" },
  );
}
