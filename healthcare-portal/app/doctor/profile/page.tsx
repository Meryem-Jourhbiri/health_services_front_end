"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Input } from "@heroui/input";
import { useAuth } from "@/lib/auth/auth-context";
import {
  getDoctorProfile,
  updateDoctorProfile,
  type DoctorProfile,
} from "@/lib/profile/doctor-api";
import { ApiError } from "@/lib/auth/api";

export default function DoctorProfilePage() {
  const { token, isHydrating } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [serverProfile, setServerProfile] = useState<DoctorProfile | null>(null);
  const [form, setForm] = useState<DoctorProfile | null>(null);
  const [languagesText, setLanguagesText] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    async function load() {
      if (isHydrating) return;

      if (!token) {
        setLoading(false);
        setError("Not authenticated. Please log in again.");
        return;
      }

      setLoading(true);
      setError(null);
      setSuccess(null);

      try {
        const data = await getDoctorProfile(token);
        if (!alive) return;

        setServerProfile(data);
        setForm(data);
        setLanguagesText((data.languages ?? []).join(", "));
      } catch (e) {
        if (!alive) return;
        const message =
          e instanceof ApiError ? e.message : "Failed to load profile.";
        setError(message);
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, [token, isHydrating]);

  const isDirty = useMemo(() => {
    if (!serverProfile || !form) return false;

    const serverLanguages = (serverProfile.languages ?? []).join(", ");

    return (
      serverProfile.firstName !== form.firstName ||
      serverProfile.lastName !== form.lastName ||
      serverProfile.phone !== form.phone ||
      serverProfile.gender !== form.gender ||
      serverProfile.licenseNumber !== form.licenseNumber ||
      serverProfile.specialization !== form.specialization ||
      serverProfile.experience !== form.experience ||
      serverProfile.education !== form.education ||
      serverProfile.bio !== form.bio ||
      serverProfile.clinicAddress !== form.clinicAddress ||
      serverLanguages !== languagesText
    );
  }, [serverProfile, form, languagesText]);

  const validationError = useMemo(() => {
    if (!form) return null;
    if (!form.firstName.trim()) return "First name is required.";
    if (!form.lastName.trim()) return "Last name is required.";
    if (!form.licenseNumber.trim()) return "License number is required.";
    if (!form.specialization.trim()) return "Specialization is required.";
    return null;
  }, [form]);

  function setField<K extends keyof DoctorProfile>(
    key: K,
    value: DoctorProfile[K],
  ) {
    setError(null);
    setSuccess(null);
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  function onCancel() {
    if (!serverProfile) return;
    setError(null);
    setSuccess(null);
    setForm(serverProfile);
    setLanguagesText((serverProfile.languages ?? []).join(", "));
    setIsEditing(false);
  }

  async function onSave() {
    if (!form) return;
    if (validationError) return;

    const languages = languagesText
      .split(",")
      .map((l) => l.trim())
      .filter(Boolean);

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const saved = await updateDoctorProfile(token, {
        ...form,
        languages,
      });
      setServerProfile(saved);
      setForm(saved);
      setLanguagesText((saved.languages ?? []).join(", "));
      setSuccess("Profile saved");
      setIsEditing(false);
      setTimeout(() => setSuccess(null), 2000);
    } catch (e) {
      const message =
        e instanceof ApiError ? e.message : "Failed to save profile.";
      setError(message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Card>
        <CardHeader className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Doctor Profile</h1>
            <p className="text-sm text-default-500">
              Review your professional details and practice information.
            </p>
          </div>

          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button
                  variant="flat"
                  onPress={onCancel}
                  isDisabled={saving || loading}
                >
                  Cancel
                </Button>
                <Button
                  color="primary"
                  onPress={onSave}
                  isLoading={saving}
                  isDisabled={
                    loading || saving || !isDirty || Boolean(validationError)
                  }
                >
                  Save
                </Button>
              </>
            ) : (
              <Button
                color="primary"
                onPress={() => setIsEditing(true)}
                isDisabled={loading || !form}
              >
                Edit profile
              </Button>
            )}
          </div>
        </CardHeader>

        <CardBody className="space-y-4">
          {loading && (
            <p className="text-sm text-default-500">Loading profile...</p>
          )}

          {!loading && error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm">
              {error}
            </div>
          )}

          {!loading && success && (
            <div className="flex items-center gap-2 rounded-xl bg-success text-success-foreground px-4 py-3 text-sm shadow-lg">
              <span className="text-lg">✅</span>
              <span className="font-medium">{success}</span>
            </div>
          )}

          {!loading && validationError && (
            <div className="text-sm text-red-600">{validationError}</div>
          )}

          {!loading && !isEditing && form && (
            <div className="space-y-4 text-sm">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-xs uppercase tracking-wide text-default-500">
                    First name
                  </p>
                  <p className="font-medium">{form.firstName}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-default-500">
                    Last name
                  </p>
                  <p className="font-medium">{form.lastName}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-default-500">
                    Phone
                  </p>
                  <p className="font-medium">{form.phone || "—"}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-default-500">
                    Gender
                  </p>
                  <p className="font-medium">{form.gender || "—"}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-default-500">
                    License number
                  </p>
                  <p className="font-medium">{form.licenseNumber}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-default-500">
                    Specialization
                  </p>
                  <p className="font-medium">{form.specialization}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-default-500">
                    Experience (years)
                  </p>
                  <p className="font-medium">{form.experience}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-default-500">
                    Education
                  </p>
                  <p className="font-medium">{form.education || "—"}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-xs uppercase tracking-wide text-default-500">
                    Clinic address
                  </p>
                  <p className="font-medium">{form.clinicAddress || "—"}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-xs uppercase tracking-wide text-default-500">
                    Languages
                  </p>
                  <p className="font-medium">
                    {form.languages.length ? form.languages.join(", ") : "—"}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-default-500">
                  Bio
                </p>
                <p className="mt-2 text-sm">{form.bio || "—"}</p>
              </div>
            </div>
          )}

          {!loading && isEditing && form && (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  label="First name"
                  value={form.firstName}
                  onValueChange={(v) => setField("firstName", v)}
                  isRequired
                />
                <Input
                  label="Last name"
                  value={form.lastName}
                  onValueChange={(v) => setField("lastName", v)}
                  isRequired
                />
                <Input
                  label="Phone"
                  value={form.phone}
                  onValueChange={(v) => setField("phone", v)}
                />
                <Input
                  label="Gender"
                  value={form.gender}
                  onValueChange={(v) => setField("gender", v)}
                />
                <Input
                  label="License number"
                  value={form.licenseNumber}
                  onValueChange={(v) => setField("licenseNumber", v)}
                  isRequired
                />
                <Input
                  label="Specialization"
                  value={form.specialization}
                  onValueChange={(v) => setField("specialization", v)}
                  isRequired
                />
                <Input
                  label="Experience (years)"
                  type="number"
                  value={String(form.experience)}
                  onValueChange={(v) =>
                    setField("experience", Number(v) || 0)
                  }
                  min={0}
                />
                <Input
                  label="Education"
                  value={form.education}
                  onValueChange={(v) => setField("education", v)}
                />
                <Input
                  className="md:col-span-2"
                  label="Clinic address"
                  value={form.clinicAddress}
                  onValueChange={(v) => setField("clinicAddress", v)}
                />
                <Input
                  className="md:col-span-2"
                  label="Languages (comma-separated)"
                  value={languagesText}
                  onValueChange={setLanguagesText}
                />
              </div>

              <div>
                <label className="text-sm text-default-500">Bio</label>
                <textarea
                  className="mt-2 w-full rounded-xl border border-default-100 bg-content1/70 p-3 text-sm"
                  rows={5}
                  value={form.bio}
                  onChange={(e) => setField("bio", e.target.value)}
                />
              </div>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
