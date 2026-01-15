"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/auth-context";
import {
  searchDoctors,
  type DoctorSearchItem,
  type DoctorSearchParams,
} from "@/lib/doctors/doctor-search-api";

export default function DoctorSearchPage() {
  const { token } = useAuth();

  const [items, setItems] = useState<DoctorSearchItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [name, setName] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [languageInput, setLanguageInput] = useState("");
  const [minRating, setMinRating] = useState<string>("");
  const [availableDate, setAvailableDate] = useState(""); // YYYY-MM-DD
  const [sortBy, setSortBy] = useState<"" | "rating" | "experience">("");

  // Manual search trigger
  const [searchNonce, setSearchNonce] = useState(0);

  function buildParams(): DoctorSearchParams {
    const parsedMinRating =
      minRating.trim() === "" ? undefined : Number(minRating);

    const languages = languageInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    return {
      name: name.trim() || undefined,
      specialization: specialization.trim() || undefined,
      languages: languages.length ? languages : undefined,
      minRating:
        parsedMinRating != null && !Number.isNaN(parsedMinRating)
          ? parsedMinRating
          : undefined,
      availableDate: availableDate || undefined,
      sortBy: sortBy || undefined,
      // page: 0,
      // size: 20,
    };
  }

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setLoading(true);
      setError(null);

      const params = buildParams();

      try {
        const data = await searchDoctors(token, params);
        if (!cancelled) setItems(data);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load doctors.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [token, searchNonce]);

  function onSearch() {
    setSearchNonce((n) => n + 1);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") onSearch();
  }

  const inputClass =
    "w-full h-12 rounded-xl border border-default-200 bg-content1 px-4 text-base leading-none text-white placeholder:text-default-400";

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">Doctor Search</h1>

      {/* FILTERS */}
      <div className="mb-6 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <input
          className={inputClass}
          placeholder="Search by name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={onKeyDown}
        />

        <input
          className={inputClass}
          placeholder="Specialization"
          value={specialization}
          onChange={(e) => setSpecialization(e.target.value)}
          onKeyDown={onKeyDown}
        />

        <input
          className={inputClass}
          placeholder="Languages (comma-separated)"
          value={languageInput}
          onChange={(e) => setLanguageInput(e.target.value)}
          onKeyDown={onKeyDown}
        />

        <input
          className={inputClass}
          placeholder="Min rating"
          value={minRating}
          onChange={(e) => setMinRating(e.target.value)}
          onKeyDown={onKeyDown}
        />

        {/* Availability date */}
        <input
          type="date"
          className={inputClass}
          value={availableDate}
          onChange={(e) => setAvailableDate(e.target.value)}
        />

        {/* Sort */}
        <select
          className={`${inputClass} appearance-none`}
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
        >
          <option value="">No sort</option>
          <option value="rating">Sort by rating</option>
          <option value="experience">Sort by experience</option>
        </select>

        <button
          className="h-12 rounded-xl bg-primary px-4 text-sm font-medium text-white disabled:opacity-50 lg:col-span-2"
          onClick={onSearch}
          disabled={loading}
        >
          Search
        </button>
      </div>

      {loading && <p className="text-default-500">Loading...</p>}
      {error && <p className="text-danger">{error}</p>}
      {!loading && !error && items.length === 0 && (
        <p className="text-sm text-default-500">No doctors found.</p>
      )}

      <div className="space-y-4">
        {items.map((doc) => {
          const fullName = `Dr. ${doc.firstName} ${doc.lastName}`;
          const rating =
            doc.averageRating != null ? doc.averageRating.toFixed(1) : "—";
          const languages = (doc.languages || [])
            .filter((lang) => lang && lang.trim())
            .join(", ");

          return (
            <div
              key={doc.id}
              className="rounded-xl border border-default-200 bg-content1 p-4 hover:bg-content1/80 transition-colors"
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="flex-1">
                  <p className="font-semibold text-lg">{fullName}</p>
                  <p className="text-sm text-default-500">
                    {doc.specialization || "General Practice"}
                  </p>
                  
                  <div className="mt-2 flex flex-wrap gap-2 text-sm text-default-600">
                    {doc.experience != null && (
                      <span>📋 {doc.experience} years experience</span>
                    )}
                    {rating !== "—" && (
                      <span>⭐ {rating} ({doc.reviewCount || 0} reviews)</span>
                    )}
                  </div>

                  {languages && (
                    <p className="mt-2 text-xs text-default-500">
                      Languages: {languages}
                    </p>
                  )}
                  
                  {doc.clinicAddress && (
                    <p className="mt-2 text-xs text-default-500">
                      📍 {doc.clinicAddress}
                    </p>
                  )}

                  {doc.bio && (
                    <p className="mt-2 text-xs text-default-600 italic">
                      {doc.bio}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <Link
                    href={`/patient/doctors/${doc.id}?action=book`}
                    className="inline-block rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity text-center"
                  >
                    Book Appointment
                  </Link>
                  <Link
                    href={`/patient/doctors/${doc.id}`}
                    className="inline-block rounded-lg border border-default-300 px-4 py-2 text-sm font-medium text-foreground hover:bg-default-100 transition-colors text-center"
                  >
                    View Profile
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}