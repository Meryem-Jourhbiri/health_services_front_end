
import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

jest.mock("next/navigation", () => ({
  __esModule: true,
  useRouter: () => ({
    replace: jest.fn(),
  }),
  useSearchParams: () => ({
    get: (key: string) => {
      if (key === "status") return "pending"; 
      if (key === "email") return "patient@example.com";
      return null; 
    },
  }),
}));

jest.mock("@/lib/auth/auth-context", () => ({
  __esModule: true,
  useAuth: () => ({
    verifyEmail: jest.fn(),
    isSubmitting: false,
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

import VerifyEmailPage from "@/app/verify-email/page";

describe("VerifyEmailPage", () => {
  it("renders pending verification state with email and back-to-login button", () => {
    render(<VerifyEmailPage />);

    expect(
      screen.getByText(/verify your email to continue/i)
    ).toBeInTheDocument();

    expect(screen.getByText("patient@example.com")).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /back to login/i })
    ).toBeInTheDocument();
  });
});
