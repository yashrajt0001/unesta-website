"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  ApiError,
  fetchListingDetails,
  fetchPriceBreakdown,
  type ListingDetails,
  type PriceBreakdown,
} from "@/lib/api";
import { useRequireAuth } from "@/lib/use-require-auth";
import { useAuth } from "@/lib/auth-context";
import { Skeleton } from "@/components/ui/Skeleton";

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const formatDateRange = (a: string, b: string) => {
  const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" };
  const yearOpts: Intl.DateTimeFormatOptions = { year: "numeric" };
  const start = new Date(a);
  const end = new Date(b);
  return `${start.toLocaleDateString("en-GB", opts)}–${end.toLocaleDateString(
    "en-GB",
    opts,
  )} ${end.toLocaleDateString("en-GB", yearOpts)}`;
};

export default function BookPage() {
  return (
    <Suspense fallback={<BookSkeleton />}>
      <BookInner />
    </Suspense>
  );
}

function BookInner() {
  const params = useParams<{ id: string }>();
  const search = useSearchParams();
  const router = useRouter();
  const id = params.id;

  const checkIn = search.get("checkIn") || "";
  const checkOut = search.get("checkOut") || "";
  const guests = Number(search.get("guests") || "0");

  const { isLoading: authLoading, isAuthenticated } = useRequireAuth();
  const { user } = useAuth();

  const [listing, setListing] = useState<ListingDetails | null>(null);
  const [pricing, setPricing] = useState<PriceBreakdown | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Validate query params early
  const paramsValid =
    !!checkIn && !!checkOut && guests > 0 && new Date(checkOut) > new Date(checkIn);

  useEffect(() => {
    if (!isAuthenticated) return;
    if (!paramsValid) return;
    let cancelled = false;
    fetchListingDetails(id)
      .then((d) => !cancelled && setListing(d))
      .catch((e) => {
        if (!cancelled)
          setError(
            e instanceof ApiError ? e.message : "Could not load this stay.",
          );
      });
    fetchPriceBreakdown({ listingId: id, checkIn, checkOut, guests })
      .then((p) => !cancelled && setPricing(p))
      .catch(() => !cancelled && setPricing(null));
    return () => {
      cancelled = true;
    };
  }, [id, checkIn, checkOut, guests, isAuthenticated, paramsValid]);

  if (authLoading || !isAuthenticated) return <BookSkeleton />;

  if (!paramsValid) {
    return (
      <div className="max-w-2xl mx-auto p-6 mt-8">
        <div className="rounded-2xl bg-error-container/40 p-6 text-on-error-container">
          <p className="font-semibold">Missing booking details</p>
          <p className="text-sm">
            Please pick your dates and guests from the listing page.
          </p>
          <Link
            href={`/stays/${id}`}
            className="inline-block mt-3 text-sm font-bold underline"
          >
            Back to listing
          </Link>
        </div>
      </div>
    );
  }

  const payHref = `/stays/${id}/pay?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`;

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-6 mt-8">
        <div className="rounded-2xl bg-error-container/40 p-6 text-on-error-container">
          <p className="font-semibold">Couldn’t load stay</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  if (!listing) return <BookSkeleton />;

  const cover =
    listing.images.find((i) => i.isCover)?.url ||
    listing.images[0]?.url ||
    "https://via.placeholder.com/600x400?text=No+Image";

  const displayName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    user?.phone ||
    "";

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
      <Link
        href={`/stays/${id}`}
        className="text-primary inline-flex items-center gap-2 mb-6 text-sm font-semibold hover:underline"
      >
        <span className="material-symbols-outlined">arrow_back</span>
        Back to listing
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_minmax(auto,420px)] gap-8 lg:gap-12 items-start">
        {/* Steps */}
        <section className="bg-surface-container-lowest p-6 sm:p-8 rounded-3xl shadow-[0_8px_40px_-15px_rgba(0,0,0,0.06)] border border-outline-variant/20 space-y-6">
          <Step
            number={1}
            title="Signed in"
            complete
            description={`Continuing as ${displayName}`}
          />
          <div className="h-px bg-surface-container" />
          <Step
            number={2}
            title="Review your stay"
            active
            description="Confirm the dates and guests are correct."
          />
          <div className="h-px bg-surface-container" />
          <Step
            number={3}
            title="Confirm and pay"
            description="Add details and submit your booking."
          />
        </section>

        {/* Review card */}
        <section className="bg-surface-container-lowest p-6 sm:p-8 rounded-3xl shadow-[0_8px_40px_-15px_rgba(0,0,0,0.06)] border border-outline-variant/20 space-y-5">
          <h1 className="text-xl font-bold font-headline">Your trip</h1>

          <div className="flex gap-4">
            <div className="w-24 h-20 flex-shrink-0 rounded-xl overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={cover}
                alt={listing.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-bold line-clamp-2 leading-snug">
                {listing.title}
              </h2>
              <p className="text-xs text-on-surface-variant">
                {listing.city}, {listing.state}
              </p>
            </div>
          </div>

          <div className="h-px bg-surface-container" />

          <RowEdit label="Dates" value={formatDateRange(checkIn, checkOut)} href={`/stays/${id}`} />
          <RowEdit
            label="Guests"
            value={`${guests} ${guests === 1 ? "guest" : "guests"}`}
            href={`/stays/${id}`}
          />

          <div className="pt-4 border-t border-surface-container space-y-2 text-sm">
            <Row
              label={
                pricing
                  ? `${currency.format(listing.basePrice)} × ${pricing.nights} nights`
                  : "Subtotal"
              }
              value={
                pricing ? currency.format(pricing.subtotal) : "—"
              }
            />
            <Row
              label="Cleaning fee"
              value={currency.format(pricing?.cleaningFee ?? listing.cleaningFee ?? 0)}
            />
            <Row
              label="Service fee"
              value={currency.format(pricing?.guestServiceFee ?? 0)}
            />
            <div className="flex justify-between font-bold pt-2 border-t border-surface-container-low">
              <span>Total</span>
              <span>{currency.format(pricing?.totalAmount ?? listing.basePrice)}</span>
            </div>
          </div>

          <Link
            href={payHref}
            className="block text-center w-full bg-primary text-on-primary py-4 rounded-full font-bold text-base press hover:brightness-105 shadow-glow-primary"
          >
            Continue to confirm
          </Link>
        </section>
      </div>
    </main>
  );
}

function Step({
  number,
  title,
  description,
  complete,
  active,
}: {
  number: number;
  title: string;
  description?: string;
  complete?: boolean;
  active?: boolean;
}) {
  return (
    <div className="flex items-start gap-4">
      <div
        className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
          complete
            ? "bg-secondary-container text-on-secondary-container"
            : active
              ? "bg-primary text-on-primary"
              : "bg-surface-container text-on-surface-variant"
        }`}
      >
        {complete ? (
          <span
            className="material-symbols-outlined text-base"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            check
          </span>
        ) : (
          number
        )}
      </div>
      <div className="flex-1">
        <h3
          className={`font-bold font-headline ${
            complete || active ? "text-on-surface" : "text-on-surface-variant/70"
          }`}
        >
          {title}
        </h3>
        {description && (
          <p className="text-sm text-on-surface-variant mt-0.5">{description}</p>
        )}
      </div>
    </div>
  );
}

function RowEdit({
  label,
  value,
  href,
}: {
  label: string;
  value: string;
  href: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="font-bold font-headline">{label}</p>
        <p className="text-on-surface-variant text-sm">{value}</p>
      </div>
      <Link
        href={href}
        className="text-sm font-bold text-on-surface underline hover:text-primary transition-colors px-2 py-1 rounded"
      >
        Change
      </Link>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-on-surface-variant">
      <span>{label}</span>
      <span className="font-semibold text-on-surface">{value}</span>
    </div>
  );
}

function BookSkeleton() {
  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <Skeleton className="h-6 w-32" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Skeleton className="h-80 rounded-3xl" />
        <Skeleton className="h-80 rounded-3xl" />
      </div>
    </main>
  );
}
