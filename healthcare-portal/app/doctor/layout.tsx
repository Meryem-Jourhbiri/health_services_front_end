"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DashboardNavbar } from "@/components/navigation/DashboardNavbar";
import { useAuth } from "@/lib/auth/auth-context";

type DoctorLayoutProps = {
  children: ReactNode;
};

export default function DoctorLayout({ children }: DoctorLayoutProps) {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.replace("/");
  };

  return (
    <ProtectedRoute allowRoles={["doctor"]} unauthenticatedRedirect="/">
      <div className="flex min-h-screen flex-col bg-background">
        <DashboardNavbar
          title="Doctor Portal"
          onLogout={handleLogout}
          avatarLabel={user?.name || "Doctor"}
          userName={user?.name || "Doctor"}
          links={[
            { href: "/", label: "Home" },
            { href: "/doctor", label: "Dashboard" },
            { href: "/doctor/availability", label: "Availability" },
            { href: "/doctor/profile", label: "Profile" },
          ]}
        />
        <main className="flex-1">{children}</main>
      </div>
    </ProtectedRoute>
  );
}
