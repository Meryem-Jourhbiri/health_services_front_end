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
import {
  approveDoctor,
  getPendingDoctors,
  rejectDoctor,
} from "@/lib/admin/admin-api";
import type { DoctorApprovalDTO, PageDoctorApprovalDTO } from "@/lib/types";

export default function AdminDoctorApprovalsPage() {
  const { token, isHydrating } = useAuth();
  const [data, setData] = useState<PageDoctorApprovalDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    let alive = true;

    async function loadPending() {
      if (isHydrating) return;
      setLoading(true);
      setError(null);
      try {
        const response = await getPendingDoctors(token, { page, size });
        if (!alive) return;
        setData(response);
      } catch (err) {
        if (!alive) return;
        const message =
          err instanceof ApiError
            ? err.message
            : "Unable to load pending doctors.";
        setError(message);
      } finally {
        if (alive) setLoading(false);
      }
    }

    loadPending();
    return () => {
      alive = false;
    };
  }, [token, isHydrating, page, size]);

  const doctors = useMemo(() => data?.content ?? [], [data]);
  const totalPages = data?.totalPages ?? 1;

  async function handleApprove(doctor: DoctorApprovalDTO) {
    if (!doctor.id) return;
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      await approveDoctor(token, doctor.id);
      setSuccess(`${doctor.email || "Doctor"} approved.`);
      const response = await getPendingDoctors(token, { page, size });
      setData(response);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Unable to approve doctor.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleReject(doctor: DoctorApprovalDTO) {
    if (!doctor.id) return;
    if (!rejectReason.trim()) {
      setError("Rejection reason is required.");
      return;
    }
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      await rejectDoctor(token, doctor.id, rejectReason.trim());
      setSuccess(`${doctor.email || "Doctor"} rejected.`);
      setRejectingId(null);
      setRejectReason("");
      const response = await getPendingDoctors(token, { page, size });
      setData(response);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Unable to reject doctor.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="px-6 py-6 md:px-10 md:py-8 space-y-6">
      <section className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Doctor approvals</h1>
          <p className="text-sm text-default-500">
            Review pending doctor registrations.
          </p>
        </div>
      </section>

      <Card>
        <CardHeader className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Pending doctors</h2>
            <p className="text-sm text-default-500">
              {loading
                ? "Loading approvals..."
                : `${data?.totalElements ?? 0} pending requests`}
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
            {[10, 20, 50].map((option) => (
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
          {success ? (
            <div className="mb-4 rounded-xl bg-success text-success-foreground px-4 py-3 text-sm">
              {success}
            </div>
          ) : null}

          <Table aria-label="Pending doctors" removeWrapper>
            <TableHeader>
              <TableColumn>Doctor</TableColumn>
              <TableColumn>Specialization</TableColumn>
              <TableColumn>License</TableColumn>
              <TableColumn>Experience</TableColumn>
              <TableColumn>Submitted</TableColumn>
              <TableColumn>Actions</TableColumn>
            </TableHeader>
            <TableBody
              items={doctors}
              emptyContent={loading ? "Loading..." : "No pending doctors"}
            > 
              {(doctor) => (
                <TableRow
                  key={
                    doctor.id ??
                    doctor.email ??
                    `${doctor.firstName ?? ""}-${doctor.lastName ?? ""}-${doctor.createdAt ?? ""}`
                  }
                >
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {doctor.firstName || doctor.lastName
                          ? `${doctor.firstName ?? ""} ${doctor.lastName ?? ""}`.trim()
                          : "—"}
                      </span>
                      <span className="text-xs text-default-500">
                        {doctor.email ?? "—"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{doctor.specialization ?? "—"}</TableCell>
                  <TableCell>{doctor.licenseNumber ?? "—"}</TableCell>
                  <TableCell>
                    {doctor.experience != null
                      ? `${doctor.experience} yrs`
                      : "—"}
                  </TableCell>
                  <TableCell>
                    {doctor.createdAt
                      ? new Date(doctor.createdAt).toLocaleDateString()
                      : "—"}
                  </TableCell>
                  <TableCell>
                    {doctor.id ? (
                      rejectingId === doctor.id ? (
                        <div className="flex flex-col gap-2">
                          <Input
                            size="sm"
                            label="Rejection reason"
                            value={rejectReason}
                            onValueChange={setRejectReason}
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              color="danger"
                              isLoading={submitting}
                              onPress={() => handleReject(doctor)}
                            >
                              Confirm reject
                            </Button>
                            <Button
                              size="sm"
                              variant="flat"
                              onPress={() => {
                                setRejectingId(null);
                                setRejectReason("");
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            color="success"
                            variant="flat"
                            isLoading={submitting}
                            onPress={() => handleApprove(doctor)}
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            color="danger"
                            variant="flat"
                            onPress={() => {
                              setRejectingId(doctor.id as string);
                              setRejectReason("");
                            }}
                          >
                            Reject
                          </Button>
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
