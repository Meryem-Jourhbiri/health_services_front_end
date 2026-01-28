"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
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
import { getAuditLogs } from "@/lib/admin/admin-api";
import type { AuditLogDTO, PageAuditLogDTO } from "@/lib/types";

type Filters = {
  userId: string;
  action: string;
  resourceType: string;
  startDate: string;
  endDate: string;
};

const emptyFilters: Filters = {
  userId: "",
  action: "",
  resourceType: "",
  startDate: "",
  endDate: "",
};

function toIso(value: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString();
}

export default function AdminAuditLogsPage() {
  const { token, isHydrating } = useAuth();
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [appliedFilters, setAppliedFilters] = useState<Filters>(emptyFilters);
  const [data, setData] = useState<PageAuditLogDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(50);

  useEffect(() => {
    let alive = true;

    async function loadLogs() {
      if (isHydrating) return;
      setLoading(true);
      setError(null);
      try {
        const response = await getAuditLogs(token, {
          userId: appliedFilters.userId || undefined,
          action: appliedFilters.action || undefined,
          resourceType: appliedFilters.resourceType || undefined,
          startDate: toIso(appliedFilters.startDate) || undefined,
          endDate: toIso(appliedFilters.endDate) || undefined,
          page,
          size,
        });
        if (!alive) return;
        setData(response);
      } catch (err) {
        if (!alive) return;
        const message =
          err instanceof ApiError
            ? err.message
            : "Unable to load audit logs.";
        setError(message);
      } finally {
        if (alive) setLoading(false);
      }
    }

    loadLogs();
    return () => {
      alive = false;
    };
  }, [token, isHydrating, appliedFilters, page, size]);

  const logs = useMemo(() => data?.content ?? [], [data]);
  const totalPages = data?.totalPages ?? 1;

  function handleFilterChange(key: keyof Filters, value: string) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  return (
    <div className="px-6 py-6 md:px-10 md:py-8 space-y-6">
      <section className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Audit logs</h1>
          <p className="text-sm text-default-500">
            Track admin and user actions across the platform.
          </p>
        </div>
      </section>

      <Card>
        <CardHeader>
          <div>
            <h2 className="text-lg font-semibold">Filters</h2>
            <p className="text-sm text-default-500">
              Filter by user, action type, and date range.
            </p>
          </div>
        </CardHeader>
        <CardBody className="grid gap-3 md:grid-cols-5">
          <Input
            label="User ID"
            placeholder="UUID"
            value={filters.userId}
            onValueChange={(value) => handleFilterChange("userId", value)}
          />
          <Input
            label="Action"
            placeholder="e.g. USER_SUSPEND"
            value={filters.action}
            onValueChange={(value) => handleFilterChange("action", value)}
          />
          <Input
            label="Resource type"
            placeholder="e.g. USER"
            value={filters.resourceType}
            onValueChange={(value) => handleFilterChange("resourceType", value)}
          />
          <Input
            label="Start date"
            type="datetime-local"
            value={filters.startDate}
            onValueChange={(value) => handleFilterChange("startDate", value)}
          />
          <Input
            label="End date"
            type="datetime-local"
            value={filters.endDate}
            onValueChange={(value) => handleFilterChange("endDate", value)}
          />
          <div className="flex flex-wrap items-center gap-2 md:col-span-5">
            <Button
              size="sm"
              color="primary"
              onPress={() => {
                setAppliedFilters(filters);
                setPage(0);
              }}
            >
              Apply filters
            </Button>
            <Button
              size="sm"
              variant="flat"
              onPress={() => {
                setFilters(emptyFilters);
                setAppliedFilters(emptyFilters);
                setPage(0);
              }}
            >
              Clear
            </Button>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Event stream</h2>
            <p className="text-sm text-default-500">
              {loading
                ? "Loading audit logs..."
                : `${data?.totalElements ?? 0} events`}
            </p>
          </div>
          <select
            value={String(size)}
            onChange={(event) => {
              setSize(Number(event.target.value));
              setPage(0);
            }}
            className="rounded-large border border-default-200 bg-content1 px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
          >
            {[25, 50, 100].map((option) => (
              <option key={option} value={option}>
                {option} per page
              </option>
            ))}
          </select>
        </CardHeader>
        <CardBody>
          {error ? (
            <div className="mb-4 rounded-xl bg-danger text-danger-foreground px-4 py-3 text-sm">
              {error}
            </div>
          ) : null}

          <Table aria-label="Audit logs" removeWrapper>
            <TableHeader>
              <TableColumn>Timestamp</TableColumn>
              <TableColumn>User</TableColumn>
              <TableColumn>Action</TableColumn>
              <TableColumn>Resource</TableColumn>
              <TableColumn>Details</TableColumn>
              <TableColumn>IP</TableColumn>
            </TableHeader>
            <TableBody
              items={logs}
              emptyContent={loading ? "Loading..." : "No audit logs"}
            >
              {(log) => <AuditRow log={log} />}
            </TableBody>
          </Table>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-sm">
            <span className="text-default-500">
              Page {page + 1} of {totalPages}
            </span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="flat"
                isDisabled={page <= 0 || loading}
                onPress={() => setPage((current) => Math.max(0, current - 1))}
              >
                Previous
              </Button>
              <Button
                size="sm"
                variant="flat"
                isDisabled={page + 1 >= totalPages || loading}
                onPress={() =>
                  setPage((current) =>
                    Math.min(totalPages - 1, current + 1),
                  )
                }
              >
                Next
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

function AuditRow({ log }: { log: AuditLogDTO }) {
  return (
    <TableRow
      key={
        log.id ??
        `${log.userId ?? ""}-${log.action ?? ""}-${log.createdAt ?? ""}`
      }
    >
      <TableCell>
        {log.createdAt ? new Date(log.createdAt).toLocaleString() : "—"}
      </TableCell>
      <TableCell>
        <div className="flex flex-col">
          <span className="text-sm font-medium">{log.userEmail ?? "—"}</span>
          <span className="text-xs text-default-500">{log.userId ?? ""}</span>
        </div>
      </TableCell>
      <TableCell>{log.action ?? "—"}</TableCell>
      <TableCell>
        <div className="flex flex-col">
          <span className="text-sm font-medium">
            {log.resourceType ?? "—"}
          </span>
          <span className="text-xs text-default-500">
            {log.resourceId ?? ""}
          </span>
        </div>
      </TableCell>
      <TableCell>
        <span className="text-sm text-default-600">{log.details ?? "—"}</span>
      </TableCell>
      <TableCell>{log.ipAddress ?? "—"}</TableCell>
    </TableRow>
  );
}
