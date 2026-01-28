"use client";

import { useRouter } from "next/navigation";
import { type ReactNode } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DashboardNavbar } from "@/components/navigation/DashboardNavbar";
import { useAuth } from "@/lib/auth/auth-context";

type AdminLayoutProps = {
  children: ReactNode;
};

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.replace("/");
  };

  return (
    <ProtectedRoute allowRoles={["ADMIN"]} unauthenticatedRedirect="/">
      <div className="theme-admin flex min-h-screen flex-col bg-background">
        <DashboardNavbar
          title="Admin Console"
          onLogout={handleLogout}
          avatarLabel={user?.name || "Admin"}
          userName={user?.name || user?.email || "Admin"}
          links={[
            { href: "/admin", label: "Dashboard" },
            { href: "/admin/users", label: "Users" },
            { href: "/admin/doctors", label: "Doctor Approvals" },
            { href: "/admin/audit-logs", label: "Audit Logs" },
          ]}
        />
        <main className="flex-1">{children}</main>
      </div>
    </ProtectedRoute>
  );
}
