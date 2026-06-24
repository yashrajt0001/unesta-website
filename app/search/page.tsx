"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchPublishedListings, ApiError, type ListingCard } from "@/lib/api";
import { SkeletonStayCard } from "@/components/ui/Skeleton";
import { StayCard } from "@/components/ui/StayCard";
import { Stagger, StaggerItem } from "@/components/ui/motion";
import { Popover } from "@/components/ui/Popover";
import { BottomSheet } from "@/components/ui/BottomSheet";

const SORTS = [
  { value: "newest", label: "Newest", icon: "schedule" },
  { value: "price_asc", label: "Price: low to high", icon: "trending_up" },
  { value: "price_desc", label: "Price: high to low", icon: "trending_down" },
] as const;

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

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
  const minPrice = params.get("minPrice") ? Number(params.get("minPrice")) : null;
  const maxPrice = params.get("maxPrice") ? Number(params.get("maxPrice")) : null;
  const sort = params.get("sort") || "newest";

  const [results, setResults] = useState<ListingCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  /** Merge new values into the URL query (null = remove the key). */
  const apply = useCallback(
    (next: Record<string, string | number | null>) => {
      const qp = new URLSearchParams(params.toString());
      for (const [k, v] of Object.entries(next)) {
        if (v === null || v === "" || v === 0) qp.delete(k);
        else qp.set(k, String(v));
      }
      router.replace(`/search?${qp.toString()}`, { scroll: false });
    },
    [params, router],
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchPublishedListings({
      location: location || undefined,
      guests: guests || undefined,
      checkIn: checkIn || undefined,
      checkOut: checkOut || undefined,
      minPrice: minPrice ?? undefined,
      maxPrice: maxPrice ?? undefined,
      sort,
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
  }, [location, checkIn, checkOut, guests, minPrice, maxPrice, sort]);

  const chips = useMemo(() => {
    const list: { key: string; label: string; clear: () => void }[] = [];
    if (location)
      list.push({
        key: "loc",
        label: location,
        clear: () => apply({ location: null }),
      });
    if (checkIn && checkOut) {
      const fmt = (d: string) =>
        new Date(d).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
        });
      list.push({
        key: "dates",
        label: `${fmt(checkIn)} – ${fmt(checkOut)}`,
        clear: () => apply({ checkIn: null, checkOut: null }),
      });
    }
    if (guests > 0)
      list.push({
        key: "guests",
        label: `${guests} ${guests === 1 ? "guest" : "guests"}`,
        clear: () => apply({ guests: null }),
      });
    if (minPrice != null || maxPrice != null)
      list.push({
        key: "price",
        label: `${minPrice != null ? currency.format(minPrice) : "Any"} – ${
          maxPrice != null ? currency.format(maxPrice) : "Any"
        }`,
        clear: () => apply({ minPrice: null, maxPrice: null }),
      });
    return list;
  }, [location, checkIn, checkOut, guests, minPrice, maxPrice, apply]);

  const activeSort = SORTS.find((s) => s.value === sort) ?? SORTS[0];
  const priceActive = minPrice != null || maxPrice != null;

  return (
    <section className="px-4 sm:px-6 max-w-7xl mx-auto pt-6 pb-14">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3 mb-5 animate-fade-up">
        <div>
          <h1 className="text-2xl sm:text-3xl font-headline font-semibold tracking-tight">
            {loading
              ? "Searching…"
              : `${results.length} ${results.length === 1 ? "stay" : "stays"}`}
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">
            {location ? `In ${location}` : "Across our Udaipur collection"}
          </p>
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

      {/* Sticky filter bar */}
      <div className="sticky top-16 z-30 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 mb-5 bg-surface/80 backdrop-blur-md border-b border-outline-variant/15">
        {/* Desktop controls */}
        <div className="hidden sm:flex items-center gap-3 flex-wrap">
          <Popover
            label={activeSort.label}
            icon="sort"
            active={sort !== "newest"}
          >
            {(close) => (
              <div className="space-y-1">
                {SORTS.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => {
                      apply({ sort: s.value === "newest" ? null : s.value });
                      close();
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-medium text-left transition-colors ${
                      sort === s.value
                        ? "bg-primary-fixed/60 text-primary"
                        : "hover:bg-surface-container-low"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {s.icon}
                    </span>
                    {s.label}
                    {sort === s.value && (
                      <span className="material-symbols-outlined text-[18px] ml-auto">
                        check
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </Popover>

          <Popover label="Price" icon="payments" active={priceActive}>
            {(close) => (
              <PriceFilter
                min={minPrice}
                max={maxPrice}
                onApply={(lo, hi) => {
                  apply({ minPrice: lo, maxPrice: hi });
                  close();
                }}
              />
            )}
          </Popover>

          <Popover
            label={guests > 0 ? `${guests} guests` : "Guests"}
            icon="group"
            active={guests > 0}
          >
            {(close) => (
              <GuestFilter
                value={guests}
                onApply={(g) => {
                  apply({ guests: g || null });
                  close();
                }}
              />
            )}
          </Popover>
        </div>

        {/* Mobile controls */}
        <div className="flex sm:hidden items-center gap-3">
          <button
            type="button"
            onClick={() => setSheetOpen(true)}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold bg-surface-container-lowest border border-outline-variant/30 press"
          >
            <span className="material-symbols-outlined text-[18px]">tune</span>
            Filters & sort
            {(priceActive || guests > 0 || sort !== "newest") && (
              <span className="grid place-items-center w-5 h-5 rounded-full bg-primary text-on-primary text-[11px]">
                {[priceActive, guests > 0, sort !== "newest"].filter(Boolean)
                  .length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Active chips */}
      {chips.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-6">
          {chips.map((c) => (
            <button
              key={c.key}
              type="button"
              onClick={c.clear}
              className="inline-flex items-center gap-1.5 text-xs font-semibold bg-surface-container-low hover:bg-surface-container text-on-surface rounded-full pl-3 pr-2 py-1.5 press transition-colors"
            >
              {c.label}
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          ))}
        </div>
      )}

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
            Try different dates, fewer guests, or a wider price range.
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
        <Stagger
          amount={0.05}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-8"
        >
          {results.map((stay) => (
            <StaggerItem key={stay.id}>
              <StayCard stay={stay} />
            </StaggerItem>
          ))}
        </Stagger>
      )}

      {/* Mobile filter sheet */}
      <BottomSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title="Filters & sort"
      >
        <div className="space-y-6">
          <div>
            <p className="text-[10px] uppercase font-bold tracking-wider text-on-surface-variant mb-2">
              Sort by
            </p>
            <div className="space-y-1">
              {SORTS.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() =>
                    apply({ sort: s.value === "newest" ? null : s.value })
                  }
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-sm font-medium text-left transition-colors ${
                    sort === s.value
                      ? "bg-primary-fixed/60 text-primary"
                      : "bg-surface-container-low"
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {s.icon}
                  </span>
                  {s.label}
                  {sort === s.value && (
                    <span className="material-symbols-outlined text-[18px] ml-auto">
                      check
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[10px] uppercase font-bold tracking-wider text-on-surface-variant mb-2">
              Price per night
            </p>
            <PriceFilter
              min={minPrice}
              max={maxPrice}
              onApply={(lo, hi) => apply({ minPrice: lo, maxPrice: hi })}
            />
          </div>

          <div>
            <p className="text-[10px] uppercase font-bold tracking-wider text-on-surface-variant mb-2">
              Guests
            </p>
            <GuestFilter
              value={guests}
              onApply={(g) => apply({ guests: g || null })}
            />
          </div>

          <button
            type="button"
            onClick={() => setSheetOpen(false)}
            className="w-full py-4 rounded-full bg-primary text-on-primary font-bold press shadow-glow-primary"
          >
            Show {results.length} stays
          </button>
        </div>
      </BottomSheet>
    </section>
  );
}

function PriceFilter({
  min,
  max,
  onApply,
}: {
  min: number | null;
  max: number | null;
  onApply: (lo: number | null, hi: number | null) => void;
}) {
  const [lo, setLo] = useState(min != null ? String(min) : "");
  const [hi, setHi] = useState(max != null ? String(max) : "");

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="text-[10px] uppercase font-bold tracking-wider text-on-surface-variant">
            Min ₹
          </span>
          <input
            type="number"
            min={0}
            inputMode="numeric"
            value={lo}
            onChange={(e) => setLo(e.target.value)}
            placeholder="0"
            className="mt-1 w-full rounded-2xl border border-outline-variant/40 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </label>
        <label className="block">
          <span className="text-[10px] uppercase font-bold tracking-wider text-on-surface-variant">
            Max ₹
          </span>
          <input
            type="number"
            min={0}
            inputMode="numeric"
            value={hi}
            onChange={(e) => setHi(e.target.value)}
            placeholder="Any"
            className="mt-1 w-full rounded-2xl border border-outline-variant/40 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </label>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => {
            setLo("");
            setHi("");
            onApply(null, null);
          }}
          className="flex-1 py-2.5 rounded-full text-sm font-semibold bg-surface-container-low press"
        >
          Clear
        </button>
        <button
          type="button"
          onClick={() =>
            onApply(lo ? Number(lo) : null, hi ? Number(hi) : null)
          }
          className="flex-1 py-2.5 rounded-full text-sm font-bold bg-primary text-on-primary press"
        >
          Apply
        </button>
      </div>
    </div>
  );
}

function GuestFilter({
  value,
  onApply,
}: {
  value: number;
  onApply: (g: number) => void;
}) {
  const [g, setG] = useState(value);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Guests</span>
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Decrease guests"
            onClick={() => setG((n) => Math.max(0, n - 1))}
            disabled={g <= 0}
            className="grid place-items-center w-9 h-9 rounded-full border border-outline-variant/40 press disabled:opacity-40 hover:border-primary/40"
          >
            <span className="material-symbols-outlined text-[18px]">remove</span>
          </button>
          <span className="w-6 text-center font-semibold tabular-nums">{g}</span>
          <button
            type="button"
            aria-label="Increase guests"
            onClick={() => setG((n) => Math.min(20, n + 1))}
            className="grid place-items-center w-9 h-9 rounded-full border border-outline-variant/40 press hover:border-primary/40"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
          </button>
        </div>
      </div>
      <button
        type="button"
        onClick={() => onApply(g)}
        className="w-full py-2.5 rounded-full text-sm font-bold bg-primary text-on-primary press"
      >
        Apply
      </button>
    </div>
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
