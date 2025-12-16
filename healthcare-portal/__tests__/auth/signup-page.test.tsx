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
  it("renders required patient fields and a submit button", () => {
    render(<SignupPage />);

    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/phone/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/gender/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/date of birth/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();

    const submitButton = screen.getByRole("button", { name: /create account/i });
    expect(submitButton).toBeInTheDocument();
  });
});


