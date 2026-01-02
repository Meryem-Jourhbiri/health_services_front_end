"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Input } from "@heroui/input";
import { useAuth } from "@/lib/auth/auth-context";
import {
  createAvailability,
  createUnavailability,
  deleteAvailability,
  deleteUnavailability,
  getAvailabilities,
  getUnavailabilities,
  updateAvailability,
  type AvailabilityPayload,
  type AvailabilitySchedule,
  type DayOfWeek,
  type UnavailabilityPayload,
  type UnavailabilityPeriod,
} from "@/lib/availability/availability-api";
import { ApiError } from "@/lib/auth/api";

const DAYS: DayOfWeek[] = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];

const defaultSchedule: AvailabilityPayload = {
  dayOfWeek: "MONDAY",
  startTime: "09:00",
  endTime: "17:00",
  breakStartTime: "12:00",
  breakEndTime: "13:00",
  slotDurationMinutes: 30,
};

const defaultUnavailability: UnavailabilityPayload = {
  startDate: "",
  endDate: "",
  reason: "",
};

export default function DoctorAvailabilityPage() {
  const { token, isHydrating } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [schedules, setSchedules] = useState<AvailabilitySchedule[]>([]);
  const [unavailabilities, setUnavailabilities] = useState<
    UnavailabilityPeriod[]
  >([]);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [scheduleForm, setScheduleForm] =
    useState<AvailabilityPayload>(defaultSchedule);
  const [showUnavailabilityForm, setShowUnavailabilityForm] = useState(false);
  const [unavailabilityForm, setUnavailabilityForm] =
    useState<UnavailabilityPayload>(defaultUnavailability);

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

      try {
        const [scheduleData, unavailableData] = await Promise.all([
          getAvailabilities(token),
          getUnavailabilities(token),
        ]);
        if (!alive) return;
        setSchedules(scheduleData);
        setUnavailabilities(unavailableData);
      } catch (e) {
        if (!alive) return;
        const message =
          e instanceof ApiError ? e.message : "Failed to load availability.";
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

  const isEditing = Boolean(editingId);

  const scheduleValidation = useMemo(() => {
    if (!scheduleForm.startTime || !scheduleForm.endTime) {
      return "Start and end times are required.";
    }
    if (scheduleForm.startTime >= scheduleForm.endTime) {
      return "Start time must be earlier than end time.";
    }
    if (
      scheduleForm.breakStartTime &&
      scheduleForm.breakEndTime &&
      scheduleForm.breakStartTime >= scheduleForm.breakEndTime
    ) {
      return "Break start must be earlier than break end.";
    }
    return null;
  }, [scheduleForm]);

  const unavailabilityValidation = useMemo(() => {
    if (!unavailabilityForm.startDate || !unavailabilityForm.endDate) {
      return "Start and end dates are required.";
    }
    if (unavailabilityForm.startDate > unavailabilityForm.endDate) {
      return "Start date must be before end date.";
    }
    return null;
  }, [unavailabilityForm]);

  async function handleScheduleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (scheduleValidation) {
      setError(scheduleValidation);
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        const updated = await updateAvailability(
          token,
          editingId,
          scheduleForm,
        );
        setSchedules((prev) =>
          prev.map((item) => (item.id === updated.id ? updated : item)),
        );
        setSuccess("Availability updated.");
      } else {
        const created = await createAvailability(token, scheduleForm);
        setSchedules((prev) => [...prev, created]);
        setSuccess("Availability added.");
      }
      setEditingId(null);
      setScheduleForm(defaultSchedule);
      setShowScheduleForm(false);
    } catch (e) {
      const message =
        e instanceof ApiError ? e.message : "Failed to save availability.";
      setError(message);
    } finally {
      setSaving(false);
    }
  }

  function startEdit(schedule: AvailabilitySchedule) {
    setEditingId(schedule.id);
    setScheduleForm({
      dayOfWeek: schedule.dayOfWeek,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      breakStartTime: schedule.breakStartTime ?? "",
      breakEndTime: schedule.breakEndTime ?? "",
      slotDurationMinutes: schedule.slotDurationMinutes,
    });
    setShowScheduleForm(true);
  }

  function resetScheduleForm() {
    setEditingId(null);
    setScheduleForm(defaultSchedule);
    setShowScheduleForm(false);
    setError(null);
    setSuccess(null);
  }

  async function handleScheduleDelete(id: string) {
    if (!confirm("Delete this availability schedule?")) return;
    setError(null);
    setSuccess(null);
    setSaving(true);
    try {
      await deleteAvailability(token, id);
      setSchedules((prev) => prev.filter((item) => item.id !== id));
      setSuccess("Availability removed.");
    } catch (e) {
      const message =
        e instanceof ApiError ? e.message : "Failed to delete availability.";
      setError(message);
    } finally {
      setSaving(false);
    }
  }

  async function handleUnavailabilitySubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (unavailabilityValidation) {
      setError(unavailabilityValidation);
      return;
    }

    setSaving(true);
    try {
      const created = await createUnavailability(token, unavailabilityForm);
      setUnavailabilities((prev) => [...prev, created]);
      setUnavailabilityForm(defaultUnavailability);
      setShowUnavailabilityForm(false);
      setSuccess("Unavailability saved.");
    } catch (e) {
      const message =
        e instanceof ApiError ? e.message : "Failed to save unavailability.";
      setError(message);
    } finally {
      setSaving(false);
    }
  }

  async function handleUnavailabilityDelete(id: string) {
    if (!confirm("Remove this unavailable period?")) return;
    setError(null);
    setSuccess(null);
    setSaving(true);
    try {
      await deleteUnavailability(token, id);
      setUnavailabilities((prev) => prev.filter((item) => item.id !== id));
      setSuccess("Unavailability removed.");
    } catch (e) {
      const message =
        e instanceof ApiError ? e.message : "Failed to remove unavailability.";
      setError(message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="px-6 py-6 md:px-10 md:py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Availability</h1>
        <p className="text-sm text-default-500">
          Set weekly schedules and block off unavailable periods.
        </p>
      </div>

      {loading && (
        <p className="text-sm text-default-500">Loading availability...</p>
      )}

      {!loading && error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm">
          {error}
        </div>
      )}

      {!loading && success && (
        <div className="rounded-xl bg-success text-success-foreground px-4 py-3 text-sm">
          {success}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.2fr,1fr]">
        <Card>
          <CardHeader className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Weekly schedule</h2>
              <p className="text-sm text-default-500">
                Add the days and hours you are available for appointments.
              </p>
            </div>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="space-y-3">
              {schedules.length === 0 ? (
                <p className="text-sm text-default-500">
                  No availability schedules yet.
                </p>
              ) : (
                schedules.map((schedule) => (
                  <div
                    key={schedule.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-default-100 bg-content1/70 px-4 py-3 text-sm"
                  >
                    <div>
                      <p className="font-medium">{schedule.dayOfWeek}</p>
                      <p className="text-default-500">
                        {schedule.startTime} - {schedule.endTime}
                        {schedule.breakStartTime && schedule.breakEndTime
                          ? ` (break ${schedule.breakStartTime}-${schedule.breakEndTime})`
                          : ""}
                      </p>
                      <p className="text-default-500">
                        Slot duration: {schedule.slotDurationMinutes} minutes
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="flat"
                        onPress={() => startEdit(schedule)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        color="danger"
                        variant="light"
                        onPress={() => handleScheduleDelete(schedule.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <Button
              radius="full"
              color="primary"
              variant="bordered"
              isDisabled={loading || saving}
              onPress={() => {
                setEditingId(null);
                setScheduleForm(defaultSchedule);
                setShowScheduleForm(true);
              }}
            >
              Add new schedule
            </Button>

            {showScheduleForm ? (
              <form
                className="grid gap-4 md:grid-cols-2"
                onSubmit={handleScheduleSubmit}
              >
                <div className="space-y-2">
                  <label className="text-sm text-default-500">Day of week</label>
                  <select
                    className="w-full rounded-xl border border-default-100 bg-content1/70 px-3 py-2 text-sm"
                    value={scheduleForm.dayOfWeek}
                    onChange={(event) =>
                      setScheduleForm((prev) => ({
                        ...prev,
                        dayOfWeek: event.target.value as DayOfWeek,
                      }))
                    }
                  >
                    {DAYS.map((day) => (
                      <option key={day} value={day}>
                        {day}
                      </option>
                    ))}
                  </select>
                </div>
                <Input
                  label="Slot duration (minutes)"
                  type="number"
                  min={5}
                  value={String(scheduleForm.slotDurationMinutes)}
                  onValueChange={(value) =>
                    setScheduleForm((prev) => ({
                      ...prev,
                      slotDurationMinutes: Number(value) || 0,
                    }))
                  }
                  isRequired
                />
                <Input
                  label="Start time"
                  type="time"
                  value={scheduleForm.startTime}
                  onValueChange={(value) =>
                    setScheduleForm((prev) => ({ ...prev, startTime: value }))
                  }
                  isRequired
                />
                <Input
                  label="End time"
                  type="time"
                  value={scheduleForm.endTime}
                  onValueChange={(value) =>
                    setScheduleForm((prev) => ({ ...prev, endTime: value }))
                  }
                  isRequired
                />
                <Input
                  label="Break start time"
                  type="time"
                  value={scheduleForm.breakStartTime || ""}
                  onValueChange={(value) =>
                    setScheduleForm((prev) => ({
                      ...prev,
                      breakStartTime: value || null,
                    }))
                  }
                />
                <Input
                  label="Break end time"
                  type="time"
                  value={scheduleForm.breakEndTime || ""}
                  onValueChange={(value) =>
                    setScheduleForm((prev) => ({
                      ...prev,
                      breakEndTime: value || null,
                    }))
                  }
                />
                <div className="md:col-span-2 flex flex-wrap gap-2">
                  <Button
                    type="submit"
                    color="primary"
                    radius="full"
                    isLoading={saving}
                    isDisabled={loading}
                  >
                    {isEditing ? "Update schedule" : "Add schedule"}
                  </Button>
                  <Button
                    variant="flat"
                    radius="full"
                    onPress={resetScheduleForm}
                    isDisabled={saving}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            ) : null}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <h2 className="text-lg font-semibold">Unavailable periods</h2>
              <p className="text-sm text-default-500">
                Block vacation, conference, or personal time.
              </p>
            </div>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="space-y-3">
              {unavailabilities.length === 0 ? (
                <p className="text-sm text-default-500">
                  No unavailable periods yet.
                </p>
              ) : (
                unavailabilities.map((period) => (
                  <div
                    key={period.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-default-100 bg-content1/70 px-4 py-3 text-sm"
                  >
                    <div>
                      <p className="font-medium">
                        {period.startDate} - {period.endDate}
                      </p>
                      <p className="text-default-500">
                        {period.reason || "No reason provided"}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      color="danger"
                      variant="light"
                      onPress={() => handleUnavailabilityDelete(period.id)}
                    >
                      Remove
                    </Button>
                  </div>
                ))
              )}
            </div>

            <Button
              radius="full"
              color="primary"
              variant="bordered"
              isDisabled={loading || saving}
              onPress={() => setShowUnavailabilityForm(true)}
            >
              Add unavailable period
            </Button>

            {showUnavailabilityForm ? (
              <form className="space-y-4" onSubmit={handleUnavailabilitySubmit}>
                <Input
                  label="Start date"
                  type="date"
                  value={unavailabilityForm.startDate}
                  onValueChange={(value) =>
                    setUnavailabilityForm((prev) => ({
                      ...prev,
                      startDate: value,
                    }))
                  }
                  isRequired
                />
                <Input
                  label="End date"
                  type="date"
                  value={unavailabilityForm.endDate}
                  onValueChange={(value) =>
                    setUnavailabilityForm((prev) => ({
                      ...prev,
                      endDate: value,
                    }))
                  }
                  isRequired
                />
                <Input
                  label="Reason"
                  value={unavailabilityForm.reason}
                  onValueChange={(value) =>
                    setUnavailabilityForm((prev) => ({
                      ...prev,
                      reason: value,
                    }))
                  }
                />
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="submit"
                    color="primary"
                    radius="full"
                    isLoading={saving}
                    isDisabled={loading}
                  >
                    Save unavailable period
                  </Button>
                  <Button
                    variant="flat"
                    radius="full"
                    onPress={() => {
                      setUnavailabilityForm(defaultUnavailability);
                      setShowUnavailabilityForm(false);
                    }}
                    isDisabled={saving}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            ) : null}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
