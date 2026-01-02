// app/doctor/page.tsx
"use client";

// app/doctor/page.tsx
import { Avatar } from "@heroui/avatar";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Chip } from "@heroui/chip";
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/table";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import {
  getAvailabilities,
  getUnavailabilities,
  type AvailabilitySchedule,
  type UnavailabilityPeriod,
} from "@/lib/availability/availability-api";
import { ApiError } from "@/lib/auth/api";

const appointments = [
  {
    id: "APT-1001",
    patient: "Jane Doe",
    time: "09:00",
    type: "Checkup",
    status: "Confirmed",
  },
  {
    id: "APT-1002",
    patient: "John Smith",
    time: "10:30",
    type: "Follow-up",
    status: "Pending",
  },
  {
    id: "APT-1003",
    patient: "Alice Brown",
    time: "13:15",
    type: "Consultation",
    status: "Cancelled",
  },
];

const appointmentColumns = [
  { key: "patient", label: "Patient" },
  { key: "time", label: "Time" },
  { key: "type", label: "Type" },
  { key: "status", label: "Status" },
  { key: "actions", label: "Actions", align: "end" },
];

export default function DoctorDashboardPage() {
  const { token, isHydrating } = useAuth();
  const [availability, setAvailability] = useState<AvailabilitySchedule[]>([]);
  const [unavailable, setUnavailable] = useState<UnavailabilityPeriod[]>([]);
  const [availabilityError, setAvailabilityError] = useState<string | null>(
    null,
  );

  useEffect(() => {
    let alive = true;

    async function loadAvailability() {
      if (isHydrating) return;
      if (!token) {
        setAvailabilityError("Not authenticated. Please log in again.");
        return;
      }

      try {
        const [scheduleData, unavailableData] = await Promise.all([
          getAvailabilities(token),
          getUnavailabilities(token),
        ]);
        if (!alive) return;
        setAvailability(scheduleData);
        setUnavailable(unavailableData);
      } catch (e) {
        if (!alive) return;
        const message =
          e instanceof ApiError ? e.message : "Failed to load availability.";
        setAvailabilityError(message);
      }
    }

    loadAvailability();
    return () => {
      alive = false;
    };
  }, [token, isHydrating]);

  return (
    <div className="px-6 py-6 md:px-10 md:py-8 space-y-6">
      {/* Top stats */}
      <section className="grid gap-4 md:grid-cols-3">
        <StatCard label="Today&apos;s appointments" value="12" />
        <StatCard label="New patients this week" value="5" />
        <StatCard label="Average wait time" value="08 min" />
      </section>

      {/* Appointments table */}
      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h2 className="text-xl font-semibold">Upcoming appointments</h2>
            <p className="text-sm text-default-500">
              Quickly see who you&apos;re meeting today.
            </p>
          </div>
          <Button color="primary" radius="full">
            New appointment
          </Button>
        </div>

        <Card>
          <CardBody>
            <Table aria-label="Upcoming appointments table">
              <TableHeader columns={appointmentColumns}>
                {(column) => (
                  <TableColumn
                    key={column.key}
                    align={column.align as "start" | "center" | "end"}
                  >
                    {column.label}
                  </TableColumn>
                )}
              </TableHeader>
              <TableBody items={appointments}>
                {(apt) => (
                  <TableRow key={apt.id}>
                    <TableCell className="flex items-center gap-2">
                      <Avatar
                        name={apt.patient}
                        className="bg-primary/10 text-primary"
                        size="sm"
                      />
                      <div className="flex flex-col">
                        <span>{apt.patient}</span>
                        <span className="text-xs text-default-500">
                          {apt.id}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{apt.time}</TableCell>
                    <TableCell>{apt.type}</TableCell>
                    <TableCell>
                      <StatusChip status={apt.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="light">
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardBody>
        </Card>
      </section>

      {/* Availability overview */}
      <section className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div>
              <h2 className="text-lg font-semibold">Weekly availability</h2>
              <p className="text-sm text-default-500">
                Your current working hours for each day.
              </p>
            </div>
          </CardHeader>
          <CardBody className="space-y-3">
            {availabilityError ? (
              <p className="text-sm text-danger">{availabilityError}</p>
            ) : null}
            {availability.length === 0 ? (
              <p className="text-sm text-default-500">
                No availability schedules yet.
              </p>
            ) : (
              availability.map((schedule) => (
                <div
                  key={schedule.id}
                  className="rounded-xl border border-default-100 bg-content1/70 px-4 py-3 text-sm"
                >
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
              ))
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <h2 className="text-lg font-semibold">Unavailable periods</h2>
              <p className="text-sm text-default-500">
                Time off that blocks new appointments.
              </p>
            </div>
          </CardHeader>
          <CardBody className="space-y-3">
            {availabilityError ? (
              <p className="text-sm text-danger">{availabilityError}</p>
            ) : null}
            {unavailable.length === 0 ? (
              <p className="text-sm text-default-500">
                No unavailable periods yet.
              </p>
            ) : (
              unavailable.map((period) => (
                <div
                  key={period.id}
                  className="rounded-xl border border-default-100 bg-content1/70 px-4 py-3 text-sm"
                >
                  <p className="font-medium">
                    {period.startDate} - {period.endDate}
                  </p>
                  <p className="text-default-500">
                    {period.reason || "No reason provided"}
                  </p>
                </div>
              ))
            )}
          </CardBody>
        </Card>
      </section>
    </div>
  );
}

type StatCardProps = {
  label: string;
  value: string;
};

function StatCard(props: StatCardProps) {
  const { label, value } = props;
  return (
    <Card>
      <CardHeader className="flex flex-col items-start gap-1">
        <span className="text-xs uppercase tracking-wide text-default-500">
          {label}
        </span>
        <span className="text-2xl font-semibold">{value}</span>
      </CardHeader>
    </Card>
  );
}

type StatusChipProps = {
  status: string;
};

function StatusChip(props: StatusChipProps) {
  const { status } = props;
  const map: Record<
    string,
    { color: "success" | "warning" | "danger" | "default"; label: string }
  > = {
    Confirmed: { color: "success", label: "Confirmed" },
    Pending: { color: "warning", label: "Pending" },
    Cancelled: { color: "danger", label: "Cancelled" },
  };

  const cfg = map[status] ?? { color: "default", label: status };
  return (
    <Chip
      color={cfg.color}
      variant="flat"
      size="sm"
      className="capitalize"
    >
      {cfg.label}
    </Chip>
  );
}
