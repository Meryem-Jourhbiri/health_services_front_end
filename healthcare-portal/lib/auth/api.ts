import type {
  AuthUser,
  ForgotPasswordPayload,
  GenericResponse,
  LoginPayload,
  LoginResponse,
  RegisterPayload,
  ResetPasswordPayload,
  UserRole,
  VerifyEmailPayload,
} from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export class ApiError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

const wait = (ms = 700) => new Promise((resolve) => setTimeout(resolve, ms));

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

async function request<T>(path: string, init: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new ApiError(message || "Request failed", response.status);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return (await response.json()) as T;
}

// Backend login response (Omar)
type BackendLoginResponse = {
  token: string;
  type?: string; // "Bearer"
  userId: string;
  email: string;
  role: string; // "PATIENT" | "DOCTOR"
  message?: string;
};

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  // Mock mode (kad nema env var)
  if (!API_BASE_URL) {
    await wait();
    if (!payload.email || !payload.password) {
      throw new ApiError("Email and password are required.");
    }

    return {
      token: `mock-token-${inferRoleFromEmail(payload.email)}`,
      user: mockUser(payload.email),
    };
  }

  // Real backend
  const backend = await request<BackendLoginResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });

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
}

export async function register(
  payload: RegisterPayload,
): Promise<GenericResponse> {
  if (!API_BASE_URL) {
    await wait();
    if (!payload.name || !payload.email || !payload.password) {
      throw new ApiError("All fields are required.");
    }

    return { message: "Mock account created. Check your inbox to verify." };
  }

  return request<GenericResponse>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function requestPasswordReset(
  payload: ForgotPasswordPayload,
): Promise<GenericResponse> {
  if (!API_BASE_URL) {
    await wait();
    if (!payload.email) {
      throw new ApiError("Email is required.");
    }

    return {
      message:
        "If the email exists we just sent password reset instructions to it.",
    };
  }

  return request<GenericResponse>("/api/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function resetPassword(
  payload: ResetPasswordPayload,
): Promise<GenericResponse> {
  if (!API_BASE_URL) {
    await wait();
    if (!payload.token || !payload.password) {
      throw new ApiError("Token and password are required.");
    }

    return { message: "Mock password reset complete." };
  }

  return request<GenericResponse>("/api/auth/reset-password", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function verifyEmail(
  payload: VerifyEmailPayload,
): Promise<GenericResponse> {
  if (!API_BASE_URL) {
    await wait();
    if (!payload.token) {
      throw new ApiError("Verification token missing.");
    }

    return { message: "Email verified." };
  }

  return request<GenericResponse>("/api/auth/verify-email", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

