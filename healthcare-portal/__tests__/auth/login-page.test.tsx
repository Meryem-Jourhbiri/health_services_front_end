import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

jest.mock("@/lib/auth/auth-context", () => ({
  __esModule: true,
  useAuth: () => ({
    login: jest.fn(),
    isSubmitting: false,
    user: null,
    role: null,
    isAuthenticated: false,
    isHydrating: false,
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

import LoginPage from "@/app/login/page";

describe("LoginPage", () => {
  it("renders email and password fields and a submit button", () => {
    render(<LoginPage />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();

    const submitButton = screen.getByRole("button", { name: /continue/i });
    expect(submitButton).toBeInTheDocument();
  });
});




