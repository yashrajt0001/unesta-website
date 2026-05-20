"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Footer from "@/components/layout/Footer";
import SearchModal from "@/components/layout/SearchModal";
import { fetchPublishedListings, type ListingCard } from "@/lib/api";

const currency = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

export default function ExperiencesPage() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [stays, setStays] = useState<ListingCard[]>([]);

  useEffect(() => {
    fetchPublishedListings({ limit: 12 }).then(setStays).catch(() => setStays([]));
  }, []);

  return (
    <>
      <section className="px-4 sm:px-6 pt-4 pb-8 space-y-4">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl lg:text-center font-headline font-extrabold tracking-tight text-on-surface leading-tight">
          Experiences are coming next. Browse live stays now.
        </h2>
        <div className="lg:hidden" onClick={() => setSearchOpen(true)}>
          <div className="flex items-center bg-surface-container-high rounded-full px-4 py-3 gap-4 cursor-pointer shadow-sm">
            <span className="material-symbols-outlined text-primary">search</span>
            <span className="text-on-surface-variant font-medium">Search</span>
          </div>
        </div>
      </section>

      <section className="space-y-4 mb-10">
        <div className="px-6 flex justify-between items-end">
          <h3 className="text-xl font-headline font-bold text-on-surface">Popular stays with UNESTA</h3>
          <Link href="/" className="text-sm font-semibold text-primary hover:underline">View all</Link>
        </div>
        <div className="flex overflow-x-auto gap-6 px-6 hide-scrollbar">
          {stays.map((stay) => (
            <Link href={`/stays/${stay.id}`} key={stay.id} className="flex-none w-72 space-y-3 group block">
              <div className="relative aspect-[4/3.75] rounded-lg overflow-hidden bg-surface-container-low">
                <img alt={stay.title} src={stay.images[0]?.url || "https://via.placeholder.com/800x600?text=No+Image"} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              </div>
              <div>
                <h4 className="font-bold text-on-surface group-hover:text-primary transition-colors line-clamp-1">{stay.title}</h4>
                <p className="text-sm text-on-surface-variant">{stay.city}, {stay.state}</p>
                <p className="text-lg font-headline font-bold text-primary mt-1">{currency.format(stay.basePrice)} <span className="text-xs font-normal text-on-surface-variant">/ night</span></p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <Footer />
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} mode="experiences" />
    </>
  );
}
