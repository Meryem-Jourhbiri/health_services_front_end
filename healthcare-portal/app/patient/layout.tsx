"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DashboardNavbar } from "@/components/navigation/DashboardNavbar";
import { useAuth } from "@/lib/auth/auth-context";
import { getPatientProfile } from "@/lib/profile/patient-api";

type PatientLayoutProps = {
  children: ReactNode;
};

export default function PatientLayout({ children }: PatientLayoutProps) {
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
        const profile = await getPatientProfile(token);
        if (!alive) return;
        setAvatarSrc(profile.profilePhotoBase64 ?? null);
        console.log("Loaded patient avatar", profile.profilePhotoBase64);
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
    <ProtectedRoute allowRoles={["patient"]} unauthenticatedRedirect="/">
      <div className="flex min-h-screen flex-col bg-background">
        <DashboardNavbar
          title="Patient Portal"
          onLogout={handleLogout}
          avatarLabel={user?.name || "Patient"}
          avatarSrc={avatarSrc}
          userName={user?.name || "Patient"}
          links={[
            { href: "/patient", label: "Home" },
            { href: "/patient/appointments", label: "Appointments" },
            { href: "/patient/doctors", label: "Find a Doctor" },
            { href: "/patient/profile", label: "Profile" },
          ]}
        />
        <main className="flex-1">{children}</main>
      </div>
    </ProtectedRoute>
  );
}
