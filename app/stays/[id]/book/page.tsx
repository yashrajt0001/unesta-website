"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { fetchListingDetails, fetchPriceBreakdown, type ListingDetails, type PriceBreakdown } from "@/lib/api";

const currency = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

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
    fetchPriceBreakdown({ listingId: id, checkIn, checkOut, guests }).then(setPricing).catch(() => setPricing(null));
  }, [id, checkIn, checkOut, guests]);

  const payHref = `/stays/${id}/pay?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`;

  return (
    <div className="min-h-screen p-6 space-y-6">
      <Link href={`/stays/${id}`} className="text-primary inline-flex items-center gap-2"><span className="material-symbols-outlined">arrow_back</span>Back to listing</Link>
      {!listing ? <p>Loading...</p> : (
        <div className="bg-surface-container-lowest p-6 rounded-2xl space-y-4">
          <h1 className="text-2xl font-bold">Review booking</h1>
          <div className="flex gap-4">
            <img src={listing.images[0]?.url || "https://via.placeholder.com/300x200?text=No+Image"} alt={listing.title} className="w-28 h-24 object-cover rounded-xl" />
            <div>
              <p className="font-bold">{listing.title}</p>
              <p className="text-sm text-on-surface-variant">{listing.city}, {listing.state}</p>
            </div>
          </div>
          <p>Dates: {checkIn} to {checkOut}</p>
          <p>Guests: {guests}</p>
          <p className="font-bold">Total: {currency.format(pricing?.totalAmount ?? listing.basePrice)}</p>
          <Link href={payHref} className="block w-full bg-primary text-white text-center py-3 rounded-full font-bold">Continue to payment</Link>
        </div>
      )}
    </div>
  );
}
