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
  maximumFractionDigits: 2,
});

const formatDateRange = (a: string, b: string) => {
  const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" };
  const yearOpts: Intl.DateTimeFormatOptions = { year: "numeric" };
  const start = new Date(a);
  const end = new Date(b);
  return `${start.toLocaleDateString("en-GB", opts)}–${end.toLocaleDateString(
    "en-GB",
    opts
  )} ${end.toLocaleDateString("en-GB", yearOpts)}`;
};

export default function BookPage() {
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

  const payHref = `/stays/${id}/pay?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`;

  const cover =
    listing?.images.find((i) => i.isCover)?.url ||
    listing?.images[0]?.url ||
    "https://a0.muscache.com/im/pictures/hosting/Hosting-1592850183143381012/original/9ddda6fa-b195-4dc2-8163-b3d932c32f58.jpeg?im_w=320";

  return (
    <div className="bg-surface-container-low text-on-surface min-h-screen pt-8 pb-20 px-6">
      <Link
        href={`/stays/${id}`}
        className="text-primary inline-flex items-center gap-2 mb-6"
      >
        <span className="material-symbols-outlined">arrow_back</span>
        Back to listing
      </Link>

      <div className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-[1fr_minmax(auto,420px)] gap-12 md:gap-24 items-start">
        {/* Checkout steps */}
        <div className="bg-surface-container-lowest p-6 md:p-8 rounded-[1.5rem] shadow-[0_8px_40px_-15px_rgba(0,0,0,0.06)] border border-surface-container-low flex flex-col gap-8 w-full h-fit">
          <div className="space-y-6">
            <h2 className="text-2xl md:text-[1.75rem] font-bold font-headline text-on-surface tracking-tight">
              1. Log in or sign up
            </h2>
            <Link
              href="/login"
              className="inline-block bg-primary hover:opacity-90 text-white font-bold py-3.5 px-8 rounded-xl transition-opacity text-base shadow-sm"
            >
              Continue
            </Link>
          </div>
          <div className="h-px bg-surface-container w-full"></div>
          <div className="space-y-6">
            <h2 className="text-2xl md:text-[1.75rem] font-bold font-headline text-on-surface-variant/60 tracking-tight">
              2. Add a payment method
            </h2>
          </div>
          <div className="h-px bg-surface-container w-full"></div>
          <div className="space-y-6">
            <h2 className="text-2xl md:text-[1.75rem] font-bold font-headline text-on-surface-variant/60 tracking-tight">
              3. Review your reservation
            </h2>
          </div>
        </div>

        {/* Review card */}
        <div className="bg-surface-container-lowest p-6 md:p-8 rounded-[1.5rem] shadow-[0_8px_40px_-15px_rgba(0,0,0,0.06)] border border-surface-container-low w-full space-y-6 mx-auto">
          <div className="flex items-center gap-4 border-b border-surface-container pb-4">
            <Link
              href={`/stays/${id}`}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors -ml-2"
              aria-label="Go back"
            >
              <span className="material-symbols-outlined text-on-surface">
                arrow_back
              </span>
            </Link>
            <h1 className="text-xl md:text-2xl font-bold font-headline text-on-surface">
              Review and continue
            </h1>
          </div>

          {!listing ? (
            <div className="space-y-6">
              <div className="flex gap-4">
                <Skeleton className="w-28 h-24 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              </div>
              <div className="h-px bg-surface-container"></div>
              <div className="space-y-6">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between"
                  >
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-3 w-28" />
                    </div>
                    <Skeleton className="h-8 w-16 rounded-lg" />
                  </div>
                ))}
              </div>
              <div className="pt-6 border-t border-surface-container flex items-end justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-8 w-28" />
              </div>
              <Skeleton className="h-14 w-full rounded-full" />
            </div>
          ) : (
            <>
              {/* Property snippet */}
              <div className="flex gap-4">
                <div className="w-28 h-24 flex-shrink-0">
                  <img
                    src={cover}
                    alt={listing.title}
                    className="w-full h-full object-cover rounded-xl shadow-sm"
                  />
                </div>
                <div className="flex flex-col justify-center py-1 space-y-2">
                  <h3 className="text-sm font-bold text-on-surface line-clamp-2 leading-snug">
                    {listing.title}
                  </h3>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-xs">
                      <span
                        className="material-symbols-outlined text-primary text-[14px]"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        star
                      </span>
                      <span className="font-bold text-on-surface">4.95</span>
                      <span className="text-on-surface-variant">
                        (20 reviews)
                      </span>
                    </div>
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-secondary-container/50 text-on-secondary-container rounded-md text-[10px] font-bold uppercase tracking-wider">
                      <span
                        className="material-symbols-outlined text-[12px] text-primary"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        workspace_premium
                      </span>
                      Guest favourite
                    </div>
                  </div>
                </div>
              </div>

              <div className="h-px bg-surface-container"></div>

              {/* Details */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold font-headline text-on-surface text-base">
                      Dates
                    </p>
                    <p className="text-on-surface-variant text-sm font-medium">
                      {formatDateRange(checkIn, checkOut)}
                    </p>
                  </div>
                  <Link
                    href={`/stays/${id}`}
                    className="text-sm font-bold text-on-surface underline decoration-outline-variant hover:text-primary transition-colors py-2 px-3 hover:bg-surface-container rounded-lg"
                  >
                    Change
                  </Link>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold font-headline text-on-surface text-base">
                      Guests
                    </p>
                    <p className="text-on-surface-variant text-sm font-medium">
                      {guests} {guests === 1 ? "guest" : "guests"}
                    </p>
                  </div>
                  <Link
                    href={`/stays/${id}`}
                    className="text-sm font-bold text-on-surface underline decoration-outline-variant hover:text-primary transition-colors py-2 px-3 hover:bg-surface-container rounded-lg"
                  >
                    Change
                  </Link>
                </div>
              </div>

              {/* Price */}
              <div className="pt-6 border-t border-surface-container space-y-4">
                <div className="flex items-end justify-between">
                  <div>
                    <h3 className="font-bold font-headline text-on-surface text-xl">
                      Total price
                    </h3>
                    <p className="text-xs text-on-surface-variant font-medium underline cursor-pointer decoration-dotted underline-offset-2">
                      including taxes
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold font-headline text-on-surface text-2xl tracking-tight">
                      {currency.format(
                        pricing?.totalAmount ?? listing.basePrice
                      )}
                    </p>
                    <button className="text-[10px] font-bold text-on-surface uppercase tracking-widest bg-surface-container hover:bg-surface-container-high transition-colors px-2 py-1 rounded mt-1">
                      INR
                    </button>
                  </div>
                </div>
              </div>

              <Link
                href={payHref}
                className="block text-center w-full bg-primary text-white py-4 rounded-full font-bold text-lg hover:opacity-90 transition-opacity shadow-lg shadow-primary/20 mt-4"
              >
                Confirm and pay
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
