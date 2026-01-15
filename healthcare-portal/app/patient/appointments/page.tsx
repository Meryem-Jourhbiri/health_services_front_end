"use client";

import { useEffect, useMemo, useState } from "react";
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
  bookAppointment,
  cancelAppointment,
  getAppointments,
  getAvailableSlots,
  getDoctors,
  rescheduleAppointment,
  type Appointment,
  type AppointmentStatus,
  type DoctorSummary,
} from "@/lib/appointments/appointments-api";
import {
  createReview,
  deleteReview,
  updateReview,
  type Review,
} from "@/lib/reviews/reviews-api";

const statusOptions: Array<{ value: AppointmentStatus | "ALL"; label: string }> =
  [
    { value: "ALL", label: "All statuses" },
    { value: "PENDING", label: "Pending" },
    { value: "CONFIRMED", label: "Confirmed" },
    { value: "COMPLETED", label: "Completed" },
    { value: "CANCELLED", label: "Cancelled" },
  ];

const emptyBooking = {
  doctorId: "",
  date: "",
  time: "",
  reason: "",
};

export default function PatientAppointmentsPage() {
  const { user, token, isHydrating } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<DoctorSummary[]>([]);
  const [slots, setSlots] = useState<Array<{ time: string; available: boolean }>>(
    [],
  );
  const [booking, setBooking] = useState(emptyBooking);
  const [filters, setFilters] = useState({
    status: "ALL" as AppointmentStatus | "ALL",
    startDate: "",
    endDate: "",
  });
  const [rescheduleTarget, setRescheduleTarget] = useState<Appointment | null>(
    null,
  );
  const [rescheduleForm, setRescheduleForm] = useState({
    date: "",
    time: "",
  });
  const [reviewTarget, setReviewTarget] = useState<Appointment | null>(null);
  const [reviewForm, setReviewForm] = useState({ rating: "5", comment: "" });
  const [reviewMap, setReviewMap] = useState<Record<string, Review>>({});
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reviewSuccess, setReviewSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const selectedDoctor = useMemo(
    () => doctors.find((item) => item.id === booking.doctorId),
    [doctors, booking.doctorId],
  );

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
        const [appointmentData, doctorData] = await Promise.all([
          getAppointments(
            {
              role: "patient",
              userId: user.id,
              status: filters.status,
              startDate: filters.startDate,
              endDate: filters.endDate,
            },
            token,
          ),
          getDoctors(token),
        ]);
        if (!alive) return;
        setAppointments(appointmentData);
        setDoctors(doctorData);
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

  useEffect(() => {
    let alive = true;

    async function loadSlots() {
      if (!booking.doctorId || !booking.date) {
        setSlots([]);
        return;
      }

      try {
        const slotData = await getAvailableSlots(
          booking.doctorId,
          booking.date,
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
  }, [booking.doctorId, booking.date]);

  async function handleBookingSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) return;
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      await bookAppointment(
        {
          patientId: user.id,
          patientName: user.name,
          doctorId: booking.doctorId,
          date: booking.date,
          time: booking.time,
          reason: booking.reason,
        },
        token,
      );
      setBooking(emptyBooking);
      setSlots([]);
      setSuccess("Appointment requested. Awaiting confirmation.");
      const updated = await getAppointments(
        {
          role: "patient",
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
        e instanceof ApiError
          ? e.message
          : "Unable to book appointment.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCancel(id: string) {
    if (!confirm("Cancel this appointment?")) return;
    if (!user) return;
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      await cancelAppointment(id, token);
      setSuccess("Appointment cancelled.");
      const updated = await getAppointments(
        {
          role: "patient",
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

  function beginReschedule(appointment: Appointment) {
    setRescheduleTarget(appointment);
    setRescheduleForm({ date: appointment.date, time: appointment.time });
  }

  function beginReview(appointment: Appointment) {
    setReviewError(null);
    setReviewSuccess(null);
    setReviewTarget(appointment);
    const existing = reviewMap[appointment.id];
    if (existing) {
      setReviewForm({
        rating: String(existing.rating),
        comment: existing.comment ?? "",
      });
      return;
    }
    setReviewForm({ rating: "5", comment: "" });
  }

  async function handleRescheduleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    if (!user || !rescheduleTarget) return;
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      await rescheduleAppointment(rescheduleTarget.id, rescheduleForm, token);
      setSuccess("Appointment rescheduled.");
      setRescheduleTarget(null);
      const updated = await getAppointments(
        {
          role: "patient",
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

  async function handleReviewSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!reviewTarget) return;
    if (!token) {
      setReviewError("Not authenticated. Please log in again.");
      return;
    }

    setReviewSubmitting(true);
    setReviewError(null);
    setReviewSuccess(null);

    try {
      const payload = {
        appointmentId: reviewTarget.id,
        rating: Number(reviewForm.rating),
        comment: reviewForm.comment.trim() || undefined,
      };
      const existing = reviewMap[reviewTarget.id];
      const saved = existing
        ? await updateReview(token, existing.id, payload)
        : await createReview(token, payload);
      setReviewMap((current) => ({ ...current, [reviewTarget.id]: saved }));
      setReviewSuccess(
        existing ? "Review updated successfully." : "Review submitted.",
      );
      setReviewTarget(null);
    } catch (e) {
      const message =
        e instanceof ApiError ? e.message : "Unable to submit review.";
      setReviewError(message);
    } finally {
      setReviewSubmitting(false);
    }
  }

  async function handleReviewDelete(appointment: Appointment) {
    const existing = reviewMap[appointment.id];
    if (!existing) return;
    if (!token) {
      setReviewError("Not authenticated. Please log in again.");
      return;
    }
    if (!confirm("Delete this review?")) return;
    setReviewSubmitting(true);
    setReviewError(null);
    setReviewSuccess(null);
    try {
      await deleteReview(token, existing.id);
      setReviewMap((current) => {
        const updated = { ...current };
        delete updated[appointment.id];
        return updated;
      });
      setReviewSuccess("Review deleted.");
    } catch (e) {
      const message =
        e instanceof ApiError ? e.message : "Unable to delete review.";
      setReviewError(message);
    } finally {
      setReviewSubmitting(false);
    }
  }

  return (
    <div className="px-6 py-6 md:px-10 md:py-8 space-y-6">
      <section className="grid gap-4 lg:grid-cols-[1.2fr,1fr]">
        <Card>
          <CardHeader>
            <div>
              <h2 className="text-lg font-semibold">Book an appointment</h2>
              <p className="text-sm text-default-500">
                Choose a doctor and request a time slot.
              </p>
            </div>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleBookingSubmit} className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="doctorId"
                  className="text-sm font-medium text-default-600"
                >
                  Doctor
                </label>
                <select
                  id="doctorId"
                  name="doctorId"
                  value={booking.doctorId}
                  onChange={(event) =>
                    setBooking((current) => ({
                      ...current,
                      doctorId: event.target.value,
                      time: "",
                    }))
                  }
                  required
                  className="w-full rounded-large border border-default-200 bg-content1 px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                >
                  <option value="" disabled>
                    Select a doctor
                  </option>
                  {doctors.map((doctor) => (
                    <option key={doctor.id} value={doctor.id}>
                      {doctor.name} · {doctor.specialty}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <Input
                  label="Date"
                  type="date"
                  value={booking.date}
                  onChange={(event) =>
                    setBooking((current) => ({
                      ...current,
                      date: event.target.value,
                      time: "",
                    }))
                  }
                  variant="bordered"
                  required
                />
                <div className="space-y-2">
                  <label
                    htmlFor="slot"
                    className="text-sm font-medium text-default-600"
                  >
                    Time slot
                  </label>
                  <select
                    id="slot"
                    name="slot"
                    value={booking.time}
                    onChange={(event) =>
                      setBooking((current) => ({
                        ...current,
                        time: event.target.value,
                      }))
                    }
                    required
                    className="w-full rounded-large border border-default-200 bg-content1 px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                  >
                    <option value="" disabled>
                      {booking.date ? "Select a time" : "Choose date first"}
                    </option>
                    {slots
                      .filter((slot) => slot.available)
                      .map((slot) => (
                        <option key={slot.time} value={slot.time}>
                          {slot.time}
                        </option>
                      ))}
                  </select>
                </div>
              </div>
              <Input
                label="Reason for visit"
                value={booking.reason}
                onChange={(event) =>
                  setBooking((current) => ({
                    ...current,
                    reason: event.target.value,
                  }))
                }
                variant="bordered"
              />
              {selectedDoctor ? (
                <p className="text-xs text-default-500">
                  Location: {selectedDoctor.location}
                </p>
              ) : null}
              <Button
                type="submit"
                color="primary"
                radius="full"
                isLoading={submitting}
              >
                Request appointment
              </Button>
            </form>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <h2 className="text-lg font-semibold">Filters</h2>
              <p className="text-sm text-default-500">
                Narrow your appointment list.
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
      {reviewError ? <p className="text-sm text-danger">{reviewError}</p> : null}
      {reviewSuccess ? (
        <p className="text-sm text-success">{reviewSuccess}</p>
      ) : null}

      {rescheduleTarget ? (
        <Card>
          <CardHeader>
            <div>
              <h2 className="text-lg font-semibold">Reschedule appointment</h2>
              <p className="text-sm text-default-500">
                {rescheduleTarget.doctorName} · {rescheduleTarget.specialty}
              </p>
            </div>
          </CardHeader>
          <CardBody>
            <form
              onSubmit={handleRescheduleSubmit}
              className="grid gap-3 md:grid-cols-[1fr,1fr,auto]"
            >
              <Input
                label="New date"
                type="date"
                value={rescheduleForm.date}
                onChange={(event) =>
                  setRescheduleForm((current) => ({
                    ...current,
                    date: event.target.value,
                  }))
                }
                variant="bordered"
                required
              />
              <Input
                label="New time"
                type="time"
                value={rescheduleForm.time}
                onChange={(event) =>
                  setRescheduleForm((current) => ({
                    ...current,
                    time: event.target.value,
                  }))
                }
                variant="bordered"
                required
              />
              <div className="flex items-end gap-2">
                <Button
                  type="submit"
                  color="primary"
                  radius="full"
                  isLoading={submitting}
                >
                  Save
                </Button>
                <Button
                  variant="light"
                  radius="full"
                  onPress={() => setRescheduleTarget(null)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      ) : null}

      {reviewTarget ? (
        <Card>
          <CardHeader>
            <div>
              <h2 className="text-lg font-semibold">Leave a review</h2>
              <p className="text-sm text-default-500">
                {reviewTarget.doctorName} - {reviewTarget.specialty}
              </p>
            </div>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div className="grid gap-3 md:grid-cols-[180px,1fr]">
                <div className="space-y-2">
                  <label
                    htmlFor="rating"
                    className="text-sm font-medium text-default-600"
                  >
                    Rating
                  </label>
                  <select
                    id="rating"
                    value={reviewForm.rating}
                    onChange={(event) =>
                      setReviewForm((current) => ({
                        ...current,
                        rating: event.target.value,
                      }))
                    }
                    className="w-full rounded-large border border-default-200 bg-content1 px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                  >
                    {[5, 4, 3, 2, 1].map((value) => (
                      <option key={value} value={String(value)}>
                        {value} stars
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="comment"
                    className="text-sm font-medium text-default-600"
                  >
                    Comment
                  </label>
                  <textarea
                    id="comment"
                    className="w-full rounded-large border border-default-200 bg-content1 px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                    rows={3}
                    value={reviewForm.comment}
                    onChange={(event) =>
                      setReviewForm((current) => ({
                        ...current,
                        comment: event.target.value,
                      }))
                    }
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-2">
                <Button
                  type="submit"
                  color="primary"
                  radius="full"
                  isLoading={reviewSubmitting}
                >
                  Submit review
                </Button>
                <Button
                  variant="light"
                  radius="full"
                  onPress={() => setReviewTarget(null)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <div>
            <h2 className="text-lg font-semibold">Your appointments</h2>
            <p className="text-sm text-default-500">
              Track upcoming visits and manage changes.
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
            <Table aria-label="Patient appointments">
              <TableHeader>
                <TableColumn>Doctor</TableColumn>
                <TableColumn>Date</TableColumn>
                <TableColumn>Reason</TableColumn>
                <TableColumn>Status</TableColumn>
                <TableColumn align="end">Actions</TableColumn>
              </TableHeader>
              <TableBody items={appointments}>
                {(appointment) => (
                  <TableRow key={appointment.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {appointment.doctorName}
                        </span>
                        <span className="text-xs text-default-500">
                          {appointment.specialty}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col text-sm">
                        <span>{appointment.date}</span>
                        <span className="text-xs text-default-500">
                          {appointment.time}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{appointment.reason}</TableCell>
                    <TableCell>
                      <StatusChip status={appointment.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {appointment.status === "COMPLETED" ? (
                          <>
                            <Button
                              size="sm"
                              variant="flat"
                              onPress={() => beginReview(appointment)}
                            >
                              {reviewMap[appointment.id]
                                ? "Edit review"
                                : "Review"}
                            </Button>
                            {reviewMap[appointment.id] ? (
                              <Button
                                size="sm"
                                color="danger"
                                variant="light"
                                onPress={() => handleReviewDelete(appointment)}
                              >
                                Delete
                              </Button>
                            ) : null}
                          </>
                        ) : null}
                        <Button
                          size="sm"
                          variant="light"
                          onPress={() => beginReschedule(appointment)}
                        >
                          Reschedule
                        </Button>
                        <Button
                          size="sm"
                          color="danger"
                          variant="light"
                          onPress={() => handleCancel(appointment.id)}
                          isDisabled={appointment.status === "CANCELLED"}
                        >
                          Cancel
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardBody>
      </Card>
    </div>
  );
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
