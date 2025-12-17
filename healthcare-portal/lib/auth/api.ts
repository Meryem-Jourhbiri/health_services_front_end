//HTTP Layer 

import type {
  AuthUser,
  ForgotPasswordPayload,
  GenericResponse,
  LoginPayload,
  LoginResponse,
  RegisterPayload,
  ResetPasswordPayload,
  UserRole,
} from "./types";

const API_BASE_URL = 'http://localhost:8080';

export class ApiError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

const wait = (ms = 800) => new Promise((resolve) => setTimeout(resolve, ms));

const inferRoleFromEmail = (email: string): UserRole =>
  email.toLowerCase().includes("doctor") ? "doctor" : "patient";

const mockUser = (email: string): AuthUser => {
  const role = inferRoleFromEmail(email);
  return {
    id: `${role}-mock-123`,
    name: role === "doctor" ? "Dr. Demo" : "Patient Demo",
    email,
    role,
    emailVerified: role === "doctor",
  };
};

const sanitizeBaseUrl = (base: string | undefined) =>
  base ? base.replace(/\/$/, "") : base;

const BASE_URL = sanitizeBaseUrl(API_BASE_URL);

// Helper to attach Authorization header for protected calls
export const authHeaders = (token: string | null | undefined) =>
  token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};

async function request<T>(path: string, init: RequestInit): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });

  if (!response.ok) {
    let message = "Request failed";
    try {
      const data = await response.json();
      message =
        (data as { message?: string; error?: string }).message ||
        (data as { message?: string; error?: string }).error ||
        message;
    } catch {
      message = (await response.text()) || message;
    }
    throw new ApiError(message, response.status);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return (await response.json()) as T;
}

<<<<<<< HEAD
// Backend login response (Omar)
type BackendLoginResponse = {
  token: string;
  type?: string; // "Bearer"
  userId: string;
  email: string;
  role: string; // "PATIENT" | "DOCTOR"
=======
type BackendLoginResponse = {
  token: string;
  type?: string;
  userId: string;
  email: string;
  role: string;
>>>>>>> origin/main
  message?: string;
};

export async function login(payload: LoginPayload): Promise<LoginResponse> {
<<<<<<< HEAD
  // Mock mode (kad nema env var)
  if (!API_BASE_URL) {
=======
  console.log('here');
  console.log(payload);
  if (!BASE_URL) {
>>>>>>> origin/main
    await wait();
    if (!payload.email || !payload.password) {
      throw new ApiError("Email and password are required.");
    }

    return {
      token: `mock-token-${inferRoleFromEmail(payload.email)}`,
      user: mockUser(payload.email),
    };
  }

<<<<<<< HEAD
  // Real backend
  const backend = await request<BackendLoginResponse>("/api/auth/login", {
=======
  const response = await request<BackendLoginResponse>("/api/auth/login", {
>>>>>>> origin/main
    method: "POST",
    body: JSON.stringify(payload),
  });

<<<<<<< HEAD
  const role: UserRole =
    backend.role?.toLowerCase() === "doctor" ? "doctor" : "patient";

  return {
    token: backend.token,
    user: {
      id: backend.userId,
      email: backend.email,
      role,
      name: backend.email?.split("@")[0] ?? "User",
      // backend ti je dozvolio login => email je verifikovan / user enabled
      emailVerified: true,
    },
  };
=======
  const normalizedRole = response.role?.toLowerCase();
  const role =
    normalizedRole === "doctor"
      ? "doctor"
      : normalizedRole === "admin"
        ? "admin"
        : "patient";
  const user: AuthUser = {
    id: response.userId,
    email: response.email,
    role,
    name: response.email,
    emailVerified: true,
  };

  return { token: response.token, user };
>>>>>>> origin/main
}

export async function register(
  payload: RegisterPayload,
): Promise<GenericResponse> {
  console.log('here');
  console.log(payload);
  if (!BASE_URL) {
    await wait();
    if (
      !payload.firstName ||
      !payload.lastName ||
      !payload.email ||
      !payload.password ||
      !payload.phone ||
      !payload.gender ||
      !payload.dob
    ) {
      throw new ApiError("All required fields are needed.");
    }

    return { message: "Mock account created. Check your inbox to verify." };
  }

<<<<<<< HEAD
=======
  console.log('here');

  const backendRole =
    payload.role === "doctor"
      ? "DOCTOR"
      : payload.role === "patient"
        ? "PATIENT"
        : payload.role === "admin"
          ? "ADMIN"
          : payload.role.toUpperCase();

  const body = {
    email: payload.email,
    password: payload.password,
    role: backendRole,
    firstName: payload.firstName,
    lastName: payload.lastName,
    phone: payload.phone,
    gender: payload.gender,
    dob: payload.dob,
    licenseNumber: payload.licenseNumber,
    specialization: payload.specialization,
    experience: payload.experience,
  };

  console.log('body');

>>>>>>> origin/main
  return request<GenericResponse>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function requestPasswordReset(
  payload: ForgotPasswordPayload,
): Promise<GenericResponse> {
  if (!BASE_URL) {
    await wait();
    if (!payload.email) {
      throw new ApiError("Email is required.");
    }

    return {
      message:
        "If the email exists we just sent password reset instructions to it.",
    };
  }

<<<<<<< HEAD
  return request<GenericResponse>("/api/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify(payload),
  });
=======
  return request<GenericResponse>(
    `api/auth/forgot-password?email=${encodeURIComponent(payload.email)}`,
    {
      method: "POST",
      // backend reads query param; body not required
      body: undefined,
    },
  );
>>>>>>> origin/main
}

export async function resetPassword(
  payload: ResetPasswordPayload,
): Promise<GenericResponse> {
  if (!BASE_URL) {
    await wait();
    if (!payload.token || !payload.password) {
      throw new ApiError("Token and password are required.");
    }

    return { message: "Mock password reset complete." };
  }

<<<<<<< HEAD
  return request<GenericResponse>("/api/auth/reset-password", {
    method: "POST",
    body: JSON.stringify(payload),
  });
=======
  return request<GenericResponse>(
    `api/auth/reset-password?token=${encodeURIComponent(payload.token)}&newPassword=${encodeURIComponent(payload.password)}`,
    {
      method: "POST",
      body: undefined,
    },
  );
>>>>>>> origin/main
}

export async function verifyEmail(token: string): Promise<GenericResponse> {
  if (!BASE_URL) {
    await wait();
    if (!token) {
      throw new ApiError("Verification token missing.");
    }

    return { message: "Email verified." };
  }

<<<<<<< HEAD
  return request<GenericResponse>("/api/auth/verify-email", {
    method: "POST",
    body: JSON.stringify(payload),
  });
=======
  return request<GenericResponse>(
    `api/verify-email?token=${encodeURIComponent(token)}`,
    {
      method: "POST",
      body: undefined,
    },
  );
>>>>>>> origin/main
}

