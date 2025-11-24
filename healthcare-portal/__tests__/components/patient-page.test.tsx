import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

jest.mock("@/lib/auth/auth-context", () => ({
  __esModule: true,
  useAuth: () => ({
    user: { id: "1", name: "Test Patient", role: "patient" },
    role: "patient",
    isAuthenticated: true,
    isHydrating: false,
    login: jest.fn(),
    logout: jest.fn(),
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

import PatientDashboardPage from "@/app/patient/page";

describe("PatientPage", () => {
  it("shows next appointment section", () => {
    render(<PatientDashboardPage />);
    expect(screen.getByText(/your next appointment/i)).toBeInTheDocument();
  });

  it("shows quick actions section", () => {
    render(<PatientDashboardPage />);
    expect(screen.getByText(/quick actions/i)).toBeInTheDocument();
  });
  it("matches snapshot", () => {
    const view = render(<PatientDashboardPage />);
    expect(view.container).toMatchSnapshot();
  });
});



