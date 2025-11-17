"use client";

import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/auth-context";

type Status = "pending" | "success" | "expired";

const STATUS_CONFIG: Record<
  Status,
  { badge: string; title: string; description: string; accent: string }
> = {
  pending: {
    badge: "Check your inbox",
    title: "Verify your email to continue",
    description:
      "We just sent a link. Open it on this device to activate your account.",
    accent: "text-warning",
  },
  success: {
    badge: "Verified",
    title: "Email confirmed",
    description: "Your account is ready. You may now log in.",
    accent: "text-success",
  },
  expired: {
    badge: "Link expired",
    title: "Verification link expired",
    description: "Request a new link from the login page to continue.",
    accent: "text-danger",
  },
};

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const status = (searchParams.get("status") as Status) ?? "pending";
  const token = searchParams.get("token");
  const email = searchParams.get("email");
  const { verifyEmail, isSubmitting } = useAuth();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status !== "success" || !token) {
      return;
    }

    const verify = async () => {
      try {
        await verifyEmail(token);
        setMessage("Email verified. Redirecting to login...");
        setTimeout(() => router.replace("/login"), 1500);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Unable to verify email.",
        );
      }
    };

    verify();
  }, [router, status, token, verifyEmail]);

  const config = STATUS_CONFIG[status];

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background/80 to-background px-4 py-10">
      <Card className="w-full max-w-md border border-default-100 bg-content1/80 backdrop-blur text-center">
        <CardHeader className="flex flex-col items-center gap-3">
          <p
            className={`text-xs font-semibold uppercase tracking-[0.4em] ${config.accent}`}
          >
            {config.badge}
          </p>
          <div>
            <h1 className="text-2xl font-semibold">{config.title}</h1>
            <p className="text-sm text-default-500">{config.description}</p>
          </div>
        </CardHeader>
        <CardBody className="space-y-6">
          {email ? (
            <p className="rounded-large border border-default-100 px-4 py-3 text-sm font-medium text-default-600">
              {email}
            </p>
          ) : null}
          {status === "pending" ? (
            <div className="text-sm text-default-500">
              <p className="font-semibold text-default-600">Troubleshooting</p>
              <ul className="mt-2 space-y-1 text-left">
                <li>- Check your spam folder</li>
                <li>- Confirm the email is typed correctly</li>
                <li>- Request a fresh link from the login page</li>
              </ul>
            </div>
          ) : null}
          {message ? (
            <p className="rounded-medium bg-success-100/70 px-4 py-2 text-sm text-success-600">
              {message}
            </p>
          ) : null}
          {error ? (
            <p className="rounded-medium bg-danger-100/60 px-4 py-2 text-sm text-danger">
              {error}
            </p>
          ) : null}
          <div className="space-y-3">
            <Button
              as={Link}
              href="/login"
              color="primary"
              radius="full"
              className="w-full"
              isLoading={status === "success" && isSubmitting}
            >
              Back to login
            </Button>
            <Link href="/" className="text-sm font-semibold text-default-500">
              Return home
            </Link>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
