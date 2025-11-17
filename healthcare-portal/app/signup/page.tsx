"use client";

import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Input } from "@heroui/input";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/lib/auth/auth-context";

export default function SignUpPage() {
  const router = useRouter();
  const { register, isSubmitting, setVerificationEmail } = useAuth();
  const [formValues, setFormValues] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormValues((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    try {
      await register(formValues);
      setVerificationEmail(formValues.email);
      router.push(`/verify-email?status=pending&email=${formValues.email}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to create the account.",
      );
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background/80 to-background px-4 py-10">
      <Card className="w-full max-w-md border border-default-100 bg-content1/80 backdrop-blur">
        <CardHeader className="flex flex-col items-start gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-success-500">
            Patient access
          </p>
          <div>
            <h1 className="text-2xl font-semibold">Create your account</h1>
            <p className="text-sm text-default-500">
              Patients sign up here. Doctors get access via their invitations.
            </p>
          </div>
        </CardHeader>
        <CardBody>
          <form className="space-y-5" onSubmit={handleSubmit}>
            <Input
              label="Full name"
              name="name"
              value={formValues.name}
              onChange={handleChange}
              variant="bordered"
              required
            />
            <Input
              label="Email"
              name="email"
              type="email"
              value={formValues.email}
              onChange={handleChange}
              variant="bordered"
              required
            />
            <div className="space-y-2">
              <Input
                label="Password"
                name="password"
                type="password"
                value={formValues.password}
                onChange={handleChange}
                variant="bordered"
                required
                minLength={8}
              />
              <p className="text-xs text-default-500">
                Use at least 8 characters with a mix of letters and numbers.
              </p>
            </div>
            {error ? (
              <p className="rounded-medium bg-danger-100/60 px-3 py-2 text-sm text-danger">
                {error}
              </p>
            ) : null}
            <Button
              type="submit"
              className="w-full"
              radius="full"
              color="success"
              isLoading={isSubmitting}
            >
              Create account
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-default-500">
            Already registered?{" "}
            <Link href="/login" className="font-semibold text-primary">
              Log in
            </Link>
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
