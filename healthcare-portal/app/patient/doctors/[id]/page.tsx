
"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { useAuth } from "@/lib/auth/auth-context";
import { ApiError } from "@/lib/auth/api";
import type { BookAppointmentRequest, DoctorPublicProfileDTO, LocalTime } from "@/lib/types";
import { getDoctorDetails } from "@/lib/doctors/doctor-search-api";
import {
  bookAppointment,
  getAvailableSlots,
  type TimeSlot,
} from "@/lib/appointments/appointments-api";

export default function DoctorDetailPage() {
  const { token, user } = useAuth();
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = String(params?.id ?? "");
  const shouldBook = searchParams.get("action") === "book";

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
                              variant={bookingDate === date ? "solid" : "bordered"}
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
        )}
      </div>
    </div>
  );
}
