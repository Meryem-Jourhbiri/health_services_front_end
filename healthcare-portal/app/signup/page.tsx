"use client";

import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Input } from "@heroui/input";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import type { RegisterPayload } from "@/lib/auth/types";
import type { UserRole } from "@/lib/types";

export default function SignUpPage() {
  const router = useRouter();
  const { register, isSubmitting, setVerificationEmail } = useAuth();
  const [formValues, setFormValues] = useState<RegisterPayload>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    gender: "",
    dob: "",
    role: "PATIENT",
    licenseNumber: "",
    specialization: "",
    experience: undefined,
  });
  const [error, setError] = useState<string | null>(null);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormValues((current) => ({ ...current, [name]: value }));
  };

  const handleRoleChange = (role: UserRole) => {
    setError(null);
    setFormValues((current) => ({
      ...current,
      role,
      // reset doctor fields when switching back to patient
      licenseNumber: role === "DOCTOR" ? current.licenseNumber : "",
      specialization: role === "DOCTOR" ? current.specialization : "",
      experience: role === "DOCTOR" ? current.experience : undefined,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const passwordValid =
      formValues.password.length >= 8 &&
      /[A-Z]/.test(formValues.password) &&
      /\d/.test(formValues.password);

    if (!passwordValid) {
      setError(
        "Password must be at least 8 characters, include an uppercase letter and a number.",
      );
      return;
    }

    if (
      formValues.role === "DOCTOR" &&
      (!formValues.licenseNumber || !formValues.specialization)
    ) {
      setError("License number and specialization are required for doctors.");
      return;
    }

    try {
      await register({ ...formValues, role: formValues.role });
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
            <div className="flex gap-3">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="role"
                  value="PATIENT"
                  checked={formValues.role === "PATIENT"}
                  onChange={() => handleRoleChange("PATIENT")}
                />
                Patient
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="role"
                  value="DOCTOR"
                  checked={formValues.role === "DOCTOR"}
                  onChange={() => handleRoleChange("DOCTOR")}
                />
                Doctor
              </label>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <Input
                label="First name"
                name="firstName"
                value={formValues.firstName}
                onChange={handleChange}
                variant="bordered"
                required
              />
              <Input
                label="Last name"
                name="lastName"
                value={formValues.lastName}
                onChange={handleChange}
                variant="bordered"
                required
              />
            </div>
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
              label="Phone"
              name="phone"
              type="tel"
              value={formValues.phone}
              onChange={handleChange}
              variant="bordered"
              required
              autoComplete="tel"
            />
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <label
                  htmlFor="gender"
                  className="text-sm font-medium text-default-600"
                >
                  Gender
                </label>
                <select
                  id="gender"
                  name="gender"
                  value={formValues.gender}
                  onChange={(e) =>
                    setFormValues((current) => ({
                      ...current,
                      gender: e.target.value,
                    }))
                  }
                  required
                  className="w-full rounded-large border border-default-200 bg-content1 px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                >
                  <option value="" disabled>
                    Select gender
                  </option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer_not_to_say">Prefer not to say</option>
                </select>
              </div>
              <Input
                label="Date of birth"
                name="dob"
                type="date"
                value={formValues.dob}
                onChange={handleChange}
                variant="bordered"
                required
              />
            </div>
            {formValues.role === "DOCTOR" ? (
              <div className="grid gap-3 md:grid-cols-2">
                <Input
                  label="License number"
                  name="licenseNumber"
                  value={formValues.licenseNumber}
                  onChange={handleChange}
                  variant="bordered"
                  required
                />
                <Input
                  label="Specialization"
                  name="specialization"
                  value={formValues.specialization}
                  onChange={handleChange}
                  variant="bordered"
                  required
                />
                <Input
                  label="Experience (years)"
                  name="experience"
                  type="number"
                  value={
                    formValues.experience !== undefined
                      ? String(formValues.experience)
                      : ""
                  }
                  onChange={(e) =>
                    setFormValues((current) => ({
                      ...current,
                      experience: e.target.value
                        ? Number(e.target.value)
                        : undefined,
                    }))
                  }
                  variant="bordered"
                  min={0}
                  className="md:col-span-2"
                />
              </div>
            ) : null}
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
                Use at least 8 characters with one uppercase letter and one number.
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
