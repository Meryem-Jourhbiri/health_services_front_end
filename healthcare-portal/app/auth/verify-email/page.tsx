"use client";

import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Input } from "@heroui/input";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import AuthPageSkeleton from "@/components/auth/AuthPageSkeleton";

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

function VerifyEmailForm() {
  const searchParams = useSearchParams();
  const initialStatus = (searchParams.get("status") as Status) ?? "pending";
  const presetToken = searchParams.get("token") ?? "";
  const email = searchParams.get("email");
  const { verifyEmail, isSubmitting } = useAuth();
  const [code, setCode] = useState(presetToken);
  const [status, setStatus] = useState<Status>(initialStatus);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setCode(presetToken);
  }, [presetToken]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);
    setError(null);

    const trimmedCode = code.trim();
    if (!trimmedCode) {
      setError("Enter the verification code from your email.");
      return;
    }

    try {
      await verifyEmail(trimmedCode);
      setStatus("success");
      setMessage("Email verified. You may now log in.");
    } catch (err) {
      setStatus("pending");
      setError(err instanceof Error ? err.message : "Unable to verify email.");
    }
  };

  const config = STATUS_CONFIG[status];

  return (
    <div className="theme-public flex min-h-screen items-center justify-center bg-gradient-to-b from-background/80 to-background px-4 py-10">
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
          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
              label="Verification code"
              placeholder="Paste the code from your email"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              variant="bordered"
              autoComplete="one-time-code"
            />
            {status === "pending" ? (
              <div className="text-sm text-default-500">
                <p className="font-semibold text-default-600">
                  How to verify
                </p>
                <ul className="mt-2 space-y-1 text-left">
                  <li>- Copy the code in your verification email</li>
                  <li>- Paste it above and submit</li>
                  <li>- Request a fresh link from the login page if expired</li>
                </ul>
              </div>
            ) : null}
            <Button
              type="submit"
              color="primary"
              radius="full"
              className="w-full"
              isLoading={isSubmitting}
            >
              Verify email
            </Button>
          </form>
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
              href={
                email
                  ? `/auth/login?email=${encodeURIComponent(email)}`
                  : "/auth/login"
              }
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

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={<AuthPageSkeleton />}
    >
      <VerifyEmailForm />
    </Suspense>
  );
}
