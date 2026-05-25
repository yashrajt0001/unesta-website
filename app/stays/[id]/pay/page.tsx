"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import {
  fetchListingDetails,
  fetchPriceBreakdown,
  type ListingDetails,
  type PriceBreakdown,
} from "@/lib/api";
import { Skeleton } from "@/components/ui/Skeleton";

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const shortDate = (d: string) =>
  new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });

export default function PaymentPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const id = params.id;

  const checkIn = searchParams.get("checkIn") || "2026-10-12";
  const checkOut = searchParams.get("checkOut") || "2026-10-15";
  const guests = Number(searchParams.get("guests") || "2");

  const [listing, setListing] = useState<ListingDetails | null>(null);
  const [pricing, setPricing] = useState<PriceBreakdown | null>(null);

  useEffect(() => {
    fetchListingDetails(id).then(setListing).catch(() => setListing(null));
    fetchPriceBreakdown({ listingId: id, checkIn, checkOut, guests })
      .then(setPricing)
      .catch(() => setPricing(null));
  }, [id, checkIn, checkOut, guests]);

  const cover =
    listing?.images.find((i) => i.isCover)?.url ||
    listing?.images[0]?.url ||
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAfVhG-A9Z4NE4O4VD3__E-K3Veue6SYqTog_sJd5ZJpUQ-qJFw-xewyI-7Hc3TY5GYs4XylBlCCRdZ6KnuC6TpccCjmkwKlKqDiJBdsvpyFDR2mn6VHQY5COUXkH9mgpW39_ReIZ6bBeAU9wtKw1RwmSC4lM3ExbOdj1KbYBLnR9Po1Rk4Fb0KNli9wumMPXq4Nz18JGjLKHzQllPF5tQoZYKAVd_jB5QhNXlMOUKOkY3X9496pECD_WnQJspLIR8ohGrR6uHgGz8";

  return (
    <main className="mt-8 px-6 max-w-2xl mx-auto space-y-8 pb-32">
      <Link
        href={`/stays/${id}/book?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`}
        className="text-primary inline-flex items-center gap-2"
      >
        <span className="material-symbols-outlined">arrow_back</span>
        Back
      </Link>

      {!listing ? (
        <>
          <section>
            <div className="bg-surface-container-lowest p-4 flex gap-4 items-center rounded-lg shadow-[0_4px_20px_rgba(26,28,28,0.04)]">
              <Skeleton className="w-24 h-24 rounded-2xl flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          </section>
          <section className="space-y-6">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-14 w-full rounded-2xl" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Skeleton className="h-14 rounded-2xl" />
              <Skeleton className="h-14 rounded-2xl" />
            </div>
          </section>
          <section className="space-y-6">
            <Skeleton className="h-6 w-44" />
            <div className="bg-surface-container-low p-6 rounded-lg space-y-6">
              <div className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
              <Skeleton className="h-20 w-full rounded-2xl" />
            </div>
          </section>
          <section className="pt-4">
            <div className="bg-surface-container-lowest p-6 rounded-lg space-y-4 border border-outline-variant/10">
              <Skeleton className="h-5 w-32" />
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex justify-between">
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-3 w-16" />
                </div>
              ))}
              <div className="pt-4 border-t border-outline-variant/20 flex justify-between">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-7 w-28" />
              </div>
            </div>
          </section>
          <Skeleton className="h-14 w-full rounded-full" />
        </>
      ) : (
        <>
          {/* Property summary */}
          <section>
            <div className="bg-surface-container-lowest p-4 flex gap-4 items-center rounded-lg shadow-[0_4px_20px_rgba(26,28,28,0.04)]">
              <div className="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0">
                <img
                  className="w-full h-full object-cover"
                  src={cover}
                  alt={listing.title}
                />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-label text-primary font-bold uppercase tracking-widest mb-1">
                  Boutique Stay
                </span>
                <h2 className="font-headline text-lg font-bold text-on-surface leading-tight">
                  {listing.title}
                </h2>
                <p className="text-sm text-on-surface-variant mt-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">
                    calendar_today
                  </span>
                  {shortDate(checkIn)} - {shortDate(checkOut)}
                </p>
              </div>
            </div>
          </section>

          {/* Guest details */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-1 h-6 bg-primary rounded-full"></span>
              <h3 className="font-headline text-xl font-bold">Guest Details</h3>
            </div>
            <div className="space-y-4">
              <div className="group">
                <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2 ml-1">
                  Full Name
                </label>
                <input
                  className="w-full px-5 py-4 bg-surface-container-high border-none rounded-2xl text-on-surface placeholder:text-outline/50 focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all"
                  placeholder="e.g. Julianne Moore"
                  type="text"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="group">
                  <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2 ml-1">
                    Email Address
                  </label>
                  <input
                    className="w-full px-5 py-4 bg-surface-container-high border-none rounded-2xl text-on-surface placeholder:text-outline/50 focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all"
                    placeholder="you@example.com"
                    type="email"
                  />
                </div>
                <div className="group">
                  <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2 ml-1">
                    Mobile Number
                  </label>
                  <input
                    className="w-full px-5 py-4 bg-surface-container-high border-none rounded-2xl text-on-surface placeholder:text-outline/50 focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all"
                    placeholder="+91 90000 00000"
                    type="tel"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Stay information */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-1 h-6 bg-primary rounded-full"></span>
              <h3 className="font-headline text-xl font-bold">
                Stay Information
              </h3>
            </div>
            <div className="bg-surface-container-low p-6 rounded-lg space-y-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container">
                    <span className="material-symbols-outlined">groups</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                      Total Guests
                    </p>
                    <p className="text-on-surface font-semibold">
                      {guests} {guests === 1 ? "guest" : "guests"}
                    </p>
                  </div>
                </div>
                <Link
                  href={`/stays/${id}`}
                  className="text-primary text-sm font-bold hover:underline"
                >
                  Edit
                </Link>
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider ml-1">
                  Special Requests
                </label>
                <textarea
                  className="w-full px-5 py-4 bg-surface-container-high border-none rounded-2xl text-on-surface placeholder:text-outline/50 focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all resize-none"
                  placeholder="Late check-in requested, high floor preferred..."
                  rows={3}
                />
              </div>
            </div>
          </section>

          {/* Price summary */}
          <section className="pt-4">
            <div className="bg-surface-container-lowest p-6 rounded-lg space-y-4 border border-outline-variant/10">
              <h3 className="font-headline text-lg font-bold mb-4">
                Price Summary
              </h3>
              <div className="flex justify-between text-on-surface-variant">
                <span className="text-sm">
                  {pricing?.nights ?? 1} nights ×{" "}
                  {currency.format(listing.basePrice)}
                </span>
                <span className="text-sm font-medium">
                  {currency.format(pricing?.subtotal ?? listing.basePrice)}
                </span>
              </div>
              <div className="flex justify-between text-on-surface-variant">
                <span className="text-sm">Cleaning fee</span>
                <span className="text-sm font-medium">
                  {currency.format(
                    pricing?.cleaningFee ?? listing.cleaningFee ?? 0
                  )}
                </span>
              </div>
              <div className="flex justify-between text-on-surface-variant">
                <span className="text-sm">Service fee</span>
                <span className="text-sm font-medium">
                  {currency.format(pricing?.guestServiceFee ?? 0)}
                </span>
              </div>
              <div className="pt-4 mt-2 border-t border-outline-variant/20 flex justify-between items-baseline">
                <span className="font-bold text-on-surface">Total Amount</span>
                <span className="text-2xl font-headline font-extrabold text-primary">
                  {currency.format(pricing?.totalAmount ?? listing.basePrice)}
                </span>
              </div>
            </div>
          </section>

          {/* Action */}
          <div className="pt-4">
            <button
              disabled
              className="w-full py-5 bg-gradient-to-r from-primary to-primary-container text-on-primary font-headline font-bold text-lg rounded-full shadow-lg hover:scale-[1.02] active:scale-95 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              Proceed to Payment
            </button>
            <p className="text-center text-xs text-on-surface-variant mt-4 px-8 leading-relaxed">
              By tapping Proceed, you agree to UNesta&apos;s{" "}
              <a className="underline text-primary" href="#">
                Terms of Service
              </a>{" "}
              and{" "}
              <a className="underline text-primary" href="#">
                Cancellation Policy
              </a>
              . Payment gateway integration is pending.
            </p>
          </div>
        </>
      )}
    </main>
  );
}
