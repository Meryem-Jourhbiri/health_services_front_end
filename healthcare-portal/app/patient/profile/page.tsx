"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Avatar } from "@heroui/avatar";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";

import { useAuth } from "@/lib/auth/auth-context";
import {
  getPatientProfile,
  updatePatientProfile,
} from "@/lib/profile/patient-api";
import { ApiError } from "@/lib/auth/api";
import type { PatientProfileDTO } from "@/lib/types";

export default function PatientProfilePage() {
  const { token, isHydrating } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [serverProfile, setServerProfile] = useState<PatientProfileDTO | null>(
    null,
  );
  const [form, setForm] = useState<PatientProfileDTO | null>(null);

  const [medicalHistoryText, setMedicalHistoryText] = useState<string>("{}");

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
        const data = await getPatientProfile(token);
        if (!alive) return;

        setServerProfile(data);
        setForm(data);
        setMedicalHistoryText(
          JSON.stringify(data.medicalHistory ?? {}, null, 2),
        );
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

    const serverMedicalText = JSON.stringify(
      serverProfile.medicalHistory ?? {},
      null,
      2,
    );

    return (
      serverProfile.firstName !== form.firstName ||
      serverProfile.lastName !== form.lastName ||
      serverProfile.dob !== form.dob ||
      serverProfile.phone !== form.phone ||
      serverProfile.address !== form.address ||
      serverProfile.gender !== form.gender ||
      serverProfile.insuranceInfo !== form.insuranceInfo ||
      serverMedicalText !== medicalHistoryText ||
      serverProfile.profilePhotoBase64 !== form.profilePhotoBase64
    );
  }, [serverProfile, form, medicalHistoryText]);

  const validationError = useMemo(() => {
    if (!form) return null;

    const firstName = (form.firstName ?? "").trim();
    const lastName = (form.lastName ?? "").trim();
    const dob = (form.dob ?? "").trim();

    if (!firstName) return "First name is required.";
    if (!lastName) return "Last name is required.";
    if (dob && !/^\d{4}-\d{2}-\d{2}$/.test(dob)) return "DOB must be YYYY-MM-DD.";

    return null;
  }, [form]);

  function setField<K extends keyof PatientProfileDTO>(
    key: K,
    value: PatientProfileDTO[K],
  ) {
    setError(null);
    setSuccess(null);
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  function onPhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const MAX_MB = 2;
    if (file.size > MAX_MB * 1024 * 1024) {
      setError("Image is too large. Max ${MAX_MB}MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setError(null);
      setSuccess(null);
      setForm((prev) =>
        prev ? { ...prev, profilePhotoBase64: base64 } : prev,
      );
    };
    reader.readAsDataURL(file);
  }

  function onCancel() {
    if (!serverProfile) return;
    setError(null);
    setSuccess(null);
    setForm(serverProfile);
    setMedicalHistoryText(
      JSON.stringify(serverProfile.medicalHistory ?? {}, null, 2),
    );
    setIsEditing(false);
  }

  async function onSave() {
    if (!form) return;
    if (validationError) return;

    let parsedMedicalHistory: Record<string, Record<string, unknown>> = {};
    try {
      parsedMedicalHistory = JSON.parse(medicalHistoryText || "{}") as Record<
        string,
        Record<string, unknown>
      >;
    } catch {
      setError("Medical history must be valid JSON.");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const saved = await updatePatientProfile(token, {
        ...form,
        medicalHistory: parsedMedicalHistory,
      });

      setServerProfile(saved);
      setForm(saved);
      setMedicalHistoryText(
        JSON.stringify(saved.medicalHistory ?? {}, null, 2),
      );
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
    <div className="p-6 max-w-3xl mx-auto">
      <Card>
        <CardHeader className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Patient Profile</h1>
            <p className="text-sm text-default-500">
              Edit your details and save changes.
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
              <div className="flex items-center gap-4">
                {form.profilePhotoBase64 ? (
                  <Avatar
                    src={form.profilePhotoBase64}
                    name={`${form.firstName} ${form.lastName}`}
                    className="h-20 w-20"
                    isBordered
                  />
                ) : (
                  <div className="h-20 w-20 rounded-full border flex items-center justify-center text-xs text-default-500">
                    No photo
                  </div>
                )}
                <div className="text-sm">
                  <p className="font-medium">
                    {form.firstName} {form.lastName}
                  </p>
                  <p className="text-default-500">{form.gender || "—"}</p>
                </div>
              </div>

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
                    Date of birth
                  </p>
                  <p className="font-medium">{form.dob}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-default-500">
                    Phone
                  </p>
                  <p className="font-medium">{form.phone || "—"}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-default-500">
                    Address
                  </p>
                  <p className="font-medium">{form.address || "—"}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-default-500">
                    Gender
                  </p>
                  <p className="font-medium">{form.gender || "—"}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-xs uppercase tracking-wide text-default-500">
                    Insurance info
                  </p>
                  <p className="font-medium">{form.insuranceInfo || "—"}</p>
                </div>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-default-500">
                  Medical history
                </p>
                <pre className="mt-2 whitespace-pre-wrap rounded-xl border border-default-100 bg-content1/70 p-3 text-xs">
                  {medicalHistoryText || "{}"}
                </pre>
              </div>
            </div>
          )}

          {!loading && isEditing && form && (
            <div className="space-y-4">
              {/* Photo uploader */}
              <div className="flex items-center gap-4">
                {form.profilePhotoBase64 ? (
                  <Avatar
                    src={form.profilePhotoBase64}
                    name={`${form.firstName} ${form.lastName}`}
                    className="h-20 w-20"
                    isBordered
                  />
                ) : (
                  <div className="h-20 w-20 rounded-full border flex items-center justify-center text-xs text-default-500">
                    No photo
                  </div>
                )}

                <div className="space-y-2">
                  <Input
                    type="file"
                    label="Profile photo"
                    accept="image/*"
                    onChange={onPhotoChange}
                  />
                  <p className="text-xs text-default-500">JPG/PNG, max 2MB</p>
                </div>
              </div>

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
                  label="Date of birth"
                  type="date"
                  value={form.dob}
                  onValueChange={(v) => setField("dob", v)}
                  isRequired
                />
                <Input
                  label="Phone"
                  value={form.phone}
                  onValueChange={(v) => setField("phone", v)}
                />
                <Input
                  label="Address"
                  value={form.address}
                  onValueChange={(v) => setField("address", v)}
                />
                <Input
                  label="Gender"
                  value={form.gender}
                  onValueChange={(v) => setField("gender", v)}
                />
                <Input
                  className="md:col-span-2"
                  label="Insurance info"
                  value={form.insuranceInfo}
                  onValueChange={(v) => setField("insuranceInfo", v)}
                />
              </div>

              <div>
                <label className="text-sm text-default-500">
                  Medical history (JSON)
                </label>
                <textarea
                  className="mt-2 w-full rounded-xl border border-default-100 bg-content1/70 p-3 text-sm font-mono"
                  rows={7}
                  value={medicalHistoryText}
                  onChange={(e) => {
                    setError(null);
                    setSuccess(null);
                    setMedicalHistoryText(e.target.value);
                  }}
                />
                <p className="mt-1 text-xs text-default-500">
                  Example:{" "}
                  {
                    '{ "allergies": ["pollen"], "notes": "..." }'
                  }
                </p>
              </div>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
