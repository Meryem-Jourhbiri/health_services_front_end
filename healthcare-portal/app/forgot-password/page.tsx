"use client";

import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Input } from "@heroui/input";
import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/lib/auth/auth-context";

export default function ForgotPasswordPage() {
  const { requestPasswordReset, isSubmitting } = useAuth();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setStatus(null);

    try {
      const response = await requestPasswordReset({ email: email.trim() });
      setStatus(response.message);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to start the reset flow right now.",
      );
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background/80 to-background px-4 py-10">
      <Card className="w-full max-w-md border border-default-100 bg-content1/80 backdrop-blur">
        <CardHeader className="flex flex-col items-start gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-default-500">
            Account recovery
          </p>
          <div>
            <h1 className="text-2xl font-semibold">Forgot your password?</h1>
            <p className="text-sm text-default-500">
              Enter your email to get a secure reset link.
            </p>
          </div>
        </CardHeader>
        <CardBody>
          <form className="space-y-5" onSubmit={handleSubmit}>
            <Input
              label="Email"
              name="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              variant="bordered"
              required
            />
            {status ? (
              <Input
                label="Verification code"
                placeholder="Paste the code from your email"
                value={code}
                onChange={(event) => setCode(event.target.value)}
                variant="bordered"
                autoComplete="one-time-code"
              />
            ) : null}
            {error ? (
              <p className="rounded-medium bg-danger-100/60 px-3 py-2 text-sm text-danger">
                {error}
              </p>
            ) : null}
            {status ? (
              <p className="rounded-medium bg-success-100/70 px-3 py-2 text-sm text-success-600">
                {status}
              </p>
            ) : null}
            <Button
              type="submit"
              className="w-full"
              radius="full"
              color="primary"
              isLoading={isSubmitting}
              isDisabled={Boolean(status)}
            >
              Send reset link
            </Button>
          </form>
          {status ? (
            <Button
              as={Link}
              href={`/reset-password${
                code.trim()
                  ? `?token=${encodeURIComponent(code.trim())}`
                  : ""
              }`}
              className="mt-4 w-full"
              radius="full"
              color="primary"
            >
              Continue to reset password
            </Button>
          ) : null}
          <p className="mt-6 text-center text-sm text-default-500">
            Remembered it?{" "}
            <Link href="/login" className="font-semibold text-primary">
              Back to login
            </Link>
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
