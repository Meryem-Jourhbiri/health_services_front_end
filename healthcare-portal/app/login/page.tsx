"use client";

import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Input } from "@heroui/input";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth/auth-context";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("next");
  const presetEmail = searchParams.get("email") ?? "";
  const presetPassword = searchParams.get("password") ?? "";
  const { login, isSubmitting } = useAuth();
  const [formValues, setFormValues] = useState({
    email: presetEmail,
    password: presetPassword,
  });
  const [error, setError] = useState<string | null>(null);

  const presetDeps = useMemo(
    () => ({ email: presetEmail, password: presetPassword }),
    [presetEmail, presetPassword],
  );

  useEffect(() => {
    setFormValues(presetDeps);
  }, [presetDeps]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormValues((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    try {
      const user = await login(formValues);
      const fallback = user.role === "doctor" ? "/doctor" : "/patient";
      router.replace(redirectPath || fallback);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to log in.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background/80 to-background px-4 py-10">
      <Card className="w-full max-w-md border border-default-100 bg-content1/80 backdrop-blur">
        <CardHeader className="flex flex-col items-start gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-primary">
            Unified access
          </p>
          <div>
            <h1 className="text-2xl font-semibold">Log in to Health Portal</h1>
            <p className="text-sm text-default-500">
              Doctors and patients share the same authentication flow.
            </p>
          </div>
        </CardHeader>
        <CardBody>
          <form className="space-y-5" onSubmit={handleSubmit}>
            <Input
              label="Email"
              name="email"
              type="email"
              value={formValues.email}
              onChange={handleChange}
              variant="bordered"
              required
              autoComplete="email"
            />
            <Input
              label="Password"
              name="password"
              type="password"
              value={formValues.password}
              onChange={handleChange}
              variant="bordered"
              required
              autoComplete="current-password"
              endContent={
                <Link
                  href="/forgot-password"
                  className="text-xs font-semibold text-primary"
                >
                  Forgot?
                </Link>
              }
            />
            {error ? (
              <p className="rounded-medium bg-danger-100/60 px-3 py-2 text-sm text-danger">
                {error}
              </p>
            ) : null}
            <Button
              type="submit"
              color="primary"
              radius="full"
              className="w-full"
              isLoading={isSubmitting}
            >
              Continue
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-default-500">
            Patient without an account?{" "}
            <Link href="/signup" className="font-semibold text-primary">
              Create one now
            </Link>
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
