import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

jest.mock("@/lib/auth/auth-context", () => ({
  __esModule: true,
  useAuth: () => ({
    register: jest.fn(),
    isSubmitting: false,
    setVerificationEmail: jest.fn(),
    user: null,
    role: null,
    isAuthenticated: false,
    isHydrating: false,
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

import SignupPage from "@/app/signup/page";

describe("SignupPage", () => {
  it("renders name, email, password fields and a submit button", () => {
    render(<SignupPage />);

    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();

    const submitButton = screen.getByRole("button", { name: /create account/i });
    expect(submitButton).toBeInTheDocument();
  });
});



