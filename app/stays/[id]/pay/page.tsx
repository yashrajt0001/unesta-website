"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { fetchListingDetails, fetchPriceBreakdown, type ListingDetails, type PriceBreakdown } from "@/lib/api";

const currency = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

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
    fetchPriceBreakdown({ listingId: id, checkIn, checkOut, guests }).then(setPricing).catch(() => setPricing(null));
  }, [id, checkIn, checkOut, guests]);

  return (
    <div className="min-h-screen p-6 space-y-6">
      <Link href={`/stays/${id}/book?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`} className="text-primary inline-flex items-center gap-2"><span className="material-symbols-outlined">arrow_back</span>Back</Link>
      {!listing ? <p>Loading...</p> : (
        <div className="bg-surface-container-lowest p-6 rounded-2xl space-y-5">
          <h1 className="text-2xl font-bold">Payment details</h1>
          <p className="text-on-surface-variant">{listing.title}</p>
          <p>{checkIn} to {checkOut} • {guests} guests</p>
          <div className="space-y-2">
            <input className="w-full border rounded-xl px-4 py-3" placeholder="Full name" />
            <input className="w-full border rounded-xl px-4 py-3" placeholder="Email" type="email" />
            <input className="w-full border rounded-xl px-4 py-3" placeholder="Phone" type="tel" />
          </div>
          <div className="border-t pt-4 text-sm space-y-1">
            <p>Subtotal: {currency.format(pricing?.subtotal ?? listing.basePrice)}</p>
            <p>Cleaning: {currency.format(pricing?.cleaningFee ?? listing.cleaningFee ?? 0)}</p>
            <p>Service fee: {currency.format(pricing?.guestServiceFee ?? 0)}</p>
            <p className="font-bold text-base">Total: {currency.format(pricing?.totalAmount ?? listing.basePrice)}</p>
          </div>
          <button className="w-full py-3 rounded-full bg-primary text-white font-bold" disabled>
            Proceed to Payment (pending gateway integration)
          </button>
        </div>
      )}
    </div>
  );
}
