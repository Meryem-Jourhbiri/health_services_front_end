"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";

import { useAuth } from "@/lib/auth/auth-context";
import {
  getPatientProfile,
  updatePatientProfile,
  type PatientProfile,
} from "@/lib/profile/patient-api";
import { ApiError } from "@/lib/auth/api";

export default function PatientProfilePage() {
  const { token } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [serverProfile, setServerProfile] = useState<PatientProfile | null>(
    null,
  );
  const [form, setForm] = useState<PatientProfile | null>(null);

  const [medicalHistoryText, setMedicalHistoryText] = useState<string>("{}");

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    async function load() {
      setLoading(true);
      setError(null);
      setSuccess(null);

      try {
        const data = await getPatientProfile(token);
        if (!alive) return;

        setServerProfile(data);
        setForm(data);
        setMedicalHistoryText(JSON.stringify(data.medicalHistory ?? {}, null, 2));
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
  }, [token]);

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
      serverMedicalText !== medicalHistoryText
    );
  }, [serverProfile, form, medicalHistoryText]);

  const validationError = useMemo(() => {
    if (!form) return null;
    if (!form.firstName.trim()) return "First name is required.";
    if (!form.lastName.trim()) return "Last name is required.";
    if (!/^\d{4}-\d{2}-\d{2}$/.test(form.dob.trim()))
      return "DOB must be YYYY-MM-DD.";
    return null;
  }, [form]);

  function setField<K extends keyof PatientProfile>(
    key: K,
    value: PatientProfile[K],
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
    setMedicalHistoryText(
      JSON.stringify(serverProfile.medicalHistory ?? {}, null, 2),
    );
  }

  async function onSave() {
    if (!form) return;
    if (validationError) return;

    let parsedMedicalHistory: Record<string, unknown> = {};
    try {
      parsedMedicalHistory = JSON.parse(medicalHistoryText || "{}");
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
      setMedicalHistoryText(JSON.stringify(saved.medicalHistory ?? {}, null, 2));
      setSuccess("Profile saved");
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
    <ProtectedRoute allowRoles={["patient"]}>
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
              <Button
                variant="flat"
                onPress={onCancel}
                isDisabled={!isDirty || saving || loading}
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

            {!loading && form && (
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
                    Example: {"{ \"allergies\": [\"pollen\"], \"notes\": \"...\" }"}
                  </p>
                </div>
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </ProtectedRoute>
  );
}




