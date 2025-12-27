
import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";

const verifyEmailMock = jest.fn();

jest.mock("next/navigation", () => ({
  __esModule: true,
  useRouter: () => ({
    replace: jest.fn(),
  }),
  useSearchParams: () => ({
    get: (key: string) => {
      if (key === "status") return "pending";
      if (key === "email") return "patient@example.com";
      if (key === "token") return null;
      return null;
    },
  }),
}));

jest.mock("@/lib/auth/auth-context", () => ({
  __esModule: true,
  useAuth: () => ({
    verifyEmail: verifyEmailMock,
    isSubmitting: false,
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

import VerifyEmailPage from "@/app/verify-email/page";

describe("VerifyEmailPage", () => {
  beforeEach(() => {
    verifyEmailMock.mockReset();
  });

  it("renders verification code input, email, and actions", () => {
    render(<VerifyEmailPage />);

    expect(screen.getByText(/verify your email to continue/i)).toBeInTheDocument();
    expect(screen.getByText("patient@example.com")).toBeInTheDocument();

    expect(screen.getByLabelText(/verification code/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /verify email/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /back to login/i })).toBeInTheDocument();
  });

  it("submits the pasted code for verification and shows success feedback", async () => {
    verifyEmailMock.mockResolvedValueOnce({});
    render(<VerifyEmailPage />);

    fireEvent.change(screen.getByLabelText(/verification code/i), {
      target: { value: "123456" },
    });
    fireEvent.click(screen.getByRole("button", { name: /verify email/i }));

    await waitFor(() =>
      expect(verifyEmailMock).toHaveBeenCalledWith("123456"),
    );
    expect(
      screen.getByText(/email verified\. you may now log in\./i),
    ).toBeInTheDocument();
  });
});
