"use client";

import { useEffect, useState } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { useAuth } from "@/lib/auth/auth-context";
import { ApiError } from "@/lib/auth/api";
import { getAdminDashboard } from "@/lib/admin/admin-api";
import type { AdminDashboardDTO } from "@/lib/types";

const formatNumber = (value?: number) =>
  value == null ? "—" : value.toLocaleString();

export default function AdminDashboardPage() {
  const { token, isHydrating } = useAuth();
  const [dashboard, setDashboard] = useState<AdminDashboardDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    async function loadDashboard() {
      if (isHydrating) return;
      setLoading(true);
      setError(null);
      try {
        const data = await getAdminDashboard(token);
        if (!alive) return;
        setDashboard(data);
      } catch (err) {
        if (!alive) return;
        const message =
          err instanceof ApiError
            ? err.message
            : "Unable to load dashboard statistics.";
        setError(message);
      } finally {
        if (alive) setLoading(false);
      }
    }

    loadDashboard();
    return () => {
      alive = false;
    };
  }, [token, isHydrating]);

  return (
    <div className="px-6 py-6 md:px-10 md:py-8 space-y-6">
      <section className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">System overview</h1>
          <p className="text-sm text-default-500">
            Real-time admin metrics for the HealthApp platform.
          </p>
        </div>
        <Button
          radius="full"
          variant="flat"
          onPress={() => window.location.reload()}
          isDisabled={loading}
        >
          Refresh stats
        </Button>
      </section>

      {error ? (
        <div className="rounded-xl bg-danger text-danger-foreground px-4 py-3 text-sm">
          {error}
        </div>
      ) : null}

      <section className="grid gap-4 lg:grid-cols-4">
        {[
          { label: "Total users", value: dashboard?.totalUsers },
          { label: "Patients", value: dashboard?.totalPatients },
          { label: "Doctors", value: dashboard?.totalDoctors },
          { label: "Admins", value: dashboard?.totalAdmins },
        ].map((stat) => (
          <Card key={stat.label} className="min-h-[120px]">
            <CardBody className="flex flex-col justify-between">
              <p className="text-xs uppercase tracking-wide text-default-500">
                {stat.label}
              </p>
              <p className="text-2xl font-semibold">
                {loading ? "…" : formatNumber(stat.value)}
              </p>
            </CardBody>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div>
              <h2 className="text-lg font-semibold">Appointments by status</h2>
              <p className="text-sm text-default-500">
                Active counts across the system.
              </p>
            </div>
          </CardHeader>
          <CardBody className="grid gap-3 sm:grid-cols-2">
            {[
              { label: "Pending", value: dashboard?.pendingAppointments },
              { label: "Confirmed", value: dashboard?.confirmedAppointments },
              { label: "Completed", value: dashboard?.completedAppointments },
              { label: "Cancelled", value: dashboard?.cancelledAppointments },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-large border border-default-200 bg-content2 px-4 py-3"
              >
                <p className="text-xs uppercase text-default-500">
                  {stat.label}
                </p>
                <p className="text-xl font-semibold">
                  {loading ? "…" : formatNumber(stat.value)}
                </p>
              </div>
            ))}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <h2 className="text-lg font-semibold">Quality & approvals</h2>
              <p className="text-sm text-default-500">
                Reviews and pending registrations.
              </p>
            </div>
          </CardHeader>
          <CardBody className="grid gap-3">
            {[
              { label: "Total reviews", value: dashboard?.totalReviews },
              { label: "Pending doctors", value: dashboard?.pendingDoctors },
              { label: "Recent activity", value: dashboard?.recentActivity },
            ].map((stat) => (
              <div
                key={stat.label}
                className="flex items-center justify-between rounded-large border border-default-200 bg-content2 px-4 py-3"
              >
                <span className="text-sm text-default-600">
                  {stat.label}
                </span>
                <span className="text-lg font-semibold">
                  {loading ? "…" : formatNumber(stat.value)}
                </span>
              </div>
            ))}
          </CardBody>
        </Card>
      </section>
    </div>
  );
}
