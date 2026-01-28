"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
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
import {
  activateAdminUser,
  getAdminUsers,
  suspendAdminUser,
} from "@/lib/admin/admin-api";
import type { AdminUserDTO, PageAdminUserDTO, UserRole } from "@/lib/types";

const ROLE_OPTIONS: Array<{ value: "ALL" | UserRole; label: string }> = [
  { value: "ALL", label: "All roles" },
  { value: "ADMIN", label: "Admin" },
  { value: "DOCTOR", label: "Doctor" },
  { value: "PATIENT", label: "Patient" },
];

const STATUS_OPTIONS = [
  { value: "ALL", label: "All statuses" },
  { value: "ACTIVE", label: "Active" },
  { value: "SUSPENDED", label: "Suspended" },
] as const;

type StatusFilter = (typeof STATUS_OPTIONS)[number]["value"];

type PendingAction = {
  id: string;
  action: "suspend" | "activate";
};

export default function AdminUsersPage() {
  const { token, isHydrating } = useAuth();
  const [data, setData] = useState<PageAdminUserDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"ALL" | UserRole>("ALL");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);

  useEffect(() => {
    let alive = true;

    async function loadUsers() {
      if (isHydrating) return;
      setLoading(true);
      setError(null);
      try {
        const response = await getAdminUsers(token, { search, page, size });
        if (!alive) return;
        setData(response);
      } catch (err) {
        if (!alive) return;
        const message =
          err instanceof ApiError ? err.message : "Unable to load users.";
        setError(message);
      } finally {
        if (alive) setLoading(false);
      }
    }

    loadUsers();
    return () => {
      alive = false;
    };
  }, [token, isHydrating, search, page, size]);

  const users = useMemo(() => data?.content ?? [], [data]);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const roleMatches = roleFilter === "ALL" || user.role === roleFilter;
      const statusMatches =
        statusFilter === "ALL" ||
        (statusFilter === "SUSPENDED" ? user.suspended : !user.suspended);
      return roleMatches && statusMatches;
    });
  }, [users, roleFilter, statusFilter]);

  const totalPages = data?.totalPages ?? 1;

  async function handleAction(user: AdminUserDTO, action: "suspend" | "activate") {
    if (!user.id) return;
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      if (action === "suspend") {
        await suspendAdminUser(token, user.id);
        setSuccess(`Suspended ${user.email || "user"}.`);
      } else {
        await activateAdminUser(token, user.id);
        setSuccess(`Reactivated ${user.email || "user"}.`);
      }
      const response = await getAdminUsers(token, { search, page, size });
      setData(response);
      setPendingAction(null);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Unable to update user status.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="px-6 py-6 md:px-10 md:py-8 space-y-6">
      <section className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">User management</h1>
          <p className="text-sm text-default-500">
            Search and manage accounts across the platform.
          </p>
        </div>
      </section>

      <Card>
        <CardHeader>
          <div>
            <h2 className="text-lg font-semibold">Filters</h2>
            <p className="text-sm text-default-500">
              Search applies server-side; filters apply to current page.
            </p>
          </div>
        </CardHeader>
        <CardBody className="grid gap-3 md:grid-cols-4">
          <Input
            label="Search"
            placeholder="Name or email"
            value={search}
            onValueChange={(value) => {
              setSearch(value);
              setPage(0);
            }}
            isDisabled={loading}
          />
          <select
            value={roleFilter}
            onChange={(event) => setRoleFilter(event.target.value as "ALL" | UserRole)}
            className="w-full rounded-large border border-default-200 bg-content1 px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
          >
            {ROLE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value as StatusFilter)
            }
            className="w-full rounded-large border border-default-200 bg-content1 px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <select
            value={String(size)}
            onChange={(event) => {
              setSize(Number(event.target.value));
              setPage(0);
            }}
            className="w-full rounded-large border border-default-200 bg-content1 px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
          >
            {[10, 20, 50].map((option) => (
              <option key={option} value={option}>
                {option} per page
              </option>
            ))}
          </select>
        </CardBody>
      </Card>

      {error ? (
        <div className="rounded-xl bg-danger text-danger-foreground px-4 py-3 text-sm">
          {error}
        </div>
      ) : null}
      {success ? (
        <div className="rounded-xl bg-success text-success-foreground px-4 py-3 text-sm">
          {success}
        </div>
      ) : null}

      <Card>
        <CardHeader className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Accounts</h2>
            <p className="text-sm text-default-500">
              {loading
                ? "Loading users..."
                : `${data?.totalElements ?? 0} total users`}
            </p>
          </div>
        </CardHeader>
        <CardBody>
          <Table aria-label="Admin users table" removeWrapper>
            <TableHeader>
              <TableColumn>Name</TableColumn>
              <TableColumn>Email</TableColumn>
              <TableColumn>Role</TableColumn>
              <TableColumn>Status</TableColumn>
              <TableColumn>Verified</TableColumn>
              <TableColumn>Actions</TableColumn>
            </TableHeader>
            <TableBody
              items={filteredUsers}
              emptyContent={loading ? "Loading..." : "No users found"}
            > 
              {(user) => (
                <TableRow
                  key={
                    user.id ??
                    user.email ??
                    `${user.firstName ?? ""}-${user.lastName ?? ""}-${user.createdAt ?? ""}`
                  }
                >
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {user.firstName || user.lastName
                          ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim()
                          : "—"}
                      </span>
                      <Link
                        className="text-xs text-primary"
                        href={`/admin/users/${user.id}`}
                      >
                        View details
                      </Link>
                    </div>
                  </TableCell>
                  <TableCell>{user.email ?? "—"}</TableCell>
                  <TableCell>{user.role ?? "—"}</TableCell>
                  <TableCell>
                    {user.suspended ? "Suspended" : "Active"}
                  </TableCell>
                  <TableCell>{user.verified ? "Yes" : "No"}</TableCell>
                  <TableCell>
                    {user.id ? (
                      pendingAction?.id === user.id ? (
                        <div className="flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            color={
                              pendingAction.action === "suspend"
                                ? "danger"
                                : "success"
                            }
                            isLoading={submitting}
                            onPress={() =>
                              handleAction(user, pendingAction.action)
                            }
                          >
                            Confirm
                          </Button>
                          <Button
                            size="sm"
                            variant="flat"
                            onPress={() => setPendingAction(null)}
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {user.suspended ? (
                            <Button
                              size="sm"
                              color="success"
                              variant="flat"
                              onPress={() =>
                                setPendingAction({
                                  id: user.id as string,
                                  action: "activate",
                                })
                              }
                            >
                              Reactivate
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              color="danger"
                              variant="flat"
                              onPress={() =>
                                setPendingAction({
                                  id: user.id as string,
                                  action: "suspend",
                                })
                              }
                            >
                              Suspend
                            </Button>
                          )}
                        </div>
                      )
                    ) : (
                      "—"
                    )}
                  </TableCell>
                </TableRow>
              )}
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
