"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
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

export default function PropertyDetailsPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [listing, setListing] = useState<ListingDetails | null>(null);
  const [pricing, setPricing] = useState<PriceBreakdown | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [checkIn, setCheckIn] = useState("2026-10-12");
  const [checkOut, setCheckOut] = useState("2026-10-15");
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);

  const guests = adults + children;

  useEffect(() => {
    fetchListingDetails(id)
      .then(setListing)
      .catch((e: Error) => setError(e.message));
  }, [id]);

  useEffect(() => {
    if (!listing) return;
    fetchPriceBreakdown({ listingId: listing.id, checkIn, checkOut, guests })
      .then(setPricing)
      .catch(() => setPricing(null));
  }, [listing, checkIn, checkOut, guests]);

  const bookHref = useMemo(() => {
    const qp = new URLSearchParams({
      checkIn,
      checkOut,
      guests: String(guests),
    });
    return `/stays/${id}/book?${qp.toString()}`;
  }, [id, checkIn, checkOut, guests]);

  if (error) return <div className="p-6 text-error">{error}</div>;
  if (!listing) return <PropertyDetailsSkeleton />;

  const cover =
    listing.images.find((i) => i.isCover)?.url ||
    listing.images[0]?.url ||
    "https://via.placeholder.com/1200x800?text=No+Image";
  const grid = listing.images.slice(0, 5);

  return (
    <div className="bg-background text-on-surface">
      <section className="mt-4 relative">
        {/* Mobile slider */}
        <div className="lg:hidden">
          <div className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar px-4 gap-4">
            {(grid.length ? grid : [{ id: "ph", url: cover }]).map((img) => (
              <div key={img.id} className="flex-none w-[75vw] snap-center">
                <img
                  src={img.url}
                  alt={listing.title}
                  className="w-full aspect-[4/5] object-cover rounded-lg shadow-sm"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Desktop gallery grid */}
        <div className="hidden lg:block max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-4 grid-rows-2 gap-4 h-[448px]">
            <div className="col-span-2 row-span-2 relative overflow-hidden rounded-l-lg">
              <img
                src={grid[0]?.url || cover}
                alt={listing.title}
                className="w-full h-full object-cover hover:scale-105 transition duration-700"
              />
            </div>
            <div className="relative overflow-hidden">
              <img
                src={grid[1]?.url || cover}
                alt={listing.title}
                className="w-full h-full object-cover hover:scale-105 transition duration-700"
              />
            </div>
            <div className="relative overflow-hidden rounded-tr-lg">
              <img
                src={grid[2]?.url || cover}
                alt={listing.title}
                className="w-full h-full object-cover hover:scale-105 transition duration-700"
              />
            </div>
            <div className="relative overflow-hidden">
              <img
                src={grid[3]?.url || cover}
                alt={listing.title}
                className="w-full h-full object-cover hover:scale-105 transition duration-700"
              />
            </div>
            <div className="relative overflow-hidden rounded-br-lg">
              <img
                src={grid[4]?.url || cover}
                alt={listing.title}
                className="w-full h-full object-cover hover:scale-105 transition duration-700"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 mt-10 grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left column */}
        <div className="lg:col-span-8 space-y-12">
          {/* Title */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase font-label">
                Heritage Suite
              </span>
              <div className="flex items-center gap-1 text-primary">
                <span
                  className="material-symbols-outlined text-sm"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  star
                </span>
                <span className="font-bold text-sm">4.8</span>
                <span className="text-on-surface-variant font-normal">
                  (124 reviews)
                </span>
              </div>
            </div>
            <h2 className="text-4xl font-extrabold font-headline tracking-tight leading-tight text-on-surface">
              {listing.title}
            </h2>
            <div className="flex items-center gap-2 text-on-surface-variant">
              <span className="material-symbols-outlined text-primary">
                location_on
              </span>
              <span className="text-lg font-medium">
                {listing.city}, {listing.state}
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold font-headline text-on-surface">
              About the Sanctuary
            </h3>
            <p className="text-lg leading-relaxed text-on-surface-variant font-body">
              {listing.description}
            </p>
            <p className="text-sm text-on-surface-variant">
              {listing.bedrooms} bedrooms · {listing.beds} beds ·{" "}
              {listing.bathrooms} baths · Up to {listing.maxGuests} guests
            </p>
          </div>

          {/* Amenities */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold font-headline text-on-surface">
              Curated Amenities
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {(listing.amenities.length
                ? listing.amenities.slice(0, 6)
                : [
                    { amenity: { id: "1", name: "Rooftop Pool", icon: "pool" } },
                    {
                      amenity: {
                        id: "2",
                        name: "Authentic Cuisine",
                        icon: "restaurant",
                      },
                    },
                    { amenity: { id: "3", name: "Lake View", icon: "water" } },
                    {
                      amenity: {
                        id: "4",
                        name: "Heritage Suite",
                        icon: "castle",
                      },
                    },
                  ]
              ).map((a) => (
                <div
                  key={a.amenity.id}
                  className="flex items-center gap-3 p-3 bg-surface-container-low rounded-lg"
                >
                  <span className="material-symbols-outlined text-primary text-[24px]">
                    {a.amenity.icon || "check_circle"}
                  </span>
                  <span className="text-sm font-medium text-on-surface">
                    {a.amenity.name}
                  </span>
                </div>
              ))}
            </div>
            {listing.amenities.length > 6 && (
              <button className="w-full py-4 border border-outline-variant/30 rounded-full text-on-surface font-semibold hover:bg-surface-container-low transition-colors">
                Show all {listing.amenities.length} amenities
              </button>
            )}
          </div>

          {/* Host card */}
          <div className="bg-surface-container-lowest p-8 rounded-lg shadow-[0_8px_40px_-15px_rgba(0,0,0,0.04)] space-y-6">
            <h3 className="text-lg font-bold font-headline text-on-surface border-b border-surface-container-low pb-4">
              Your Concierge
            </h3>
            <div className="flex items-center gap-4">
              <div className="relative">
                <img
                  className="w-16 h-16 rounded-full object-cover"
                  alt={`${listing.host.firstName} ${listing.host.lastName}`}
                  src={
                    listing.host.avatarUrl ||
                    "https://lh3.googleusercontent.com/aida-public/AB6AXuCmbXobg675mZS2Gc0mOw-llw_LTCHcNHA_kbaY4aUOp8pYLqPyyiEwpOyZ4nJY8BpFyeHp5AncpfjpThGRUFPxRi6MpmFMr6oc79oiknmJeF9WT7krMyO84Xqpp7eZakthPA3rMRe9MRfskbFTLCKg_2KeaTlsLiN4uuriLYy3PD9JWqsT_9AicWBgpTdMaTr7QeaHJ0yL22MhZyLSs2ghdASAPTtEszirEGenkkmmMDeBA59mxMXjGeNCfcAk0FdaZPZIG1E9Iek"
                  }
                />
                <div className="absolute -bottom-1 -right-1 bg-primary text-white p-1 rounded-full border-2 border-white">
                  <span
                    className="material-symbols-outlined text-[12px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    verified
                  </span>
                </div>
              </div>
              <div>
                <p className="font-bold text-on-surface text-lg leading-none">
                  {listing.host.firstName} {listing.host.lastName}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <span className="bg-secondary-container text-on-secondary-container text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                    Superhost
                  </span>
                </div>
              </div>
            </div>
            <p className="text-sm text-on-surface-variant leading-relaxed italic">
              &ldquo;I personally ensure every guest experiences the royal
              hospitality my family has curated for generations.&rdquo;
            </p>
            <button className="w-full py-4 border border-outline-variant/30 rounded-full text-on-surface font-semibold hover:bg-surface-container-low transition-colors">
              Message {listing.host.firstName}
            </button>
          </div>

          {/* Things to know */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold font-headline text-on-surface">
              Things to know
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-3">
                <h4 className="font-bold text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-on-surface-variant">
                    event_busy
                  </span>
                  Cancellation policy
                </h4>
                <div className="space-y-2 text-sm text-on-surface-variant leading-relaxed">
                  <p>
                    Free cancellation before check-in. After that, the
                    reservation is non-refundable.
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="font-bold text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-on-surface-variant">
                    schedule
                  </span>
                  House rules
                </h4>
                <div className="space-y-2 text-sm text-on-surface-variant leading-relaxed">
                  {listing.houseRules.length ? (
                    listing.houseRules.map((r) => (
                      <p key={r.id}>{r.ruleText}</p>
                    ))
                  ) : (
                    <>
                      <p>Check-in after 12:00 pm</p>
                      <p>Checkout before 11:00 am</p>
                      <p>{listing.maxGuests} guests maximum</p>
                    </>
                  )}
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="font-bold text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-on-surface-variant">
                    health_and_safety
                  </span>
                  Safety &amp; property
                </h4>
                <div className="space-y-2 text-sm text-on-surface-variant leading-relaxed">
                  <p>Smoke alarm installed</p>
                  <p>Carbon monoxide alarm installed</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right column — desktop reservation card */}
        <div className="lg:col-span-4 space-y-8">
          <div className="hidden lg:block bg-surface-container-lowest p-8 rounded-lg shadow-[0_8px_40px_-15px_rgba(0,0,0,0.04)] space-y-6">
            <h3 className="text-lg font-bold font-headline text-on-surface border-b border-surface-container pb-4">
              Reserve your stay
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                  Check-in
                </label>
                <input
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="w-full rounded-2xl border border-outline px-4 py-3 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                  Check-out
                </label>
                <input
                  type="date"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="w-full rounded-2xl border border-outline px-4 py-3 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                  Adults
                </label>
                <input
                  type="number"
                  min={1}
                  value={adults}
                  onChange={(e) =>
                    setAdults(Math.max(1, Number(e.target.value) || 1))
                  }
                  className="w-full rounded-2xl border border-outline px-4 py-3 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                  Children
                </label>
                <input
                  type="number"
                  min={0}
                  value={children}
                  onChange={(e) =>
                    setChildren(Math.max(0, Number(e.target.value) || 0))
                  }
                  className="w-full rounded-2xl border border-outline px-4 py-3 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>
            <div className="bg-surface-container p-4 rounded-3xl border border-surface-container-low">
              <div className="flex items-center justify-between text-on-surface-variant text-sm">
                <span>Nightly rate</span>
                <span className="font-bold text-on-surface">
                  {currency.format(listing.basePrice)}
                </span>
              </div>
              <div className="flex items-center justify-between mt-2 text-sm text-on-surface-variant">
                <span>Cleaning fee</span>
                <span className="font-bold text-on-surface">
                  {currency.format(
                    pricing?.cleaningFee ?? listing.cleaningFee ?? 0
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between mt-2 text-sm text-on-surface-variant">
                <span>Service fee</span>
                <span className="font-bold text-on-surface">
                  {currency.format(pricing?.guestServiceFee ?? 0)}
                </span>
              </div>
              <div className="border-t border-surface-container-high pt-3 mt-3 flex items-center justify-between font-bold text-on-surface">
                <span>Total</span>
                <span>
                  {currency.format(
                    pricing?.totalAmount ?? listing.basePrice
                  )}
                </span>
              </div>
            </div>
            <Link
              href={bookHref}
              className="block text-center w-full bg-primary text-white py-4 rounded-full font-bold text-sm hover:opacity-90 transition-opacity shadow-lg shadow-primary/20"
            >
              Book Now
            </Link>
          </div>

          {/* Map */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold font-headline text-on-surface">
              Location
            </h3>
            <div className="bg-surface-container-low rounded-lg overflow-hidden h-64 relative group">
              <img
                alt="Map"
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuA63_dDW2M-Skq4enra9e60xg01ocPOkeE9NlF_h3su4sWxi7prQ2x377s09PibafMuMq5U4ZM4aomXXRNKJp0LwfNKLBVX5-BIfx3fTjGpRUV31O3qaPc-EOScxmMlNSyRb1zcQ37XIxG1OKOwJZw6Ad8B6IuAHQ81_6DDcqJ2BkRwW9cKuqjLTjRg1QqAj854NIIlrG2iXx4QfYogE3bAJl0KyyLEt-uATzhPy2vefaUQTCl1-Aub_FMUaRcWyg4L5Wx6AQ8uKWg"
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="bg-primary text-white p-3 rounded-full shadow-xl ring-8 ring-primary/20">
                  <span className="material-symbols-outlined">location_on</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sticky bottom bar */}
      <div className="fixed bottom-20 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-surface-container py-4 px-6 z-30 lg:hidden">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div>
            <p className="text-lg font-extrabold text-on-surface">
              {currency.format(listing.basePrice)}{" "}
              <span className="text-sm font-normal text-on-surface-variant">
                / night
              </span>
            </p>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="text-xs text-primary font-bold underline cursor-pointer"
            >
              {shortDate(checkIn)} - {shortDate(checkOut)}
            </button>
          </div>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="bg-primary text-white px-8 py-3 rounded-full font-bold hover:opacity-90 transition-opacity shadow-lg shadow-primary/20"
          >
            Book Now
          </button>
        </div>
      </div>

      {/* Booking modal sheet */}
      {modalOpen && (
        <div className="fixed inset-0 z-[60] overflow-hidden">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setModalOpen(false)}
          ></div>
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-surface-container flex items-center justify-between sticky top-0 bg-white z-10">
              <h3 className="text-xl font-bold font-headline">
                Reserve your stay
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 space-y-8">
              <div className="space-y-4">
                <label className="text-sm font-bold text-on-surface-variant uppercase tracking-wider font-label">
                  Select Dates
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-surface-container-low rounded-lg border border-transparent focus-within:border-primary transition-all">
                    <p className="text-[10px] font-bold text-primary uppercase mb-1">
                      Check-in
                    </p>
                    <input
                      type="date"
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      className="w-full bg-transparent border-none p-0 text-on-surface font-bold focus:ring-0"
                    />
                  </div>
                  <div className="p-4 bg-surface-container-low rounded-lg border border-transparent focus-within:border-primary transition-all">
                    <p className="text-[10px] font-bold text-primary uppercase mb-1">
                      Check-out
                    </p>
                    <input
                      type="date"
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      className="w-full bg-transparent border-none p-0 text-on-surface font-bold focus:ring-0"
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <label className="text-sm font-bold text-on-surface-variant uppercase tracking-wider font-label">
                  Guests
                </label>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-lg">
                    <div>
                      <p className="font-bold text-on-surface">Adults</p>
                      <p className="text-xs text-on-surface-variant">
                        Ages 13 or above
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => setAdults((v) => Math.max(1, v - 1))}
                        className="w-8 h-8 rounded-full border border-outline flex items-center justify-center hover:bg-white"
                      >
                        <span className="material-symbols-outlined text-sm">
                          remove
                        </span>
                      </button>
                      <span className="w-4 text-center font-bold">
                        {adults}
                      </span>
                      <button
                        onClick={() => setAdults((v) => v + 1)}
                        className="w-8 h-8 rounded-full border border-outline flex items-center justify-center hover:bg-white"
                      >
                        <span className="material-symbols-outlined text-sm">
                          add
                        </span>
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-lg">
                    <div>
                      <p className="font-bold text-on-surface">Children</p>
                      <p className="text-xs text-on-surface-variant">
                        Ages 2 – 12
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => setChildren((v) => Math.max(0, v - 1))}
                        className="w-8 h-8 rounded-full border border-outline flex items-center justify-center hover:bg-white"
                      >
                        <span className="material-symbols-outlined text-sm">
                          remove
                        </span>
                      </button>
                      <span className="w-4 text-center font-bold">
                        {children}
                      </span>
                      <button
                        onClick={() => setChildren((v) => v + 1)}
                        className="w-8 h-8 rounded-full border border-outline flex items-center justify-center hover:bg-white"
                      >
                        <span className="material-symbols-outlined text-sm">
                          add
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="pt-4 border-t border-surface-container space-y-3">
                <div className="flex justify-between text-on-surface-variant">
                  <span>
                    {currency.format(listing.basePrice)} ×{" "}
                    {pricing?.nights ?? 1} nights
                  </span>
                  <span>
                    {currency.format(pricing?.subtotal ?? listing.basePrice)}
                  </span>
                </div>
                <div className="flex justify-between text-on-surface-variant">
                  <span>Service fee</span>
                  <span>{currency.format(pricing?.guestServiceFee ?? 0)}</span>
                </div>
                <div className="flex justify-between font-bold text-on-surface pt-3 border-t border-surface-container-low text-lg">
                  <span>Total</span>
                  <span>
                    {currency.format(
                      pricing?.totalAmount ?? listing.basePrice
                    )}
                  </span>
                </div>
              </div>
              <Link
                href={bookHref}
                className="block text-center w-full bg-primary text-white py-5 rounded-full font-bold text-lg hover:opacity-90 transition-opacity shadow-lg shadow-primary/20"
              >
                Confirm Selection
              </Link>
              <p className="text-center text-xs text-on-surface-variant font-medium">
                You won&apos;t be charged yet
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PropertyDetailsSkeleton() {
  return (
    <div className="bg-background text-on-surface">
      <section className="mt-4 relative">
        <div className="lg:hidden">
          <div className="flex overflow-x-auto no-scrollbar px-4 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton
                key={i}
                className="flex-none w-[75vw] aspect-[4/5] rounded-lg"
              />
            ))}
          </div>
        </div>
        <div className="hidden lg:block max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-4 grid-rows-2 gap-4 h-[448px]">
            <Skeleton className="col-span-2 row-span-2 rounded-l-lg" />
            <Skeleton className="" />
            <Skeleton className="rounded-tr-lg" />
            <Skeleton className="" />
            <Skeleton className="rounded-br-lg" />
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 mt-10 grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 space-y-12">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-6 w-32 rounded-full" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-5 w-1/2" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-6 w-48" />
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-14 rounded-lg" />
              ))}
            </div>
          </div>
          <div className="bg-surface-container-lowest p-8 rounded-lg shadow-[0_8px_40px_-15px_rgba(0,0,0,0.04)] space-y-6">
            <Skeleton className="h-5 w-40" />
            <div className="flex items-center gap-4">
              <Skeleton className="w-16 h-16 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-12 w-full rounded-full" />
          </div>
        </div>
        <div className="lg:col-span-4 space-y-8">
          <div className="hidden lg:block bg-surface-container-lowest p-8 rounded-lg shadow-[0_8px_40px_-15px_rgba(0,0,0,0.04)] space-y-6">
            <Skeleton className="h-5 w-40" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-16 rounded-2xl" />
              <Skeleton className="h-16 rounded-2xl" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-16 rounded-2xl" />
              <Skeleton className="h-16 rounded-2xl" />
            </div>
            <Skeleton className="h-28 rounded-3xl" />
            <Skeleton className="h-12 w-full rounded-full" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-64 w-full rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
