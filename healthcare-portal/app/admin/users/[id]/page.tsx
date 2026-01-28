"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { useAuth } from "@/lib/auth/auth-context";
import { ApiError } from "@/lib/auth/api";
import {
  activateAdminUser,
  getAdminUser,
  suspendAdminUser,
} from "@/lib/admin/admin-api";
import type { AdminUserDTO } from "@/lib/types";

type PendingAction = "suspend" | "activate";

export default function AdminUserDetailPage() {
  const { token, isHydrating } = useAuth();
  const router = useRouter();
  const params = useParams();
  const userId = params?.id as string | undefined;

  const [user, setUser] = useState<AdminUserDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);

  useEffect(() => {
    let alive = true;

    async function loadUser() {
      if (isHydrating) return;
      if (!userId) return;
      setLoading(true);
      setError(null);

      try {
        const data = await getAdminUser(token, userId);
        if (!alive) return;
        setUser(data);
      } catch (err) {
        if (!alive) return;
        const message =
          err instanceof ApiError ? err.message : "Unable to load user.";
        setError(message);
      } finally {
        if (alive) setLoading(false);
      }
    }

    loadUser();
    return () => {
      alive = false;
    };
  }, [token, isHydrating, userId]);

  async function handleAction(action: PendingAction) {
    if (!userId) return;
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      if (action === "suspend") {
        await suspendAdminUser(token, userId);
        setSuccess("User has been suspended.");
      } else {
        await activateAdminUser(token, userId);
        setSuccess("User has been reactivated.");
      }
      const refreshed = await getAdminUser(token, userId);
      setUser(refreshed);
      setPendingAction(null);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Unable to update account.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="px-6 py-6 md:px-10 md:py-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Button
            variant="light"
            size="sm"
            onPress={() => router.push("/admin/users")}
          >
            ← Back to users
          </Button>
          <h1 className="text-2xl font-semibold">User details</h1>
          <p className="text-sm text-default-500">
            {user?.email || "Account information"}
          </p>
        </div>
        {user?.id ? (
          <Link
            className="text-sm text-primary"
            href={`/admin/users/${user.id}`}
          >
            Refresh
          </Link>
        ) : null}
      </div>

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
        <CardHeader>
          <div>
            <h2 className="text-lg font-semibold">Account</h2>
            <p className="text-sm text-default-500">
              Status and profile details for this user.
            </p>
          </div>
        </CardHeader>
        <CardBody className="grid gap-4 md:grid-cols-2">
          <Detail label="Full name">
            {user?.firstName || user?.lastName
              ? `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim()
              : "—"}
          </Detail>
          <Detail label="Email">{user?.email ?? "—"}</Detail>
          <Detail label="Role">{user?.role ?? "—"}</Detail>
          <Detail label="Verified">{user?.verified ? "Yes" : "No"}</Detail>
          <Detail label="Status">
            {user?.suspended ? "Suspended" : "Active"}
          </Detail>
          <Detail label="Created">
            {user?.createdAt
              ? new Date(user.createdAt).toLocaleString()
              : "—"}
          </Detail>
          {user?.specialization ? (
            <Detail label="Specialization">{user.specialization}</Detail>
          ) : null}
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <h2 className="text-lg font-semibold">Account actions</h2>
            <p className="text-sm text-default-500">
              Suspend or reactivate this account.
            </p>
          </div>
        </CardHeader>
        <CardBody className="flex flex-wrap gap-3">
          {pendingAction ? (
            <div className="flex flex-wrap items-center gap-2">
              <Button
                color={pendingAction === "suspend" ? "danger" : "success"}
                isLoading={submitting}
                onPress={() => handleAction(pendingAction)}
              >
                Confirm {pendingAction === "suspend" ? "suspend" : "reactivate"}
              </Button>
              <Button
                variant="flat"
                onPress={() => setPendingAction(null)}
              >
                Cancel
              </Button>
            </div>
          ) : user?.suspended ? (
            <Button
              color="success"
              variant="flat"
              onPress={() => setPendingAction("activate")}
              isDisabled={loading}
            >
              Reactivate account
            </Button>
          ) : (
            <Button
              color="danger"
              variant="flat"
              onPress={() => setPendingAction("suspend")}
              isDisabled={loading}
            >
              Suspend account
            </Button>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

function Detail({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="rounded-large border border-default-200 bg-content2 px-4 py-3">
      <p className="text-xs uppercase text-default-500">{label}</p>
      <div className="text-sm font-medium text-foreground">{children}</div>
    </div>
  );
}
