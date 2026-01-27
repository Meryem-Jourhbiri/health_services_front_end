// app/auth/layout.tsx
import type { ReactNode } from "react";
import Link from "next/link";

type AuthLayoutProps = {
  children: ReactNode;
};

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="border-b border-default-100 bg-content1 px-6 py-4">
        <div className="mx-auto flex w-full max-w-6xl items-center">
          <Link href="/" className="text-sm font-semibold uppercase tracking-[0.3em] text-default-500">
            Healthcare Portal
          </Link>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
