"use client";

import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Input } from "@heroui/input";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/auth-context";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const presetToken = searchParams.get("token") ?? "";
  const { resetPassword, isSubmitting } = useAuth();

  const [code, setCode] = useState(presetToken);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setCode(presetToken);
  }, [presetToken]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus(null);
    setError(null);

    const trimmedCode = code.trim();
    if (!trimmedCode) {
      setError("Enter the verification code from your email.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const response = await resetPassword({ token: trimmedCode, password });
      setStatus(response.message);
      setTimeout(() => router.replace("/login"), 1500);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to reset password.",
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
            <h1 className="text-2xl font-semibold">Choose a new password</h1>
            <p className="text-sm text-default-500">
              Enter a strong password to finish the reset process.
            </p>
          </div>
        </CardHeader>
        <CardBody>
          <form className="space-y-5" onSubmit={handleSubmit}>
            <Input
              label="Verification code"
              placeholder="Paste the code from your email"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              variant="bordered"
              autoComplete="one-time-code"
              required
            />
            <Input
              label="New password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              variant="bordered"
              required
              minLength={8}
            />
            <Input
              label="Confirm password"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              variant="bordered"
              required
              minLength={8}
            />
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
            >
              Reset password
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-default-500">
            Done here?{" "}
            <Link href="/login" className="font-semibold text-primary">
              Back to login
            </Link>
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
