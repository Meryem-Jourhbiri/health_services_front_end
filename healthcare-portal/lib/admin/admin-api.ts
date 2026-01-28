import { ApiError, authHeaders } from "@/lib/auth/api";
import type {
  AdminDashboardDTO,
  AdminUserDTO,
  ApiResponseAdminDashboardDTO,
  ApiResponseAdminUserDTO,
  ApiResponseMapStringObject,
  PageAdminUserDTO,
  PageAuditLogDTO,
  PageDoctorApprovalDTO,
} from "@/lib/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const BASE_URL = API_BASE_URL?.replace(/\/$/, "");

type AdminUserListParams = {
  search?: string;
  page?: number;
  size?: number;
};

type PendingDoctorParams = {
  page?: number;
  size?: number;
};

type AuditLogParams = {
  userId?: string;
  action?: string;
  resourceType?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  size?: number;
};

function buildQuery(params: Record<string, string | number | undefined>) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    qs.set(key, String(value));
  });
  const query = qs.toString();
  return query ? `?${query}` : "";
}

async function authedRequest<T>(
  path: string,
  token: string | null,
  init: RequestInit,
): Promise<T> {
  if (!BASE_URL) {
    throw new ApiError("API base URL is not set (NEXT_PUBLIC_API_BASE_URL).");
  }

  const res = await fetch(`${BASE_URL}${path}`, {
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

export async function getAdminDashboard(
  token: string | null,
): Promise<AdminDashboardDTO> {
  const res = await authedRequest<ApiResponseAdminDashboardDTO>(
    "/api/admin/dashboard",
    token,
    { method: "GET" },
  );
  return res?.data ?? {};
}

export async function getAdminUsers(
  token: string | null,
  params: AdminUserListParams = {},
): Promise<PageAdminUserDTO> {
  const query = buildQuery({
    search: params.search?.trim() || undefined,
    page: params.page,
    size: params.size,
  });

  return authedRequest<PageAdminUserDTO>(
    `/api/admin/users${query}`,
    token,
    { method: "GET" },
  );
}

export async function getAdminUser(
  token: string | null,
  id: string,
): Promise<AdminUserDTO> {
  const safeId = encodeURIComponent(id);
  const res = await authedRequest<ApiResponseAdminUserDTO>(
    `/api/admin/users/${safeId}`,
    token,
    { method: "GET" },
  );
  return res?.data ?? {};
}

export async function suspendAdminUser(
  token: string | null,
  id: string,
): Promise<ApiResponseMapStringObject> {
  const safeId = encodeURIComponent(id);
  return authedRequest<ApiResponseMapStringObject>(
    `/api/admin/users/${safeId}/suspend`,
    token,
    { method: "PUT" },
  );
}

export async function activateAdminUser(
  token: string | null,
  id: string,
): Promise<ApiResponseMapStringObject> {
  const safeId = encodeURIComponent(id);
  return authedRequest<ApiResponseMapStringObject>(
    `/api/admin/users/${safeId}/activate`,
    token,
    { method: "PUT" },
  );
}

export async function getPendingDoctors(
  token: string | null,
  params: PendingDoctorParams = {},
): Promise<PageDoctorApprovalDTO> {
  const query = buildQuery({
    page: params.page,
    size: params.size,
  });

  return authedRequest<PageDoctorApprovalDTO>(
    `/api/admin/doctors/pending${query}`,
    token,
    { method: "GET" },
  );
}

export async function approveDoctor(
  token: string | null,
  id: string,
): Promise<ApiResponseMapStringObject> {
  const safeId = encodeURIComponent(id);
  return authedRequest<ApiResponseMapStringObject>(
    `/api/admin/doctors/${safeId}/approve`,
    token,
    { method: "PUT" },
  );
}

export async function rejectDoctor(
  token: string | null,
  id: string,
  reason: string,
): Promise<ApiResponseMapStringObject> {
  const safeId = encodeURIComponent(id);
  const query = buildQuery({ reason });
  return authedRequest<ApiResponseMapStringObject>(
    `/api/admin/doctors/${safeId}/reject${query}`,
    token,
    { method: "PUT" },
  );
}

export async function getAuditLogs(
  token: string | null,
  params: AuditLogParams = {},
): Promise<PageAuditLogDTO> {
  const query = buildQuery({
    userId: params.userId?.trim() || undefined,
    action: params.action?.trim() || undefined,
    resourceType: params.resourceType?.trim() || undefined,
    startDate: params.startDate || undefined,
    endDate: params.endDate || undefined,
    page: params.page,
    size: params.size,
  });

  return authedRequest<PageAuditLogDTO>(
    `/api/admin/audit-logs${query}`,
    token,
    { method: "GET" },
  );
}
