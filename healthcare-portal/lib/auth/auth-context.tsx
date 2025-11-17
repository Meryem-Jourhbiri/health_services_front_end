"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  ApiError,
  login as loginRequest,
  register as registerRequest,
  requestPasswordReset as requestPasswordResetRequest,
  resetPassword as resetPasswordRequest,
  verifyEmail as verifyEmailRequest,
} from "./api";
import type {
  AuthUser,
  ForgotPasswordPayload,
  LoginPayload,
  RegisterPayload,
  ResetPasswordPayload,
  UserRole,
} from "./types";

type AuthState = {
  token: string | null;
  user: AuthUser | null;
};

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isHydrating: boolean;
  isSubmitting: boolean;
  verificationEmail: string | null;
  login: (payload: LoginPayload) => Promise<AuthUser>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
  requestPasswordReset: (payload: ForgotPasswordPayload) => Promise<void>;
  resetPassword: (payload: ResetPasswordPayload) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  setVerificationEmail: (email: string | null) => void;
};

const STORAGE_KEY = "health-services-auth";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const readStoredAuth = (): AuthState | null => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AuthState) : null;
  } catch {
    return null;
  }
};

const persistAuth = (state: AuthState | null) => {
  if (typeof window === "undefined") {
    return;
  }

  if (!state) {
    window.localStorage.removeItem(STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState | null>(null);
  const [isHydrating, setIsHydrating] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState<string | null>(
    null,
  );

  useEffect(() => {
    setIsHydrating(true);
    const stored = readStoredAuth();
    setState(stored);
    setIsHydrating(false);
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    setIsSubmitting(true);
    try {
      const response = await loginRequest(payload);
      setState(response);
      persistAuth(response);
      return response.user;
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : "Unable to log in. Please try again.";
      throw new Error(message);
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    setIsSubmitting(true);
    try {
      await registerRequest(payload);
      setVerificationEmail(payload.email);
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : "Unable to create the account. Please try again.";
      throw new Error(message);
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const logout = useCallback(() => {
    setState(null);
    persistAuth(null);
  }, []);

  const requestPasswordReset = useCallback(
    async (payload: ForgotPasswordPayload) => {
      setIsSubmitting(true);
      try {
        await requestPasswordResetRequest(payload);
      } catch (error) {
        const message =
          error instanceof ApiError
            ? error.message
            : "Unable to request password reset.";
        throw new Error(message);
      } finally {
        setIsSubmitting(false);
      }
    },
    [],
  );

  const resetPassword = useCallback(async (payload: ResetPasswordPayload) => {
    setIsSubmitting(true);
    try {
      await resetPasswordRequest(payload);
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : "Unable to reset password at this time.";
      throw new Error(message);
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const verifyEmail = useCallback(async (token: string) => {
    setIsSubmitting(true);
    try {
      await verifyEmailRequest({ token });
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : "Unable to verify email at this time.";
      throw new Error(message);
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const value = useMemo<AuthContextValue>(() => {
    const user = state?.user ?? null;
    const token = state?.token ?? null;
    const role = user?.role ?? null;

    return {
      user,
      token,
      role,
      verificationEmail,
      isAuthenticated: Boolean(user && token),
      isHydrating,
      isSubmitting,
      login,
      register,
      logout,
      requestPasswordReset,
      resetPassword,
      verifyEmail,
      setVerificationEmail,
    };
  }, [
    state,
    verificationEmail,
    isHydrating,
    isSubmitting,
    login,
    register,
    logout,
    requestPasswordReset,
    resetPassword,
    verifyEmail,
  ]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
