"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import type { UserRole } from "@/lib/types";

type ProtectedRouteProps = {
  allowRoles?: UserRole[];
  unauthenticatedRedirect?: string;
  children: React.ReactNode;
};

export function ProtectedRoute({
  allowRoles,
  unauthenticatedRedirect = "/auth/login",
  children,
}: ProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated, role, isHydrating } = useAuth();

  const isAllowed = useMemo(() => {
    if (!allowRoles || !allowRoles.length) {
      return true;
    }

    if (!role) {
      return false;
    }

    return allowRoles.includes(role);
  }, [allowRoles, role]);

  useEffect(() => {
    if (isHydrating) {
      return;
    }

    if (!isAuthenticated) {
      router.replace(unauthenticatedRedirect);
      return;
    }

    if (!isAllowed) {
      const fallback =
        role === "DOCTOR" ? "/doctor" : role === "PATIENT" ? "/patient" : "/";
      router.replace(fallback);
    }
  }, [isHydrating, isAuthenticated, isAllowed, router, role]);

  if (isHydrating) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-default-500">
        Checking your session...
      </div>
    );
  }

  if (!isAuthenticated || !isAllowed) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-default-500">
        Redirecting...
      </div>
    );
  }

  return <>{children}</>;
}
