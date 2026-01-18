
"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { useAuth } from "@/lib/auth/auth-context";
import { ApiError } from "@/lib/auth/api";
import type {
  AppointmentDTO,
  BookAppointmentRequest,
  DoctorPublicProfileDTO,
  LocalTime,
  ReviewDTO,
} from "@/lib/types";
import { getDoctorDetails } from "@/lib/doctors/doctor-search-api";
import {
  bookAppointment,
  getAvailableSlots,
  getAppointments,
  type TimeSlot,
} from "@/lib/appointments/appointments-api";
import {
  createReview,
  deleteReview,
  getReviewsByDoctor,
  updateReview,
} from "@/lib/reviews/reviews-api";

export default function DoctorDetailPage() {
  const { token, user } = useAuth();
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = String(params?.id ?? "");
  const shouldBook = searchParams.get("action") === "book";
  const reviewAppointmentId = searchParams.get("appointmentId");
  const shouldReview = searchParams.get("review") === "1";
  const reviewPageSize = 6;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [doctor, setDoctor] = useState<DoctorPublicProfileDTO | null>(null);

  // Booking state
  const [showBooking, setShowBooking] = useState(shouldBook);
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [bookingEndTime, setBookingEndTime] = useState("");
  const [reason, setReason] = useState("");
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);
  const [availabilityByDate, setAvailabilityByDate] = useState<
    Record<string, TimeSlot[]>
  >({});
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);

  // Reviews state
  const [reviews, setReviews] = useState<ReviewDTO[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState<string | null>(null);
  const [reviewPage, setReviewPage] = useState(0);
  const [reviewTotalPages, setReviewTotalPages] = useState(1);
  const [reviewReloadKey, setReviewReloadKey] = useState(0);
  const [completedAppointments, setCompletedAppointments] = useState<AppointmentDTO[]>(
    [],
  );
  const [reviewForm, setReviewForm] = useState({
    appointmentId: "",
    rating: 0,
    comment: "",
  });
  const [reviewEditId, setReviewEditId] = useState<string | null>(null);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reviewSuccess, setReviewSuccess] = useState<string | null>(null);

  // Load doctor details
  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    async function run() {
      setLoading(true);
      setError(null);

      try {
        const data = await getDoctorDetails(token, id);
        if (!cancelled) setDoctor(data);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load doctor.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [token, id]);

  function toDateString(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function formatDateLabel(date: string) {
    const [year, month, day] = date.split("-").map(Number);
    if (!year || !month || !day) return date;
    const dateObj = new Date(year, month - 1, day);
    return dateObj.toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  }

  // Load available slots for the next two weeks
  useEffect(() => {
    let cancelled = false;

    async function loadAvailability() {
      if (!id || !showBooking) {
        setAvailabilityByDate({});
        return;
      }

      setAvailabilityLoading(true);
      setAvailabilityError(null);

      try {
        const start = new Date();
        const dates = Array.from({ length: 14 }, (_, index) => {
          const next = new Date(start);
          next.setDate(start.getDate() + index);
          return toDateString(next);
        });

        const responses = await Promise.all(
          dates.map((date) => getAvailableSlots(id, date, token)),
        );

        if (cancelled) return;

        const byDate: Record<string, TimeSlot[]> = {};
        dates.forEach((date, index) => {
          const available = responses[index].filter((slot) => slot.available);
          if (available.length) {
            byDate[date] = available;
          }
        });
        setAvailabilityByDate(byDate);
      } catch (e) {
        if (!cancelled) {
          setAvailabilityByDate({});
          setAvailabilityError(
            e instanceof Error ? e.message : "Failed to load availability.",
          );
        }
      } finally {
        if (!cancelled) setAvailabilityLoading(false);
      }
    }

    loadAvailability();
    return () => {
      cancelled = true;
    };
  }, [id, token, showBooking]);

  // Load reviews for the doctor
  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    async function loadReviews() {
      setReviewsLoading(true);
      setReviewsError(null);
      try {
        const data = await getReviewsByDoctor(token, id, reviewPage, reviewPageSize);
        if (cancelled) return;
        setReviews(data.content ?? []);
        setReviewTotalPages(Math.max(1, data.totalPages ?? 1));
      } catch (e) {
        if (!cancelled) {
          setReviewsError(
            e instanceof Error ? e.message : "Failed to load reviews.",
          );
        }
      } finally {
        if (!cancelled) setReviewsLoading(false);
      }
    }

    loadReviews();
    return () => {
      cancelled = true;
    };
  }, [id, token, reviewPage, reviewPageSize, reviewReloadKey]);

  // Load completed appointments for review eligibility
  useEffect(() => {
    let cancelled = false;

    async function loadCompletedAppointments() {
      if (!user || user.role !== "PATIENT" || !id) {
        setCompletedAppointments([]);
        return;
      }

      try {
        const data = await getAppointments(
          {
            role: "PATIENT",
            userId: user.id,
            status: "COMPLETED",
          },
          token,
        );
        if (cancelled) return;
        const relevant = data.filter((appointment) => appointment.doctorId === id);
        setCompletedAppointments(relevant);
      } catch {
        if (!cancelled) setCompletedAppointments([]);
      }
    }

    loadCompletedAppointments();
    return () => {
      cancelled = true;
    };
  }, [user, token, id]);

  useEffect(() => {
    if (!reviewAppointmentId) return;
    setReviewForm((current) => ({
      ...current,
      appointmentId: reviewAppointmentId,
    }));
  }, [reviewAppointmentId]);

  const availableDates = Object.keys(availabilityByDate);
  const selectedSlots = bookingDate ? availabilityByDate[bookingDate] ?? [] : [];
  const hasAvailability = availableDates.length > 0;

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !bookingDate || !bookingTime || !bookingEndTime) return;

    setBookingSubmitting(true);
    setBookingError(null);
    setBookingSuccess(null);

    try {
      const toLocalTime = (value: string): LocalTime => {
        const [hour, minute, second] = value.split(":").map(Number);
        return {
          hour: Number.isFinite(hour) ? hour : 0,
          minute: Number.isFinite(minute) ? minute : 0,
          second: Number.isFinite(second) ? second : 0,
          nano: 0,
        };
      };
      const payload: BookAppointmentRequest = {
        appointmentDate: bookingDate,
        doctorId: id,
        startTime: toLocalTime(bookingTime),
        endTime: toLocalTime(bookingEndTime),
        reason: reason || "General consultation",
      };
      await bookAppointment(
        payload,
        token,
        { id: user.id, name: user.name },
      );
      setBookingSuccess("Appointment booked successfully! Check your appointments page.");
      setBookingDate("");
      setBookingTime("");
      setBookingEndTime("");
      setTimeout(() => {
        router.push("/patient/appointments");
      }, 2000);
    } catch (e) {
      const msg =
        e instanceof ApiError ? e.message : "Unable to book appointment.";
      setBookingError(msg);
    } finally {
      setBookingSubmitting(false);
    }
  };

  const reviewedAppointmentIds = new Set(
    reviews.map((review) => review.appointmentId).filter(Boolean) as string[],
  );
  const eligibleAppointments = completedAppointments.filter(
    (appointment) => appointment.id && !reviewedAppointmentIds.has(appointment.id),
  );

  const handleReviewSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user || user.role !== "PATIENT") return;

    setReviewSubmitting(true);
    setReviewError(null);
    setReviewSuccess(null);

    if (!reviewForm.appointmentId) {
      setReviewSubmitting(false);
      setReviewError("Select a completed appointment to review.");
      return;
    }
    if (reviewForm.rating < 1 || reviewForm.rating > 5) {
      setReviewSubmitting(false);
      setReviewError("Rating must be between 1 and 5.");
      return;
    }

    try {
      const payload = {
        appointmentId: reviewForm.appointmentId,
        rating: reviewForm.rating,
        comment: reviewForm.comment?.trim() || undefined,
      };

      if (reviewEditId) {
        await updateReview(token, reviewEditId, payload);
        setReviewSuccess("Review updated.");
      } else {
        await createReview(token, payload);
        setReviewSuccess("Review submitted.");
      }

      setReviewEditId(null);
      setReviewForm({ appointmentId: "", rating: 0, comment: "" });
      setReviewPage(0);
      setReviewReloadKey((value) => value + 1);
    } catch (e) {
      const message = e instanceof ApiError ? e.message : "Unable to submit review.";
      setReviewError(message);
    } finally {
      setReviewSubmitting(false);
    }
  };

  const beginEditReview = (review: ReviewDTO) => {
    if (!review.id) return;
    setReviewEditId(review.id);
    setReviewForm({
      appointmentId: review.appointmentId ?? "",
      rating: review.rating ?? 0,
      comment: review.comment ?? "",
    });
    setReviewError(null);
    setReviewSuccess(null);
  };

  const handleDeleteReview = async (review: ReviewDTO) => {
    if (!review.id) return;
    if (!confirm("Delete this review?")) return;
    setReviewSubmitting(true);
    setReviewError(null);
    setReviewSuccess(null);
    try {
      await deleteReview(token, review.id);
      setReviewSuccess("Review deleted.");
      setReviewEditId(null);
      setReviewForm({ appointmentId: "", rating: 0, comment: "" });
      setReviewPage(0);
      setReviewReloadKey((value) => value + 1);
    } catch (e) {
      const message = e instanceof ApiError ? e.message : "Unable to delete review.";
      setReviewError(message);
    } finally {
      setReviewSubmitting(false);
    }
  };

  const formatReviewDate = (value?: string) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const renderStars = (rating?: number) => {
    const value = Math.round(rating ?? 0);
    const filled = Math.max(0, Math.min(5, value));
    return "⭐".repeat(filled) + "☆".repeat(5 - filled);
  };

  const formatLocalTime = (time?: LocalTime | string) => {
    if (!time) return "";
    if (typeof time === "string") {
      return time.slice(0, 5);
    }
    const hour = time.hour ?? 0;
    const minute = time.minute ?? 0;
    return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
  };

  const formatTimeRange = (start?: LocalTime | string, end?: LocalTime | string) => {
    const startLabel = formatLocalTime(start);
    if (!startLabel) return "";
    const endLabel = formatLocalTime(end);
    return endLabel ? `${startLabel} - ${endLabel}` : startLabel;
  };

  const name = doctor
    ? `Dr. ${doctor.firstName ?? ""} ${doctor.lastName ?? ""}`.trim()
    : "Doctor";

  const specialization = doctor?.specialization ?? "—";
  const rating =
    doctor?.averageRating != null ? Number(doctor.averageRating).toFixed(1) : "—";
  const bio = doctor?.bio ?? null;

  const clinicAddress = doctor?.clinicAddress ?? null;
  const education = doctor?.education ?? null;
  const experience = doctor?.experience != null ? String(doctor.experience) : null;
  const reviewCount = doctor?.reviewCount != null ? String(doctor.reviewCount) : "0";

  const languages = doctor?.languages
    ?.filter((language) => language && language.trim())
    .join(", ");

  const isPatient = user?.role === "PATIENT";
  const canReview = isPatient && completedAppointments.length > 0;
  const hasEligibleAppointments = eligibleAppointments.length > 0;

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <Link href="/patient/doctors" className="text-primary hover:underline text-sm">
          ← Back to search
        </Link>

        {loading && (
          <Card>
            <CardBody className="text-center py-8">
              <p className="text-default-500">Loading doctor details...</p>
            </CardBody>
          </Card>
        )}

        {error && (
          <Card className="bg-danger-50 border border-danger-200">
            <CardBody>
              <p className="text-danger">{error}</p>
            </CardBody>
          </Card>
        )}

        {!loading && !error && doctor && (
          <>
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Doctor Info */}
              <div className="lg:col-span-2 space-y-4">
                <Card>
                  <CardHeader className="flex flex-col gap-2">
                    <div>
                      <h1 className="text-3xl font-semibold">{name}</h1>
                      <p className="text-lg text-default-500">{specialization}</p>
                    </div>
                  </CardHeader>
                  <CardBody className="space-y-4">
                    <div className="grid gap-3 sm:grid-cols-3">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-default-500">
                          Rating
                        </p>
                        <p className="text-2xl font-semibold">⭐ {rating}</p>
                        <p className="text-xs text-default-500">
                          {reviewCount} reviews
                        </p>
                      </div>
                      {experience && (
                        <div>
                          <p className="text-xs uppercase tracking-wide text-default-500">
                            Experience
                          </p>
                          <p className="text-2xl font-semibold">{experience}</p>
                          <p className="text-xs text-default-500">years</p>
                        </div>
                      )}
                    </div>

                    {bio && (
                      <div>
                        <p className="text-sm font-semibold text-default-700 mb-2">
                          About
                        </p>
                        <p className="text-sm text-default-600">{bio}</p>
                      </div>
                    )}

                    <div className="space-y-2 pt-4 border-t border-default-200">
                      {clinicAddress && (
                        <div>
                          <p className="text-xs uppercase tracking-wide text-default-500">
                            Clinic Address
                          </p>
                          <p className="text-sm">{clinicAddress}</p>
                        </div>
                      )}
                      {education && (
                        <div>
                          <p className="text-xs uppercase tracking-wide text-default-500">
                            Education
                          </p>
                          <p className="text-sm">{education}</p>
                        </div>
                      )}
                      {languages && (
                        <div>
                          <p className="text-xs uppercase tracking-wide text-default-500">
                            Languages
                          </p>
                          <p className="text-sm">{languages}</p>
                        </div>
                      )}
                    </div>
                  </CardBody>
                </Card>
              </div>

              {/* Booking Widget */}
              <Card className="lg:sticky lg:top-6 h-fit">
                <CardHeader>
                  <h2 className="text-lg font-semibold">
                    {showBooking ? "Book Appointment" : "Schedule"}
                  </h2>
                </CardHeader>
                <CardBody>
                  {showBooking ? (
                    <form onSubmit={handleBookingSubmit} className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-default-700 block mb-2">
                          Available Dates *
                        </label>
                        {availabilityLoading ? (
                          <p className="text-sm text-default-500">
                            Loading availability...
                          </p>
                        ) : availabilityError ? (
                          <p className="text-sm text-danger">{availabilityError}</p>
                        ) : availableDates.length === 0 ? (
                          <p className="text-sm text-default-500">
                            No availability found for the next two weeks.
                          </p>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {availableDates.map((date) => (
                              <Button
                                key={date}
                                type="button"
                                variant={
                                  bookingDate === date ? "solid" : "bordered"
                                }
                                color="primary"
                                radius="lg"
                                onPress={() => {
                                  setBookingDate(date);
                                  setBookingTime("");
                                  setBookingEndTime("");
                                }}
                              >
                                {formatDateLabel(date)}
                              </Button>
                            ))}
                          </div>
                        )}
                      </div>

                      {bookingDate && (
                        <div>
                          <label className="text-sm font-medium text-default-700 block mb-2">
                            Select Time *
                          </label>
                          {selectedSlots.length === 0 ? (
                            <p className="text-sm text-default-500">
                              No available times for this date.
                            </p>
                          ) : (
                            <div className="flex flex-wrap gap-2">
                              {selectedSlots.map((slot, index) => (
                                <Button
                                  key={`${slot.time}-${index}`}
                                  type="button"
                                  variant={
                                    bookingTime === slot.time ? "solid" : "bordered"
                                  }
                                  color="primary"
                                  radius="lg"
                                  onPress={() => {
                                    setBookingTime(slot.time);
                                    setBookingEndTime(slot.endTime);
                                  }}
                                >
                                  {slot.endTime
                                    ? `${slot.time} - ${slot.endTime}`
                                    : slot.time}
                                </Button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      <div>
                        <label className="text-sm font-medium text-default-700 block mb-2">
                          Reason for visit
                        </label>
                        <textarea
                          value={reason}
                          onChange={(e) => setReason(e.target.value)}
                          placeholder="Describe your symptoms or reason for visit..."
                          className="w-full rounded-lg border border-default-200 bg-content1 px-3 py-2 text-sm text-foreground placeholder:text-default-400 outline-none focus:border-primary"
                          rows={3}
                        />
                      </div>

                      {bookingError && (
                        <div className="rounded-lg bg-danger-50 border border-danger-200 p-3">
                          <p className="text-xs text-danger">{bookingError}</p>
                        </div>
                      )}

                      {bookingSuccess && (
                        <div className="rounded-lg bg-success-50 border border-success-200 p-3">
                          <p className="text-xs text-success">{bookingSuccess}</p>
                        </div>
                      )}

                      <Button
                        type="submit"
                        color="primary"
                        radius="lg"
                        className="w-full"
                        isLoading={bookingSubmitting}
                        isDisabled={
                          !hasAvailability ||
                          availabilityLoading ||
                          !bookingDate ||
                          !bookingTime ||
                          !bookingEndTime
                        }
                      >
                        Confirm Booking
                      </Button>

                      <Button
                        type="button"
                        variant="light"
                        className="w-full"
                        onPress={() => setShowBooking(false)}
                      >
                        Cancel
                      </Button>
                    </form>
                  ) : (
                    <Button
                      color="primary"
                      radius="lg"
                      className="w-full"
                      onPress={() => setShowBooking(true)}
                    >
                      Book Appointment
                    </Button>
                  )}
                </CardBody>
              </Card>
            </div>

            <div id="reviews" className="space-y-4">
              <Card>
                <CardHeader className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold">Reviews</h2>
                    <p className="text-sm text-default-500">
                      {reviewCount} total reviews
                    </p>
                  </div>
                  {reviewsLoading && (
                    <p className="text-xs text-default-400">Loading...</p>
                  )}
                </CardHeader>
                <CardBody className="space-y-4">
                  {reviewsError && (
                    <div className="rounded-lg bg-danger-50 border border-danger-200 p-3">
                      <p className="text-xs text-danger">{reviewsError}</p>
                    </div>
                  )}

                  {!reviewsLoading && reviews.length === 0 && !reviewsError && (
                    <p className="text-sm text-default-500">
                      No reviews yet. Be the first to share your feedback.
                    </p>
                  )}

                  {reviews.length > 0 && (
                    <div className="space-y-3">
                      {reviews.map((review) => {
                        const reviewKey =
                          review.id ?? `${review.patientId}-${review.createdAt}`;
                        const isAuthor =
                          isPatient && review.patientId && review.patientId === user?.id;
                        return (
                          <div
                            key={reviewKey}
                            className="rounded-lg border border-default-200 bg-content1 p-4"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="text-sm font-semibold">
                                  {review.patientName ?? "Patient"}
                                </p>
                                <p className="text-xs text-default-500">
                                  {formatReviewDate(review.createdAt)}
                                </p>
                              </div>
                              <p className="text-sm">{renderStars(review.rating)}</p>
                            </div>
                            <p className="text-sm text-default-600 mt-2">
                              {review.comment?.trim()
                                ? review.comment
                                : "No comment provided."}
                            </p>
                            {isAuthor && (
                              <div className="flex gap-2 mt-3">
                                <Button
                                  size="sm"
                                  variant="flat"
                                  onPress={() => beginEditReview(review)}
                                  isDisabled={reviewSubmitting}
                                >
                                  Edit
                                </Button>
                                <Button
                                  size="sm"
                                  color="danger"
                                  variant="flat"
                                  onPress={() => handleDeleteReview(review)}
                                  isDisabled={reviewSubmitting}
                                >
                                  Delete
                                </Button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {reviewTotalPages > 1 && (
                    <div className="flex items-center justify-between pt-2">
                      <Button
                        size="sm"
                        variant="flat"
                        onPress={() => setReviewPage((prev) => Math.max(0, prev - 1))}
                        isDisabled={reviewPage === 0 || reviewsLoading}
                      >
                        Previous
                      </Button>
                      <span className="text-xs text-default-500">
                        Page {reviewPage + 1} of {reviewTotalPages}
                      </span>
                      <Button
                        size="sm"
                        variant="flat"
                        onPress={() =>
                          setReviewPage((prev) =>
                            Math.min(reviewTotalPages - 1, prev + 1),
                          )
                        }
                        isDisabled={reviewPage + 1 >= reviewTotalPages || reviewsLoading}
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </CardBody>
              </Card>

              {isPatient && (
                <Card>
                  <CardHeader className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold">
                        {reviewEditId ? "Edit your review" : "Leave a review"}
                      </h3>
                      <p className="text-sm text-default-500">
                        One review per completed appointment.
                      </p>
                    </div>
                    {shouldReview && (
                      <span className="text-xs text-default-400">
                        Review requested
                      </span>
                    )}
                  </CardHeader>
                  <CardBody className="space-y-4">
                    {!canReview && !reviewEditId ? (
                      <p className="text-sm text-default-500">
                        Complete an appointment with this doctor to leave a review.
                      </p>
                    ) : !hasEligibleAppointments && !reviewEditId ? (
                      <p className="text-sm text-default-500">
                        You have already reviewed your completed appointments.
                      </p>
                    ) : (
                      <form onSubmit={handleReviewSubmit} className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-default-700 block mb-2">
                            Appointment *
                          </label>
                          <select
                            value={reviewForm.appointmentId}
                            onChange={(e) =>
                              setReviewForm((current) => ({
                                ...current,
                                appointmentId: e.target.value,
                              }))
                            }
                            disabled={Boolean(reviewEditId)}
                            className="w-full rounded-lg border border-default-200 bg-content1 px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                          >
                            <option value="">Select completed appointment</option>
                            {(reviewEditId
                              ? completedAppointments.filter(
                                  (appointment) =>
                                    appointment.id === reviewForm.appointmentId,
                                )
                              : eligibleAppointments
                            ).map((appointment) => (
                              <option key={appointment.id} value={appointment.id}>
                                {appointment.appointmentDate ?? "Unknown date"} ·{" "}
                                {formatTimeRange(
                                  appointment.startTime,
                                  appointment.endTime,
                                ) || "Time unavailable"}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="text-sm font-medium text-default-700 block mb-2">
                            Rating *
                          </label>
                          <div className="flex items-center gap-2 flex-wrap">
                            {[1, 2, 3, 4, 5].map((value) => (
                              <Button
                                key={value}
                                type="button"
                                size="sm"
                                variant={reviewForm.rating >= value ? "solid" : "bordered"}
                                color="primary"
                                onPress={() =>
                                  setReviewForm((current) => ({
                                    ...current,
                                    rating: value,
                                  }))
                                }
                              >
                                {reviewForm.rating >= value ? "⭐" : "☆"}
                              </Button>
                            ))}
                            <span className="text-xs text-default-500">
                              {reviewForm.rating ? `${reviewForm.rating}/5` : "Pick a rating"}
                            </span>
                          </div>
                        </div>

                        <div>
                          <label className="text-sm font-medium text-default-700 block mb-2">
                            Comment
                          </label>
                          <textarea
                            value={reviewForm.comment}
                            onChange={(e) =>
                              setReviewForm((current) => ({
                                ...current,
                                comment: e.target.value,
                              }))
                            }
                            placeholder="Share details about your visit (optional)"
                            className="w-full rounded-lg border border-default-200 bg-content1 px-3 py-2 text-sm text-foreground placeholder:text-default-400 outline-none focus:border-primary"
                            rows={3}
                          />
                        </div>

                        {reviewError && (
                          <div className="rounded-lg bg-danger-50 border border-danger-200 p-3">
                            <p className="text-xs text-danger">{reviewError}</p>
                          </div>
                        )}

                        {reviewSuccess && (
                          <div className="rounded-lg bg-success-50 border border-success-200 p-3">
                            <p className="text-xs text-success">{reviewSuccess}</p>
                          </div>
                        )}

                        <div className="flex flex-wrap gap-2">
                          <Button
                            type="submit"
                            color="primary"
                            radius="lg"
                            isLoading={reviewSubmitting}
                            isDisabled={!reviewForm.appointmentId || reviewForm.rating === 0}
                          >
                            {reviewEditId ? "Update Review" : "Submit Review"}
                          </Button>
                          {reviewEditId && (
                            <Button
                              type="button"
                              variant="light"
                              onPress={() => {
                                setReviewEditId(null);
                                setReviewForm({ appointmentId: "", rating: 0, comment: "" });
                                setReviewError(null);
                                setReviewSuccess(null);
                              }}
                            >
                              Cancel
                            </Button>
                          )}
                        </div>
                      </form>
                    )}
                  </CardBody>
                </Card>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
