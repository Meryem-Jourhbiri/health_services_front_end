export type UserRole = "patient" | "doctor";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  emailVerified: boolean;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
};

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
