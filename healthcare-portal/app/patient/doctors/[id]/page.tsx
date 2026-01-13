
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth/auth-context";
import { getDoctorDetails } from "@/lib/doctors/doctor-search-api";

export default function DoctorDetailPage() {
  const { token } = useAuth();
  const params = useParams();

  const id = String(params?.id ?? "");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [doctor, setDoctor] = useState<any>(null);

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

  const name =
    doctor?.name ??
    (doctor?.firstName && doctor?.lastName
      ? `Dr. ${doctor.firstName} ${doctor.lastName}`
      : "Doctor");

  const specialization = doctor?.specialization ?? "—";
  const rating =
    doctor?.averageRating != null ? Number(doctor.averageRating).toFixed(1) : "—";
  const bio = doctor?.bio ?? doctor?.about ?? "—";

  const clinicAddress = doctor?.clinicAddress ?? "—";
  const education = doctor?.education ?? "—";
  const experience = doctor?.experience != null ? String(doctor.experience) : "—";
  const reviewCount = doctor?.reviewCount != null ? String(doctor.reviewCount) : "—";

  const languages =
    Array.isArray(doctor?.languages)
      ? doctor.languages.join(", ")
      : (doctor?.languages ?? "—");

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <Link href="/patient/doctors" className="text-primary hover:underline">
        ← Back to search
      </Link>

      <h1 className="text-2xl font-semibold mt-4">Doctor Profile (ID: {id})</h1>

      {loading && <p className="mt-4 text-default-500">Loading...</p>}
      {error && <p className="mt-4 text-danger">{error}</p>}

      {!loading && !error && (
        <div className="mt-4 space-y-2">
          <p>
            <strong>Name:</strong> {name}
          </p>
          <p>
            <strong>Specialization:</strong> {specialization}
          </p>
          <p>
            <strong>Rating:</strong> ⭐ {rating}
          </p>
          <p>
            <strong>Bio:</strong> {bio}
          </p>

          <div className="pt-4 space-y-2">
            <p>
              <strong>Clinic address:</strong> {clinicAddress}
            </p>
            <p>
              <strong>Languages:</strong> {languages}
            </p>
            <p>
              <strong>Education:</strong> {education}
            </p>
            <p>
              <strong>Experience:</strong> {experience}
            </p>
            <p>
              <strong>Reviews:</strong> {reviewCount}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}