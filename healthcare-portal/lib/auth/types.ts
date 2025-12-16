export type UserRole = "patient" | "doctor" | "admin";

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
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  gender: string;
  dob: string; // YYYY-MM-DD
  role: UserRole;
  // Doctor-specific fields (optional for now)
  licenseNumber?: string;
  specialization?: string;
  experience?: number;
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
