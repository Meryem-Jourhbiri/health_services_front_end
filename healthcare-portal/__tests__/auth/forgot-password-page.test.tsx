
import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

jest.mock("@/lib/auth/auth-context", () => ({
  __esModule: true,
  useAuth: () => ({
    requestPasswordReset: jest.fn(),
    isSubmitting: false,
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

import ForgotPasswordPage from "@/app/forgot-password/page";

describe("ForgotPasswordPage", () => {
  it("renders email input, submit button and back-to-login link", () => {
    render(<ForgotPasswordPage />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /send reset link/i })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("link", { name: /back to login/i })
    ).toBeInTheDocument();
  });
});
