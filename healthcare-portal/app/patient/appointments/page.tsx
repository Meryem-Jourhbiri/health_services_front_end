"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Input } from "@heroui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/table";
import { useAuth } from "@/lib/auth/auth-context";
import { ApiError } from "@/lib/auth/api";
import {
  cancelAppointment,
  getAppointments,
  rescheduleAppointment,
  getAvailableSlots,
  type TimeSlot,
} from "@/lib/appointments/appointments-api";
import type { AppointmentDTO, AppointmentStatus, LocalTime } from "@/lib/types";

const statusOptions: Array<{ value: AppointmentStatus | "ALL"; label: string }> =
  [
    { value: "ALL", label: "All statuses" },
    { value: "PENDING", label: "Pending" },
    { value: "CONFIRMED", label: "Confirmed" },
    { value: "COMPLETED", label: "Completed" },
    { value: "CANCELLED", label: "Cancelled" },
  ];

export default function PatientAppointmentsPage() {
  const { user, token, isHydrating } = useAuth();
  const [appointments, setAppointments] = useState<AppointmentDTO[]>([]);
  const [filters, setFilters] = useState({
    status: "ALL" as AppointmentStatus | "ALL",
    startDate: "",
    endDate: "",
  });
  const [rescheduleTarget, setRescheduleTarget] = useState<AppointmentDTO | null>(
    null,
  );
  const [rescheduleForm, setRescheduleForm] = useState({ date: "", time: "" });
  const [slots, setSlots] = useState<Array<TimeSlot>>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Load appointments
  useEffect(() => {
    let alive = true;

    async function load() {
      if (isHydrating) return;
      if (!user) {
        setLoading(false);
        setError("Not authenticated. Please log in again.");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const appointmentData = await getAppointments(
          {
            role: "PATIENT",
            userId: user.id,
            status: filters.status,
            startDate: filters.startDate,
            endDate: filters.endDate,
          },
          token,
        );
        if (!alive) return;
        setAppointments(appointmentData);
      } catch (e) {
        if (!alive) return;
        const message =
          e instanceof ApiError ? e.message : "Unable to load appointments.";
        setError(message);
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, [filters, user, isHydrating, token]);

  // Load slots when rescheduling
  useEffect(() => {
    let alive = true;

    async function loadSlots() {
      if (!rescheduleTarget || !rescheduleForm.date || !rescheduleTarget.doctorId) {
        setSlots([]);
        return;
      }

      try {
        const slotData = await getAvailableSlots(
          rescheduleTarget.doctorId,
          rescheduleForm.date,
          token,
        );
        if (!alive) return;
        setSlots(slotData);
      } catch {
        if (!alive) return;
        setSlots([]);
      }
    }

    loadSlots();
    return () => {
      alive = false;
    };
  }, [rescheduleTarget, rescheduleForm.date, token]);

  async function handleCancel(id?: string) {
    if (!confirm("Cancel this appointment?")) return;
    if (!user) return;
    if (!id) {
      setError("Appointment ID is missing.");
      return;
    }
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      await cancelAppointment(id, token);
      setSuccess("Appointment cancelled.");
      const updated = await getAppointments(
        {
            role: "PATIENT",
          userId: user.id,
          status: filters.status,
          startDate: filters.startDate,
          endDate: filters.endDate,
        },
        token,
      );
      setAppointments(updated);
    } catch (e) {
      const message =
        e instanceof ApiError ? e.message : "Unable to cancel appointment.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  function beginReschedule(appointment: AppointmentDTO) {
    setRescheduleTarget(appointment);
    setRescheduleForm({
      date: appointment.appointmentDate ?? "",
      time: formatLocalTime(appointment.startTime),
    });
  }

  async function handleRescheduleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user || !rescheduleTarget?.id) return;
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      await rescheduleAppointment(rescheduleTarget.id, rescheduleForm, token);
      setSuccess("Appointment rescheduled.");
      setRescheduleTarget(null);
      const updated = await getAppointments(
        {
            role: "PATIENT",
          userId: user.id,
          status: filters.status,
          startDate: filters.startDate,
          endDate: filters.endDate,
        },
        token,
      );
      setAppointments(updated);
    } catch (e) {
      const message =
        e instanceof ApiError ? e.message : "Unable to reschedule appointment.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="px-6 py-6 md:px-10 md:py-8 space-y-6">
      {/* Header with Book Button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">My Appointments</h1>
          <p className="text-sm text-default-500 mt-1">
            View and manage your scheduled appointments
          </p>
        </div>
        <Link href="/patient/doctors">
          <Button color="primary" radius="full">
            Book Appointment
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div>
            <h2 className="text-lg font-semibold">Filters</h2>
            <p className="text-sm text-default-500">
              Focus on the appointments you need.
            </p>
          </div>
        </CardHeader>
        <CardBody className="space-y-3">
          <div className="grid gap-3 md:grid-cols-4">
            <div>
              <label
                htmlFor="statusFilter"
                className="text-sm font-medium text-default-600 block mb-2"
              >
                Status
              </label>
              <select
                id="statusFilter"
                value={filters.status}
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    status: event.target.value as AppointmentStatus | "ALL",
                  }))
                }
                className="w-full rounded-large border border-default-200 bg-content1 px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <Input
              label="Start date"
              type="date"
              value={filters.startDate}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  startDate: event.target.value,
                }))
              }
              variant="bordered"
            />
            <Input
              label="End date"
              type="date"
              value={filters.endDate}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  endDate: event.target.value,
                }))
              }
              variant="bordered"
            />
            <div className="flex items-end">
              <Button
                variant="flat"
                radius="full"
                className="w-full"
                onPress={() =>
                  setFilters({ status: "ALL", startDate: "", endDate: "" })
                }
              >
                Clear filters
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Messages */}
      {error && (
        <div className="rounded-lg bg-danger-50 border border-danger-200 p-4">
          <p className="text-sm text-danger">{error}</p>
        </div>
      )}
      {success && (
        <div className="rounded-lg bg-success-50 border border-success-200 p-4">
          <p className="text-sm text-success">{success}</p>
        </div>
      )}

      {/* Appointments Table */}
      <Card>
        <CardHeader>
          <div>
            <h2 className="text-lg font-semibold">Appointments</h2>
            <p className="text-sm text-default-500">
              {appointments.length} appointment{appointments.length !== 1 ? "s" : ""}
            </p>
          </div>
        </CardHeader>
        <CardBody>
          {loading ? (
            <p className="text-sm text-default-500 text-center py-8">
              Loading appointments...
            </p>
          ) : appointments.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-default-500">
                No appointments match your filters.
              </p>
              <Link href="/patient/doctors" className="text-primary hover:underline text-sm mt-2 inline-block">
                Search for a doctor to book an appointment →
              </Link>
            </div>
          ) : (
            <Table aria-label="Patient appointments">
              <TableHeader>
                <TableColumn>Doctor</TableColumn>
                <TableColumn>Specialty</TableColumn>
                <TableColumn>Date & Time</TableColumn>
                <TableColumn>Status</TableColumn>
                <TableColumn align="end">Actions</TableColumn>
              </TableHeader>
              <TableBody items={appointments}>
                {(appointment) => {
                  const appointmentStatus = appointment.status ?? "PENDING";
                  const appointmentKey =
                    appointment.id ??
                    `${appointment.doctorId ?? "apt"}-${
                      appointment.appointmentDate ?? "date"
                    }`;
                  return (
                    <TableRow key={appointmentKey}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {appointment.doctorName ?? "—"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {appointment.doctorSpecialization ?? "—"}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col text-sm">
                          <span>{appointment.appointmentDate ?? "—"}</span>
                          <span className="text-xs text-default-500">
                            {formatTimeRange(
                              appointment.startTime,
                              appointment.endTime,
                            )}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <StatusChip status={appointmentStatus} />
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2 justify-end">
                          {appointmentStatus !== "CANCELLED" &&
                            appointmentStatus !== "COMPLETED" && (
                              <>
                                <Button
                                  size="sm"
                                  variant="flat"
                                  onPress={() =>
                                    appointment.id && beginReschedule(appointment)
                                  }
                                  isDisabled={submitting}
                                >
                                  Reschedule
                                </Button>
                                <Button
                                  size="sm"
                                  color="danger"
                                  variant="flat"
                                  onPress={() => handleCancel(appointment.id)}
                                  isDisabled={submitting || !appointment.id}
                                >
                                  Cancel
                                </Button>
                              </>
                            )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                }}
              </TableBody>
            </Table>
          )}
        </CardBody>
      </Card>

      {/* Reschedule Modal */}
      {rescheduleTarget && (
        <Card className="max-w-lg mx-auto">
          <CardHeader>
            <div>
              <h2 className="text-lg font-semibold">Reschedule Appointment</h2>
              <p className="text-sm text-default-500">
                Dr. {rescheduleTarget.doctorName ?? "—"} on{" "}
                {rescheduleTarget.appointmentDate ?? "—"}
              </p>
            </div>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleRescheduleSubmit} className="space-y-4">
              <Input
                label="New Date"
                type="date"
                value={rescheduleForm.date}
                onChange={(e) =>
                  setRescheduleForm((current) => ({
                    ...current,
                    date: e.target.value,
                  }))
                }
                variant="bordered"
                required
              />

              {rescheduleForm.date && slots.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-default-700 block mb-2">
                    Select Time
                  </label>
                  <select
                    value={rescheduleForm.time}
                    onChange={(e) =>
                      setRescheduleForm((current) => ({
                        ...current,
                        time: e.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-default-200 bg-content1 px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                    required
                  >
                    <option value="">Choose a time slot</option>
                    {slots.map((slot) => (
                      <option
                        key={slot.time}
                        value={slot.time}
                        disabled={!slot.available}
                      >
                        {slot.endTime
                          ? `${slot.time} - ${slot.endTime}`
                          : slot.time}{" "}
                        {!slot.available ? "(Unavailable)" : ""}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button
                  type="submit"
                  color="primary"
                  isLoading={submitting}
                  disabled={!rescheduleForm.date || !rescheduleForm.time}
                >
                  Confirm
                </Button>
                <Button
                  type="button"
                  variant="light"
                  onPress={() => setRescheduleTarget(null)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      )}
    </div>
  );
}

function formatLocalTime(time?: LocalTime | string) {
  if (!time) return "";
  if (typeof time === "string") {
    return time.slice(0, 5);
  }
  const hour = time.hour ?? 0;
  const minute = time.minute ?? 0;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function formatTimeRange(start?: LocalTime | string, end?: LocalTime | string) {
  const startLabel = formatLocalTime(start);
  if (!startLabel) return "";
  const endLabel = formatLocalTime(end);
  if (!endLabel) return startLabel;
  return `${startLabel} - ${endLabel}`;
}

function StatusChip({ status }: { status: AppointmentStatus }) {
  const map: Record<
    AppointmentStatus,
    { color: "success" | "warning" | "danger" | "default"; label: string }
  > = {
    PENDING: { color: "warning", label: "Pending" },
    CONFIRMED: { color: "success", label: "Confirmed" },
    COMPLETED: { color: "default", label: "Completed" },
    CANCELLED: { color: "danger", label: "Cancelled" },
  };

  const cfg = map[status];
  return (
    <Chip color={cfg.color} variant="flat" size="sm" className="capitalize">
      {cfg.label}
    </Chip>
  );
}
