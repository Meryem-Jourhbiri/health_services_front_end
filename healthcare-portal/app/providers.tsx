// app/providers.tsx
"use client";

import { HeroUIProvider } from "@heroui/react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { AuthProvider } from "@/lib/auth/auth-context";

type ProvidersProps = {
  children: ReactNode;
};

export function Providers({ children }: ProvidersProps) {
  const router = useRouter();

  return (
    <HeroUIProvider navigate={router.push}>
      <AuthProvider>{children}</AuthProvider>
    </HeroUIProvider>
  );
}
