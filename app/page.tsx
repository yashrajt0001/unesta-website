"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Footer from "@/components/layout/Footer";
import SearchModal from "@/components/layout/SearchModal";
import { SkeletonStayCard } from "@/components/ui/Skeleton";
import { fetchPublishedListings, type ListingCard } from "@/lib/api";

const currency = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

function locationText(stay: ListingCard) {
  return `${stay.city}, ${stay.state}`;
}

function cover(stay: ListingCard) {
  return stay.images[0]?.url || "https://via.placeholder.com/800x600?text=No+Image";
}

function StayCard({ stay }: { stay: ListingCard }) {
  return (
    <Link href={`/stays/${stay.id}`} className="flex-none w-72 space-y-3 block group">
      <div className="relative aspect-[4/3.75] rounded-lg overflow-hidden bg-surface-container-low">
        <img alt={stay.title} src={cover(stay)} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
      </div>
      <div>
        <h4 className="font-bold text-on-surface group-hover:text-primary transition-colors line-clamp-1">{stay.title}</h4>
        <p className="text-sm text-on-surface-variant">{locationText(stay)}</p>
        <p className="text-sm text-on-surface-variant">Up to {stay.maxGuests} guests</p>
        <p className="text-lg font-headline font-bold text-primary mt-1">{currency.format(stay.basePrice)} <span className="text-xs font-normal text-on-surface-variant">/ night</span></p>
      </div>
    </Link>
  );
}

export default function StaysPage() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [stays, setStays] = useState<ListingCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPublishedListings({ limit: 24 })
      .then(setStays)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const featured = useMemo(() => stays.slice(0, 8), [stays]);

  return (
    <>
      <section className="px-4 sm:px-6 pt-4 pb-8 space-y-4">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl lg:text-center font-headline font-extrabold tracking-tight text-on-surface leading-tight">
          Find your next <span className="text-primary">escape.</span>
        </h2>
        <div className="lg:hidden" onClick={() => setSearchOpen(true)}>
          <div className="flex items-center bg-surface-container-high rounded-full px-4 py-3 gap-4 cursor-pointer shadow-sm">
            <span className="material-symbols-outlined text-primary">search</span>
            <span className="text-on-surface-variant font-medium">Search stays</span>
          </div>
        </div>
      </section>

      <section className="space-y-4 mb-10">
        <div className="px-4 sm:px-6 flex justify-between items-end gap-2">
          <h3 className="text-lg sm:text-xl font-headline font-bold text-on-surface">Live Stays</h3>
          <span className="text-xs text-on-surface-variant">{loading ? "Loading…" : `${stays.length} listings`}</span>
        </div>

        {loading && (
          <div className="flex overflow-x-auto gap-4 sm:gap-6 px-4 sm:px-6 hide-scrollbar">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonStayCard key={i} />
            ))}
          </div>
        )}
        {error && <p className="px-4 sm:px-6 text-red-600">{error}</p>}
        {!loading && !error && stays.length === 0 && (
          <p className="px-4 sm:px-6 text-on-surface-variant">No published listings available yet.</p>
        )}

        {!loading && featured.length > 0 && (
          <div className="flex overflow-x-auto gap-4 sm:gap-6 px-4 sm:px-6 hide-scrollbar">
            {featured.map((stay) => <StayCard key={stay.id} stay={stay} />)}
          </div>
        )}
      </section>

      <Footer />
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} mode="stays" />
    </>
  );
}
