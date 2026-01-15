"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DashboardNavbar } from "@/components/navigation/DashboardNavbar";
import { useAuth } from "@/lib/auth/auth-context";
import { getDoctorProfile } from "@/lib/profile/doctor-api";

type DoctorLayoutProps = {
  children: ReactNode;
};

export default function DoctorLayout({ children }: DoctorLayoutProps) {
  const { user, token, isHydrating, logout } = useAuth();
  const router = useRouter();
  const [avatarSrc, setAvatarSrc] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    async function loadAvatar() {
      if (isHydrating) return;
      if (!token) {
        setAvatarSrc(null);
        return;
      }

      try {
        const profile = await getDoctorProfile(token);
        if (!alive) return;
        setAvatarSrc(profile.profilePhotoBase64 ?? null);
      } catch {
        if (!alive) return;
        setAvatarSrc(null);
      }
    }

    loadAvatar();
    return () => {
      alive = false;
    };
  }, [token, isHydrating]);

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
          avatarSrc={avatarSrc}
          userName={user?.name || "Doctor"}
          links={[
            { href: "/doctor", label: "Home" },
            { href: "/doctor/appointments", label: "Appointments" },
            { href: "/doctor/availability", label: "Availability" },
            { href: "/doctor/profile", label: "Profile" },
          ]}
        />
        <main className="flex-1">{children}</main>
      </div>
    </ProtectedRoute>
  );
}
