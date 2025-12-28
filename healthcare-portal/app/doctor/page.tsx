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
