"use client";

import { useEffect, useState } from "react";
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
  getAppointments,
  updateAppointmentStatus,
} from "@/lib/appointments/appointments-api";
import type { AppointmentDTO, AppointmentStatus, LocalTime } from "@/lib/types";

const STATUS_VALUES = ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"] as const;

function toAppointmentStatus(value: string): AppointmentStatus | null {
  const upper = value.toUpperCase();
  return (STATUS_VALUES as readonly string[]).includes(upper)
    ? (upper as AppointmentStatus)
    : null;
}

const statusOptions: Array<{ value: AppointmentStatus | "ALL"; label: string }> =
  [
    { value: "ALL", label: "All statuses" },
    { value: "PENDING", label: "Pending" },
    { value: "CONFIRMED", label: "Confirmed" },
    { value: "COMPLETED", label: "Completed" },
    { value: "CANCELLED", label: "Cancelled" },
  ];

export default function DoctorAppointmentsPage() {
  const { user, token, isHydrating } = useAuth();
  const [appointments, setAppointments] = useState<AppointmentDTO[]>([]);
  const [filters, setFilters] = useState({
    status: "ALL" as AppointmentStatus | "ALL",
    startDate: "",
    endDate: "",
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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
            role: "DOCTOR",
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
  }, [filters, user, isHydrating]);

  async function handleStatusUpdate(
    appointment: AppointmentDTO,
    status: AppointmentStatus,
  ) {
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      if (!appointment.id) {
        throw new Error("Appointment ID is required.");
      }
      const normalizedStatus = toAppointmentStatus(status);
      if (!normalizedStatus) {
        throw new Error("Appointment status is required.");
      }
      await updateAppointmentStatus(
        appointment.id,
        { status: normalizedStatus },
        token,
      );
      setSuccess("Appointment status updated.");
      if (user) {
        const updated = await getAppointments(
          {
            role: "DOCTOR",
            userId: user.id,
            status: filters.status,
            startDate: filters.startDate,
            endDate: filters.endDate,
          },
          token,
        );
        setAppointments(updated);
      }
    } catch (e) {
      const message =
        e instanceof ApiError
          ? e.message
          : "Unable to update appointment.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="px-6 py-6 md:px-10 md:py-8 space-y-6">
      <section className="grid gap-4 lg:grid-cols-[1.2fr,1fr]">
        <Card>
          <CardHeader>
            <div>
              <h2 className="text-lg font-semibold">Schedule overview</h2>
              <p className="text-sm text-default-500">
                Review upcoming visits and update their status.
              </p>
            </div>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <SummaryStat label="Today" value="4 appointments" />
              <SummaryStat label="Pending" value="2 approvals" />
              <SummaryStat label="Completed" value="18 this month" />
            </div>
            <Button radius="full" variant="flat">
              Export schedule
            </Button>
          </CardBody>
        </Card>

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
            <div className="space-y-2">
              <label
                htmlFor="statusFilter"
                className="text-sm font-medium text-default-600"
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
            <div className="grid gap-3 md:grid-cols-2">
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
            </div>
            <Button
              variant="flat"
              radius="full"
              onPress={() =>
                setFilters({ status: "ALL", startDate: "", endDate: "" })
              }
            >
              Clear filters
            </Button>
          </CardBody>
        </Card>
      </section>

      {error ? <p className="text-sm text-danger">{error}</p> : null}
      {success ? <p className="text-sm text-success">{success}</p> : null}

      <Card>
        <CardHeader>
          <div>
            <h2 className="text-lg font-semibold">Appointments</h2>
            <p className="text-sm text-default-500">
              Keep patients informed by updating status quickly.
            </p>
          </div>
        </CardHeader>
        <CardBody>
          {loading ? (
            <p className="text-sm text-default-500">Loading appointments...</p>
          ) : appointments.length === 0 ? (
            <p className="text-sm text-default-500">
              No appointments match your filters.
            </p>
          ) : (
            <Table aria-label="Doctor appointments">
              <TableHeader>
                <TableColumn>Patient</TableColumn>
                <TableColumn>Date</TableColumn>
                <TableColumn>Reason</TableColumn>
                <TableColumn>Status</TableColumn>
                <TableColumn align="end">Update</TableColumn>
              </TableHeader>
              <TableBody items={appointments}>
                {(appointment) => {
                  const appointmentStatus = appointment.status ?? "PENDING";
                  const appointmentKey =
                    appointment.id ??
                    `${appointment.patientId ?? "apt"}-${
                      appointment.appointmentDate ?? "date"
                    }`;
                  return (
                    <TableRow key={appointmentKey}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {appointment.patientName ?? "—"}
                          </span>
                          <span className="text-xs text-default-500">
                            {appointment.id ?? "—"}
                          </span>
                        </div>
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
                      <TableCell>{appointment.reason ?? "—"}</TableCell>
                      <TableCell>
                        <StatusChip status={appointmentStatus} />
                      </TableCell>
                      <TableCell className="text-right">
                        <select
                          value={appointmentStatus}
                          onChange={(event) =>
                            handleStatusUpdate(
                              appointment,
                              (toAppointmentStatus(event.target.value) ??
                                appointmentStatus) as AppointmentStatus,
                            )
                          }
                          className="rounded-large border border-default-200 bg-content1 px-2 py-1 text-xs text-foreground outline-none focus:border-primary"
                          disabled={submitting || !appointment.id}
                        >
                          {statusOptions
                            .filter((option) => option.value !== "ALL")
                            .map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                        </select>
                      </TableCell>
                    </TableRow>
                  );
                }}
              </TableBody>
            </Table>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-default-100 bg-content1/70 px-4 py-3">
      <p className="text-xs uppercase tracking-wide text-default-500">
        {label}
      </p>
      <p className="text-lg font-semibold">{value}</p>
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
