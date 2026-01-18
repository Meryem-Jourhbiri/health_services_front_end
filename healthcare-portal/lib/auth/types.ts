import type { LoginRequest, RegisterRequest, UserRole } from "@/lib/types";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  emailVerified: boolean;
};

export type LoginPayload = LoginRequest;

export type RegisterPayload = RegisterRequest;

export type ForgotPasswordPayload = {
  email: string;
};

export type ResetPasswordPayload = {
  token: string;
  password: string;
};

export type VerifyEmailPayload = {
  token: string;
};

export type LoginResponse = {
  token: string;
  user: AuthUser;
};

export type GenericResponse = {
  message: string;
};
