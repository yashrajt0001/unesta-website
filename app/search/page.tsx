"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchPublishedListings, ApiError, type ListingCard } from "@/lib/api";
import { SkeletonStayCard } from "@/components/ui/Skeleton";
import { StayCard } from "@/components/ui/StayCard";
import { Reveal } from "@/components/ui/Reveal";

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchPageSkeleton />}>
      <SearchPageInner />
    </Suspense>
  );
}

function SearchPageInner() {
  const router = useRouter();
  const params = useSearchParams();

  const location = params.get("location") || "";
  const checkIn = params.get("checkIn") || "";
  const checkOut = params.get("checkOut") || "";
  const guests = Number(params.get("guests") || "0");

  const [results, setResults] = useState<ListingCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchPublishedListings({
      location: location || undefined,
      guests: guests || undefined,
      checkIn: checkIn || undefined,
      checkOut: checkOut || undefined,
      limit: 24,
    })
      .then((data) => {
        if (!cancelled) setResults(data);
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setError(
          e instanceof ApiError ? e.message : "Could not load results.",
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [location, checkIn, checkOut, guests]);

  const summary = useMemo(() => {
    const parts: string[] = [];
    if (location) parts.push(location);
    if (checkIn && checkOut) {
      const fmt = (d: string) =>
        new Date(d).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
        });
      parts.push(`${fmt(checkIn)} – ${fmt(checkOut)}`);
    }
    if (guests > 0) parts.push(`${guests} ${guests === 1 ? "guest" : "guests"}`);
    return parts.join(" · ");
  }, [location, checkIn, checkOut, guests]);

  return (
    <section className="px-4 sm:px-6 max-w-7xl mx-auto pt-6 pb-14">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-7 animate-fade-up">
        <div>
          <h1 className="text-2xl sm:text-3xl font-headline font-semibold tracking-tight">
            Search results
          </h1>
          {summary && (
            <p className="text-sm text-on-surface-variant mt-1 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-primary">
                tune
              </span>
              {summary}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary bg-primary-fixed/40 hover:bg-primary-fixed/70 rounded-full px-4 py-2 press"
        >
          <span className="material-symbols-outlined text-[18px]">edit</span>
          Modify search
        </button>
      </div>

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-8">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonStayCard key={i} />
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="rounded-3xl bg-error-container/40 p-6 text-on-error-container">
          <p className="font-semibold">Couldn’t load results</p>
          <p className="text-sm mt-1">{error}</p>
          <button
            type="button"
            onClick={() => router.refresh()}
            className="mt-3 text-sm font-bold underline"
          >
            Try again
          </button>
        </div>
      )}

      {!loading && !error && results.length === 0 && (
        <div className="rounded-3xl bg-surface-container-low p-12 text-center max-w-lg mx-auto">
          <span className="material-symbols-outlined text-5xl text-on-surface-variant">
            search_off
          </span>
          <h2 className="font-headline font-semibold text-xl mt-3">
            No stays match this search
          </h2>
          <p className="text-on-surface-variant text-sm mt-1">
            Try different dates, fewer guests, or a wider location.
          </p>
          <Link
            href="/"
            className="inline-block mt-5 px-6 py-3 bg-primary text-on-primary rounded-full font-semibold press shadow-glow-primary"
          >
            Browse all stays
          </Link>
        </div>
      )}

      {!loading && !error && results.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-8">
          {results.map((stay, i) => (
            <Reveal key={stay.id} delay={Math.min(i, 7) * 55}>
              <StayCard stay={stay} />
            </Reveal>
          ))}
        </div>
      )}
    </section>
  );
}

function SearchPageSkeleton() {
  return (
    <section className="px-4 sm:px-6 max-w-7xl mx-auto pt-6 pb-14">
      <div className="skeleton h-8 w-48 rounded-lg mb-7" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-8">
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonStayCard key={i} />
        ))}
      </div>
    </section>
  );
}
