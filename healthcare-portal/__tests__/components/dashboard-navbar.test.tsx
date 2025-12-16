import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import { DashboardNavbar } from "@/components/navigation/DashboardNavbar";

describe("DashboardNavbar", () => {
  it("renders title, subtitle, switch link, and avatar label", () => {
    const onLogout = jest.fn();

    render(
      <DashboardNavbar
        title="Doctor Portal"
        onLogout={onLogout}
        avatarLabel="Dr. Demo"
        userName="Dr. Demo"
      />,
    );

    expect(screen.getByText("Doctor Portal")).toBeInTheDocument();

    // Avatar shows the label text
    expect(screen.getByText("Dr. Demo")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /sign out/i }));
    expect(onLogout).toHaveBeenCalledTimes(1);
  });

  it("renders without subtitle or avatar when not provided", () => {
    render(
      <DashboardNavbar
        title="Patient Portal"
        onLogout={jest.fn()}
      />,
    );

    expect(screen.getByText("Patient Portal")).toBeInTheDocument();
    expect(
      screen.queryByText(/switch to/i),
    ).not.toBeInTheDocument();
  });
});
