"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ApiError,
  fetchListingDetails,
  fetchPriceBreakdown,
  type ListingDetails,
  type PriceBreakdown,
} from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/toast";
import { Skeleton } from "@/components/ui/Skeleton";
import { WishlistHeart } from "@/components/ui/WishlistHeart";
import { ImageCarousel } from "@/components/ui/ImageCarousel";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { DateRangePicker } from "@/components/ui/DateRangePicker";
import { Reveal } from "@/components/ui/Reveal";

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const shortDate = (d: string) =>
  new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function addDaysIso(base: string, days: number) {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export default function PropertyDetailsPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const toast = useToast();

  const [listing, setListing] = useState<ListingDetails | null>(null);
  const [pricing, setPricing] = useState<PriceBreakdown | null>(null);
  const [error, setError] = useState<string | null>(null);

  const today = todayIso();
  const [checkIn, setCheckIn] = useState(addDaysIso(today, 1));
  const [checkOut, setCheckOut] = useState(addDaysIso(today, 4));
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [datesError, setDatesError] = useState<string | null>(null);

  const guests = adults + children;

  useEffect(() => {
    let cancelled = false;
    fetchListingDetails(id)
      .then((d) => {
        if (!cancelled) setListing(d);
      })
      .catch((e: unknown) => {
        if (!cancelled)
          setError(
            e instanceof ApiError ? e.message : "Could not load this stay.",
          );
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  // Clamp dates and validate
  useEffect(() => {
    if (new Date(checkOut) <= new Date(checkIn)) {
      setDatesError("Check-out must be after check-in.");
    } else if (listing && guests > listing.maxGuests) {
      setDatesError(`This stay allows up to ${listing.maxGuests} guests.`);
    } else {
      setDatesError(null);
    }
  }, [checkIn, checkOut, guests, listing]);

  // Fetch price breakdown (only when inputs are valid)
  useEffect(() => {
    if (!listing) return;
    if (datesError) return;
    let cancelled = false;
    fetchPriceBreakdown({ listingId: listing.id, checkIn, checkOut, guests })
      .then((p) => {
        if (!cancelled) setPricing(p);
      })
      .catch(() => {
        if (!cancelled) setPricing(null);
      });
    return () => {
      cancelled = true;
    };
  }, [listing, checkIn, checkOut, guests, datesError]);

  const bookHref = useMemo(() => {
    const qp = new URLSearchParams({
      checkIn,
      checkOut,
      guests: String(guests),
    });
    return `/stays/${id}/book?${qp.toString()}`;
  }, [id, checkIn, checkOut, guests]);

  function handleBookClick(e: React.MouseEvent) {
    if (datesError) {
      e.preventDefault();
      toast.error(datesError);
      return;
    }
    if (!isAuthenticated) {
      e.preventDefault();
      router.push(`/login?next=${encodeURIComponent(bookHref)}`);
    }
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-6 mt-8">
        <div className="rounded-3xl bg-error-container/40 p-6 text-on-error-container">
          <p className="font-semibold">Couldn’t load this stay</p>
          <p className="text-sm mt-1">{error}</p>
          <Link
            href="/"
            className="inline-block mt-3 text-sm font-bold underline"
          >
            Back to explore
          </Link>
        </div>
      </div>
    );
  }

  if (!listing) return <PropertyDetailsSkeleton />;

  const cover =
    listing.images.find((i) => i.isCover)?.url ||
    listing.images[0]?.url ||
    "https://via.placeholder.com/1200x800?text=No+Image";
  const grid = listing.images.slice(0, 5);

  return (
    <div className="text-on-surface">
      <section className="mt-2 sm:mt-4 relative">
        {/* Mobile — swipeable gallery */}
        <div className="lg:hidden relative">
          <ImageCarousel
            images={grid.length ? grid : [{ id: "ph", url: cover }]}
            alt={listing.title}
            className="overflow-hidden sm:rounded-3xl sm:mx-4"
          />
          <div className="absolute top-4 right-4 sm:right-8 z-10">
            <WishlistHeart listingId={listing.id} />
          </div>
        </div>

        {/* Desktop gallery */}
        <div className="hidden lg:block max-w-7xl mx-auto px-6 relative">
          <div className="grid grid-cols-4 grid-rows-2 gap-3 h-[460px] rounded-3xl overflow-hidden">
            <div className="col-span-2 row-span-2 relative overflow-hidden group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={grid[0]?.url || cover}
                alt={listing.title}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
              />
            </div>
            {[1, 2, 3, 4].map((idx) => (
              <div key={idx} className="relative overflow-hidden group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={grid[idx]?.url || cover}
                  alt={listing.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
                />
              </div>
            ))}
          </div>
          <div className="absolute top-4 right-10">
            <WishlistHeart listingId={listing.id} />
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-8 lg:mt-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">
        {/* Left column */}
        <div className="lg:col-span-8 space-y-10">
          <Reveal className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 text-on-accent-container bg-accent-container rounded-full px-2.5 py-1 text-xs font-bold">
                <span
                  className="material-symbols-outlined text-[15px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  star
                </span>
                New stay
              </span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-semibold font-headline tracking-tight leading-tight text-on-surface">
              {listing.title}
            </h2>
            <div className="flex items-center gap-2 text-on-surface-variant">
              <span className="material-symbols-outlined text-primary text-[20px]">
                location_on
              </span>
              <span className="text-base font-medium">
                {listing.city}, {listing.state}
              </span>
            </div>
          </Reveal>

          {/* Quick facts */}
          <Reveal className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: "king_bed", label: "Bedrooms", value: listing.bedrooms },
              { icon: "bed", label: "Beds", value: listing.beds },
              { icon: "bathtub", label: "Baths", value: listing.bathrooms },
              { icon: "group", label: "Guests", value: listing.maxGuests },
            ].map((f) => (
              <div
                key={f.label}
                className="flex flex-col gap-1 p-4 bg-surface-container-low rounded-2xl"
              >
                <span className="material-symbols-outlined text-primary text-[22px]">
                  {f.icon}
                </span>
                <span className="text-lg font-headline font-semibold leading-none mt-1">
                  {f.value}
                </span>
                <span className="text-xs text-on-surface-variant">
                  {f.label}
                </span>
              </div>
            ))}
          </Reveal>

          <Reveal className="space-y-3">
            <h3 className="text-xl font-semibold font-headline">
              About this stay
            </h3>
            <p className="text-base leading-relaxed text-on-surface-variant whitespace-pre-line">
              {listing.description}
            </p>
          </Reveal>

          {listing.amenities.length > 0 && (
            <Reveal className="space-y-5">
              <h3 className="text-xl font-semibold font-headline">
                What this place offers
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {listing.amenities.slice(0, 6).map((a) => (
                  <div
                    key={a.amenity.id}
                    className="flex items-center gap-3 p-3.5 bg-surface-container-low rounded-2xl hover:bg-surface-container transition-colors"
                  >
                    <span className="material-symbols-outlined text-primary">
                      {a.amenity.icon || "check_circle"}
                    </span>
                    <span className="text-sm font-medium">{a.amenity.name}</span>
                  </div>
                ))}
              </div>
              {listing.amenities.length > 6 && (
                <p className="text-sm text-on-surface-variant">
                  + {listing.amenities.length - 6} more
                </p>
              )}
            </Reveal>
          )}

          <Reveal
            as="div"
            className="bg-surface-container-lowest p-6 sm:p-8 rounded-3xl shadow-soft space-y-5"
          >
            <h3 className="text-lg font-semibold font-headline border-b border-surface-container pb-3">
              Your host
            </h3>
            <div className="flex items-center gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="w-14 h-14 rounded-full object-cover bg-surface-container-low ring-2 ring-primary-fixed/50"
                alt={`${listing.host.firstName ?? "Host"} ${listing.host.lastName ?? ""}`}
                src={
                  listing.host.avatarUrl ||
                  "https://api.dicebear.com/7.x/initials/svg?seed=" +
                    encodeURIComponent(listing.host.firstName ?? "Host")
                }
              />
              <div>
                <p className="font-bold text-base">
                  {listing.host.firstName} {listing.host.lastName}
                </p>
                <p className="text-xs text-on-surface-variant">
                  Hosted with UNesta
                </p>
              </div>
            </div>
          </Reveal>

          {listing.houseRules.length > 0 && (
            <Reveal className="space-y-4">
              <h3 className="text-xl font-semibold font-headline">
                House rules
              </h3>
              <ul className="space-y-2 text-sm text-on-surface-variant">
                {listing.houseRules.map((r) => (
                  <li key={r.id} className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-base text-primary mt-0.5">
                      check
                    </span>
                    {r.ruleText}
                  </li>
                ))}
              </ul>
            </Reveal>
          )}
        </div>

        {/* Right column — desktop reservation */}
        <div className="lg:col-span-4 space-y-8">
          <div className="hidden lg:block bg-surface-container-lowest p-6 rounded-3xl shadow-float space-y-5 sticky top-24">
            <div className="flex items-baseline justify-between border-b border-surface-container pb-3">
              <span className="text-2xl font-semibold font-headline">
                {currency.format(listing.basePrice)}
              </span>
              <span className="text-sm text-on-surface-variant">/ night</span>
            </div>
            <DateGuestFields
              checkIn={checkIn}
              checkOut={checkOut}
              adults={adults}
              children={children}
              today={today}
              onCheckIn={setCheckIn}
              onCheckOut={setCheckOut}
              onAdults={setAdults}
              onChildren={setChildren}
              maxGuests={listing.maxGuests}
            />
            <PriceSummary
              basePrice={listing.basePrice}
              cleaningFee={listing.cleaningFee}
              pricing={pricing}
            />
            {datesError && (
              <p role="alert" className="text-sm text-error font-medium">
                {datesError}
              </p>
            )}
            <Link
              href={bookHref}
              onClick={handleBookClick}
              aria-disabled={!!datesError}
              className={`block text-center w-full py-4 rounded-full font-bold text-sm press ${
                datesError
                  ? "bg-surface-container-high text-on-surface-variant pointer-events-none"
                  : "bg-primary text-on-primary shadow-glow-primary hover:brightness-105"
              }`}
            >
              {isAuthenticated ? "Reserve" : "Log in to reserve"}
            </Link>
            <p className="text-xs text-on-surface-variant text-center">
              You won&apos;t be charged yet.
            </p>
          </div>
        </div>
      </div>

      {/* Mobile sticky bottom bar */}
      <div className="fixed bottom-24 sm:bottom-28 left-0 right-0 px-4 z-30 lg:hidden">
        <div className="glass rounded-full shadow-float py-2.5 pl-5 pr-2.5 flex items-center justify-between max-w-md mx-auto border border-outline-variant/30">
          <div>
            <p className="text-lg font-semibold font-headline leading-none">
              {currency.format(listing.basePrice)}{" "}
              <span className="text-xs font-normal text-on-surface-variant">
                / night
              </span>
            </p>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="text-xs text-primary font-semibold mt-1"
            >
              {shortDate(checkIn)} – {shortDate(checkOut)} · {guests} guest
              {guests === 1 ? "" : "s"}
            </button>
          </div>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="bg-primary text-on-primary px-6 py-3 rounded-full font-bold press shadow-glow-primary"
          >
            Reserve
          </button>
        </div>
      </div>

      <BottomSheet
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Your stay"
      >
        <div className="space-y-5">
          <DateGuestFields
            checkIn={checkIn}
            checkOut={checkOut}
            adults={adults}
            children={children}
            today={today}
            onCheckIn={setCheckIn}
            onCheckOut={setCheckOut}
            onAdults={setAdults}
            onChildren={setChildren}
            maxGuests={listing.maxGuests}
          />
          <PriceSummary
            basePrice={listing.basePrice}
            cleaningFee={listing.cleaningFee}
            pricing={pricing}
          />
          {datesError && (
            <p role="alert" className="text-sm text-error font-medium">
              {datesError}
            </p>
          )}
          <Link
            href={bookHref}
            onClick={(e) => {
              if (datesError) {
                e.preventDefault();
                toast.error(datesError);
                return;
              }
              if (!isAuthenticated) {
                e.preventDefault();
                router.push(`/login?next=${encodeURIComponent(bookHref)}`);
                return;
              }
              setModalOpen(false);
            }}
            className={`block text-center w-full py-4 rounded-full font-bold text-base press ${
              datesError
                ? "bg-surface-container-high text-on-surface-variant pointer-events-none"
                : "bg-primary text-on-primary shadow-glow-primary hover:brightness-105"
            }`}
          >
            {isAuthenticated ? "Continue" : "Log in to continue"}
          </Link>
          <p className="text-center text-xs text-on-surface-variant">
            You won&apos;t be charged yet
          </p>
        </div>
      </BottomSheet>
    </div>
  );
}

function DateGuestFields({
  checkIn,
  checkOut,
  adults,
  children,
  today,
  onCheckIn,
  onCheckOut,
  onAdults,
  onChildren,
  maxGuests,
}: {
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  today: string;
  onCheckIn: (v: string) => void;
  onCheckOut: (v: string) => void;
  onAdults: (n: number) => void;
  onChildren: (n: number) => void;
  maxGuests: number;
}) {
  return (
    <>
      <DateRangePicker
        checkIn={checkIn}
        checkOut={checkOut}
        min={today}
        onChange={(ci, co) => {
          onCheckIn(ci);
          onCheckOut(co);
        }}
      />
      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="text-[10px] uppercase font-bold tracking-wider text-on-surface-variant">
            Adults
          </span>
          <input
            type="number"
            min={1}
            max={maxGuests}
            value={adults}
            onChange={(e) =>
              onAdults(
                Math.max(1, Math.min(maxGuests, Number(e.target.value) || 1)),
              )
            }
            className="mt-1 w-full rounded-2xl border border-outline-variant/40 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-shadow"
          />
        </label>
        <label className="block">
          <span className="text-[10px] uppercase font-bold tracking-wider text-on-surface-variant">
            Children
          </span>
          <input
            type="number"
            min={0}
            max={Math.max(0, maxGuests - 1)}
            value={children}
            onChange={(e) =>
              onChildren(Math.max(0, Number(e.target.value) || 0))
            }
            className="mt-1 w-full rounded-2xl border border-outline-variant/40 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-shadow"
          />
        </label>
      </div>
    </>
  );
}

function PriceSummary({
  basePrice,
  cleaningFee,
  pricing,
}: {
  basePrice: number;
  cleaningFee: number;
  pricing: PriceBreakdown | null;
}) {
  return (
    <div className="bg-surface-container p-4 rounded-2xl space-y-2 text-sm">
      <Row
        label={
          pricing
            ? `${currency.format(basePrice)} × ${pricing.nights} nights`
            : "Subtotal"
        }
        value={pricing ? currency.format(pricing.subtotal) : "—"}
      />
      <Row
        label="Cleaning fee"
        value={currency.format(pricing?.cleaningFee ?? cleaningFee ?? 0)}
      />
      <Row
        label="Service fee"
        value={currency.format(pricing?.guestServiceFee ?? 0)}
      />
      <div className="border-t border-surface-container-high pt-2 mt-1 flex justify-between font-bold">
        <span>Total</span>
        <span>{currency.format(pricing?.totalAmount ?? basePrice)}</span>
      </div>
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

function PropertyDetailsSkeleton() {
  return (
    <div className="text-on-surface">
      <section className="mt-2 sm:mt-4">
        <div className="lg:hidden">
          <Skeleton className="w-full aspect-[4/5] sm:aspect-[16/10] sm:rounded-3xl sm:mx-4" />
        </div>
        <div className="hidden lg:block max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-4 grid-rows-2 gap-3 h-[460px] rounded-3xl overflow-hidden">
            <Skeleton className="col-span-2 row-span-2 rounded-none" />
            <Skeleton className="rounded-none" />
            <Skeleton className="rounded-none" />
            <Skeleton className="rounded-none" />
            <Skeleton className="rounded-none" />
          </div>
        </div>
      </section>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-10 grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 space-y-5">
          <Skeleton className="h-10 w-3/4 rounded-xl" />
          <Skeleton className="h-5 w-1/2 rounded-lg" />
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-4 w-full rounded-md" />
          <Skeleton className="h-4 w-2/3 rounded-md" />
        </div>
        <div className="lg:col-span-4">
          <Skeleton className="h-96 w-full rounded-3xl" />
        </div>
      </div>
    </div>
  );
}
