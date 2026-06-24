"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import Footer from "@/components/layout/Footer";
import SearchModal from "@/components/layout/SearchModal";
import ExpandSearch from "@/components/search/ExpandSearch";
import { SkeletonStayCard } from "@/components/ui/Skeleton";
import { StayCard } from "@/components/ui/StayCard";
import { FadeIn, Stagger, StaggerItem, EASE_OUT_SOFT } from "@/components/ui/motion";
import {
  ApiError,
  fetchPublishedListings,
  type ListingCard,
} from "@/lib/api";

export default function StaysPage() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [stays, setStays] = useState<ListingCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchPublishedListings({ limit: 50 })
      .then((data) => {
        if (!cancelled) setStays(data);
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e instanceof ApiError ? e.message : "Could not load stays.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Group listings by city → one carousel row per city (largest first).
  const rows = useMemo(() => {
    const map = new Map<string, ListingCard[]>();
    for (const s of stays) {
      const arr = map.get(s.city) ?? [];
      arr.push(s);
      map.set(s.city, arr);
    }
    return [...map.entries()].sort((a, b) => b[1].length - a[1].length);
  }, [stays]);

  return (
    <>
      {/* ── Search bar ───────────────────────────────────────────────── */}
      <section className="px-4 sm:px-6 pt-5 sm:pt-7">
        {/* desktop: animated Where/When/Who bar */}
        <motion.div
          className="hidden lg:block"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE_OUT_SOFT }}
        >
          <ExpandSearch />
        </motion.div>

        {/* mobile: compact trigger → bottom-sheet search */}
        <button
          type="button"
          onClick={() => setSearchOpen(true)}
          className="lg:hidden group w-full flex items-center bg-surface-container-lowest rounded-full pl-5 pr-2 py-2 gap-3 shadow-float border border-outline-variant/30 press text-left"
          aria-label="Open search"
        >
          <span className="material-symbols-outlined text-primary">search</span>
          <span className="flex-1 min-w-0">
            <span className="block text-sm font-semibold text-on-surface">
              Where to?
            </span>
            <span className="block text-xs text-on-surface-variant truncate">
              Anywhere · Any week · Add guests
            </span>
          </span>
          <span className="grid place-items-center w-10 h-10 rounded-full bg-primary text-on-primary">
            <span className="material-symbols-outlined text-[20px]">tune</span>
          </span>
        </button>
      </section>

      {/* ── Listing rows ─────────────────────────────────────────────── */}
      <div className="mt-8 sm:mt-10 max-w-7xl mx-auto">
        {loading && (
          <div className="space-y-10">
            {Array.from({ length: 2 }).map((_, r) => (
              <section key={r}>
                <div className="px-4 sm:px-6 mb-4 h-6 w-56 rounded-full bg-surface-container-high animate-pulse" />
                <div className="flex overflow-x-auto gap-4 sm:gap-5 px-4 sm:px-6 hide-scrollbar">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <SkeletonStayCard key={i} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="mx-4 sm:mx-6 rounded-3xl bg-error-container/40 p-6 text-on-error-container">
            <p className="font-semibold">Couldn&apos;t load stays</p>
            <p className="text-sm mt-1">{error}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-3 text-sm font-bold underline"
            >
              Try again
            </button>
          </div>
        )}

        {!loading && !error && stays.length === 0 && (
          <div className="mx-4 sm:mx-6 rounded-3xl bg-surface-container-low p-12 text-center">
            <span className="material-symbols-outlined text-5xl text-on-surface-variant">
              house
            </span>
            <h2 className="font-headline font-semibold text-xl mt-3">
              No live stays yet
            </h2>
            <p className="text-on-surface-variant text-sm mt-1">
              Check back soon — new stays are added every week.
            </p>
          </div>
        )}

        {!loading &&
          !error &&
          rows.map(([city, list]) => (
            <ListingRow key={city} city={city} list={list} />
          ))}
      </div>

      <div className="mt-16 sm:mt-20">
        <Footer />
      </div>

      <SearchModal
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        mode="stays"
      />
    </>
  );
}

/* Horizontal scroll row of stays for one city. */
function ListingRow({ city, list }: { city: string; list: ListingCard[] }) {
  return (
    <section className="mb-10 sm:mb-12">
      <FadeIn className="px-4 sm:px-6 flex items-end justify-between gap-2 mb-4">
        <h2 className="text-xl sm:text-2xl font-headline font-semibold text-on-surface tracking-tight">
          Popular homes in {city}
        </h2>
        <Link
          href={`/search?location=${encodeURIComponent(city)}`}
          className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline whitespace-nowrap"
        >
          See all
          <span className="material-symbols-outlined text-[18px]">
            arrow_forward
          </span>
        </Link>
      </FadeIn>

      <Stagger
        amount={0.05}
        className="flex overflow-x-auto gap-4 sm:gap-5 px-4 sm:px-6 pb-2 hide-scrollbar snap-x"
      >
        {list.map((stay) => (
          <StaggerItem key={stay.id} className="flex-none w-60 sm:w-64 snap-start">
            <StayCard stay={stay} />
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}
