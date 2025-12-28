"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DashboardNavbar } from "@/components/navigation/DashboardNavbar";
import { useAuth } from "@/lib/auth/auth-context";

type PatientLayoutProps = {
  children: ReactNode;
};

export default function PatientLayout({ children }: PatientLayoutProps) {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.replace("/");
  };

  return (
    <ProtectedRoute allowRoles={["patient"]} unauthenticatedRedirect="/">
      <div className="flex min-h-screen flex-col bg-background">
        <DashboardNavbar
          title="Patient Portal"
          onLogout={handleLogout}
          avatarLabel={user?.name || "Patient"}
          userName={user?.name || "Patient"}
          links={[
            { href: "/", label: "Home" },
            { href: "/patient", label: "Dashboard" },
            { href: "/patient/profile", label: "Profile" },
          ]}
        />
        <main className="flex-1">{children}</main>
      </div>
    </ProtectedRoute>
  );
}
