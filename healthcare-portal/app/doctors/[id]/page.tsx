"use client";

import { useEffect, useState } from "react";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { ApiError } from "@/lib/auth/api";
import { useAuth } from "@/lib/auth/auth-context";
import {
  getDoctorPublicProfile,
  type DoctorPublicProfile,
} from "@/lib/doctors/doctor-api";
import {
  getReviewsByDoctor,
  type Review,
} from "@/lib/reviews/reviews-api";

const PAGE_SIZE = 5;

export default function DoctorPublicProfilePage({
  params,
}: {
  params: { id: string };
}) {
  const { token } = useAuth();
  const [profile, setProfile] = useState<DoctorPublicProfile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviewsError, setReviewsError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    async function loadProfile() {
      setLoadingProfile(true);
      setError(null);
      try {
        const data = await getDoctorPublicProfile(params.id);
        if (!alive) return;
        setProfile(data);
      } catch (e) {
        if (!alive) return;
        const message =
          e instanceof ApiError ? e.message : "Unable to load doctor profile.";
        setError(message);
      } finally {
        if (alive) setLoadingProfile(false);
      }
    }

    loadProfile();
    return () => {
      alive = false;
    };
  }, [params.id]);

  useEffect(() => {
    let alive = true;

    async function loadReviews() {
      setLoadingReviews(true);
      setReviewsError(null);
      try {
        const pageData = await getReviewsByDoctor(
          token,
          params.id,
          page,
          PAGE_SIZE,
        );
        if (!alive) return;
        setReviews(pageData.content ?? []);
        setTotalPages(pageData.totalPages ?? 0);
      } catch (e) {
        if (!alive) return;
        const message =
          e instanceof ApiError ? e.message : "Unable to load reviews.";
        setReviewsError(message);
      } finally {
        if (alive) setLoadingReviews(false);
      }
    }

    loadReviews();
    return () => {
      alive = false;
    };
  }, [params.id, page, token]);

  return (
    <div className="px-6 py-6 md:px-10 md:py-8 space-y-6">
      <Card>
        <CardHeader>
          <div>
            <h1 className="text-xl font-semibold">Doctor profile</h1>
            <p className="text-sm text-default-500">
              Public details and patient feedback.
            </p>
          </div>
        </CardHeader>
        <CardBody>
          {loadingProfile ? (
            <p className="text-sm text-default-500">Loading profile...</p>
          ) : error ? (
            <p className="text-sm text-danger">{error}</p>
          ) : profile ? (
            <div className="space-y-4 text-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-full border px-3 py-2 text-xs text-default-500">
                  {profile.specialization}
                </div>
                <Chip size="sm" variant="flat" color="warning">
                  {profile.averageRating?.toFixed(1)} rating
                </Chip>
                <span className="text-xs text-default-500">
                  {profile.reviewCount} reviews
                </span>
              </div>

              <div>
                <p className="font-medium">
                  Dr. {profile.firstName} {profile.lastName}
                </p>
                <p className="text-default-500">
                  {profile.experience} years experience
                </p>
              </div>

              <div className="grid gap-2 md:grid-cols-2">
                <div>
                  <p className="text-xs uppercase tracking-wide text-default-500">
                    Languages
                  </p>
                  <p className="font-medium">
                    {(profile.languages || []).join(", ") || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-default-500">
                    Clinic address
                  </p>
                  <p className="font-medium">{profile.clinicAddress || "-"}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-xs uppercase tracking-wide text-default-500">
                    Education
                  </p>
                  <p className="font-medium">{profile.education || "-"}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-xs uppercase tracking-wide text-default-500">
                    Bio
                  </p>
                  <p className="text-default-500">{profile.bio || "-"}</p>
                </div>
              </div>
            </div>
          ) : null}
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <h2 className="text-lg font-semibold">Patient reviews</h2>
            <p className="text-sm text-default-500">
              Recent feedback from completed appointments.
            </p>
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          {loadingReviews ? (
            <p className="text-sm text-default-500">Loading reviews...</p>
          ) : reviewsError ? (
            <p className="text-sm text-danger">{reviewsError}</p>
          ) : reviews.length === 0 ? (
            <p className="text-sm text-default-500">
              No reviews available yet.
            </p>
          ) : (
            <div className="space-y-3">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="rounded-xl border border-default-200 bg-content1/60 p-4 text-sm"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{review.patientName}</p>
                    <Chip size="sm" variant="flat" color="warning">
                      {review.rating} / 5
                    </Chip>
                  </div>
                  <p className="mt-2 text-default-500">
                    {review.comment || "No comment provided."}
                  </p>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-end gap-2">
            <Button
              size="sm"
              variant="flat"
              isDisabled={page <= 0}
              onPress={() => setPage((prev) => Math.max(0, prev - 1))}
            >
              Previous
            </Button>
            <Button
              size="sm"
              variant="flat"
              isDisabled={page + 1 >= totalPages}
              onPress={() => setPage((prev) => prev + 1)}
            >
              Next
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
