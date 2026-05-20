"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { fetchListingDetails, fetchPriceBreakdown, type ListingDetails, type PriceBreakdown } from "@/lib/api";

const currency = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

export default function PropertyDetailsPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [listing, setListing] = useState<ListingDetails | null>(null);
  const [pricing, setPricing] = useState<PriceBreakdown | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [checkIn, setCheckIn] = useState("2026-10-12");
  const [checkOut, setCheckOut] = useState("2026-10-15");
  const [guests, setGuests] = useState(2);

  useEffect(() => {
    fetchListingDetails(id).then(setListing).catch((e: Error) => setError(e.message));
  }, [id]);

  useEffect(() => {
    if (!listing) return;
    fetchPriceBreakdown({ listingId: listing.id, checkIn, checkOut, guests })
      .then(setPricing)
      .catch(() => setPricing(null));
  }, [listing, checkIn, checkOut, guests]);

  const bookHref = useMemo(() => {
    const qp = new URLSearchParams({ checkIn, checkOut, guests: String(guests) });
    return `/stays/${id}/book?${qp.toString()}`;
  }, [id, checkIn, checkOut, guests]);

  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!listing) return <div className="p-6 text-on-surface-variant">Loading listing...</div>;

  return (
    <div className="bg-background text-on-surface min-h-screen p-6 space-y-8">
      <Link href="/" className="text-primary inline-flex items-center gap-2"><span className="material-symbols-outlined">arrow_back</span>Back</Link>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <img src={listing.images[0]?.url || "https://via.placeholder.com/1200x800?text=No+Image"} alt={listing.title} className="w-full aspect-[4/3] object-cover rounded-2xl" />
          <div className="grid grid-cols-3 gap-3">
            {listing.images.slice(1, 4).map((img) => <img key={img.id} src={img.url} alt={listing.title} className="w-full aspect-square object-cover rounded-xl" />)}
          </div>
        </div>

        <div className="space-y-5">
          <h1 className="text-3xl font-bold">{listing.title}</h1>
          <p className="text-on-surface-variant">{listing.city}, {listing.state}, {listing.country}</p>
          <p>{listing.description}</p>
          <p className="text-on-surface-variant">{listing.bedrooms} bedrooms • {listing.beds} beds • {listing.bathrooms} baths • Up to {listing.maxGuests} guests</p>

          <div className="grid grid-cols-3 gap-3">
            <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className="border rounded-xl px-3 py-2" />
            <input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className="border rounded-xl px-3 py-2" />
            <input type="number" min={1} value={guests} onChange={(e) => setGuests(Math.max(1, Number(e.target.value) || 1))} className="border rounded-xl px-3 py-2" />
          </div>

          <div className="bg-surface-container-low rounded-2xl p-4">
            <p>{currency.format(listing.basePrice)} / night</p>
            <p className="text-sm text-on-surface-variant">Cleaning fee: {currency.format(listing.cleaningFee || 0)}</p>
            {pricing && <p className="font-bold mt-2">Total: {currency.format(pricing.totalAmount)}</p>}
          </div>

          <Link href={bookHref} className="block bg-primary text-white text-center py-3 rounded-full font-bold">Book now</Link>
        </div>
      </div>
    </div>
  );
}
