"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  ApiError,
  bookingsApi,
  fetchListingDetails,
  fetchPriceBreakdown,
  type ListingDetails,
  type PriceBreakdown,
} from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useRequireAuth } from "@/lib/use-require-auth";
import { useToast } from "@/lib/toast";
import { Skeleton } from "@/components/ui/Skeleton";

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const shortDate = (d: string) =>
  new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });

function isValidEmail(s: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<PaySkeleton />}>
      <PaymentInner />
    </Suspense>
  );
}

function PaymentInner() {
  const params = useParams<{ id: string }>();
  const search = useSearchParams();
  const router = useRouter();
  const toast = useToast();

  const id = params.id;
  const checkIn = search.get("checkIn") || "";
  const checkOut = search.get("checkOut") || "";
  const guests = Number(search.get("guests") || "0");

  const { isLoading: authLoading, isAuthenticated } = useRequireAuth();
  const { user } = useAuth();

  const [listing, setListing] = useState<ListingDetails | null>(null);
  const [pricing, setPricing] = useState<PriceBreakdown | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");
  const [errors, setErrors] = useState<{ [k: string]: string }>({});
  const [submitting, setSubmitting] = useState(false);

  const paramsValid =
    !!checkIn && !!checkOut && guests > 0 && new Date(checkOut) > new Date(checkIn);

  useEffect(() => {
    if (!user) return;
    setFullName(
      [user.firstName, user.lastName].filter(Boolean).join(" ").trim(),
    );
    setEmail(user.email ?? "");
    setPhone(user.phone ?? "");
  }, [user]);

  useEffect(() => {
    if (!isAuthenticated || !paramsValid) return;
    let cancelled = false;
    fetchListingDetails(id)
      .then((d) => !cancelled && setListing(d))
      .catch((e) => {
        if (!cancelled)
          setLoadError(
            e instanceof ApiError ? e.message : "Could not load stay.",
          );
      });
    fetchPriceBreakdown({ listingId: id, checkIn, checkOut, guests })
      .then((p) => !cancelled && setPricing(p))
      .catch(() => !cancelled && setPricing(null));
    return () => {
      cancelled = true;
    };
  }, [id, checkIn, checkOut, guests, isAuthenticated, paramsValid]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const nextErrors: typeof errors = {};
    if (!fullName.trim()) nextErrors.fullName = "Full name is required.";
    if (!email.trim() || !isValidEmail(email)) {
      nextErrors.email = "Valid email is required.";
    }
    if (!phone.trim() || !/^\+?\d{10,15}$/.test(phone.trim())) {
      nextErrors.phone = "Valid phone number is required.";
    }
    if (specialRequests.length > 500) {
      nextErrors.specialRequests = "Keep special requests under 500 characters.";
    }
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      const booking = await bookingsApi.create({
        listingId: id,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        numGuests: guests,
        specialRequests: specialRequests.trim() || undefined,
      });
      toast.success(
        booking.status === "CONFIRMED"
          ? "Booking confirmed!"
          : "Booking submitted. Awaiting host approval.",
      );
      router.push("/trips");
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : "Could not create booking.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (authLoading || !isAuthenticated) return <PaySkeleton />;

  if (!paramsValid) {
    return (
      <div className="max-w-2xl mx-auto p-6 mt-8">
        <div className="rounded-2xl bg-error-container/40 p-6 text-on-error-container">
          <p className="font-semibold">Missing booking details</p>
          <Link
            href={`/stays/${id}`}
            className="inline-block mt-2 text-sm font-bold underline"
          >
            Back to listing
          </Link>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="max-w-2xl mx-auto p-6 mt-8">
        <div className="rounded-2xl bg-error-container/40 p-6 text-on-error-container">
          <p className="font-semibold">Couldn’t load this booking</p>
          <p className="text-sm mt-1">{loadError}</p>
        </div>
      </div>
    );
  }

  if (!listing) return <PaySkeleton />;

  const cover =
    listing.images.find((i) => i.isCover)?.url ||
    listing.images[0]?.url ||
    "https://via.placeholder.com/600x400?text=No+Image";

  return (
    <main className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-8 pb-20">
      <Link
        href={`/stays/${id}/book?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`}
        className="text-primary inline-flex items-center gap-2 text-sm font-semibold hover:underline"
      >
        <span className="material-symbols-outlined">arrow_back</span>
        Back
      </Link>

      <section className="bg-surface-container-lowest p-4 flex gap-4 items-center rounded-2xl shadow-[0_4px_20px_rgba(26,28,28,0.04)]">
        <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={cover} alt={listing.title} className="w-full h-full object-cover" />
        </div>
        <div className="min-w-0">
          <h1 className="font-headline text-lg font-bold leading-tight line-clamp-2">
            {listing.title}
          </h1>
          <p className="text-sm text-on-surface-variant mt-1 flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">
              calendar_today
            </span>
            {shortDate(checkIn)} – {shortDate(checkOut)} · {guests} guest
            {guests === 1 ? "" : "s"}
          </p>
        </div>
      </section>

      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        <section className="space-y-4">
          <header className="flex items-center gap-2">
            <span className="w-1 h-6 bg-primary rounded-full" />
            <h2 className="font-headline text-xl font-bold">Guest details</h2>
          </header>

          <Field
            label="Full name"
            id="name"
            error={errors.fullName}
            value={fullName}
            onChange={(v) => {
              setFullName(v);
              if (errors.fullName) setErrors((p) => ({ ...p, fullName: "" }));
            }}
            autoComplete="name"
            maxLength={120}
            required
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field
              label="Email"
              id="email"
              type="email"
              error={errors.email}
              value={email}
              onChange={(v) => {
                setEmail(v);
                if (errors.email) setErrors((p) => ({ ...p, email: "" }));
              }}
              autoComplete="email"
              required
            />
            <Field
              label="Mobile number"
              id="phone"
              type="tel"
              error={errors.phone}
              value={phone}
              onChange={(v) => {
                setPhone(v);
                if (errors.phone) setErrors((p) => ({ ...p, phone: "" }));
              }}
              autoComplete="tel"
              required
            />
          </div>
        </section>

        <section className="space-y-3">
          <header className="flex items-center gap-2">
            <span className="w-1 h-6 bg-primary rounded-full" />
            <h2 className="font-headline text-xl font-bold">Anything else?</h2>
          </header>
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1 ml-1 block">
              Special requests (optional)
            </span>
            <textarea
              value={specialRequests}
              onChange={(e) => {
                setSpecialRequests(e.target.value);
                if (errors.specialRequests)
                  setErrors((p) => ({ ...p, specialRequests: "" }));
              }}
              maxLength={500}
              placeholder="Late check-in requested, high floor preferred…"
              rows={4}
              className={`w-full px-5 py-4 bg-surface-container-high rounded-2xl text-on-surface placeholder:text-outline/50 focus:ring-2 focus:ring-primary/30 outline-none transition resize-none ${
                errors.specialRequests ? "ring-2 ring-error/40" : ""
              }`}
            />
            <div className="flex justify-between mt-1 ml-1 text-xs text-on-surface-variant">
              <span>{errors.specialRequests}</span>
              <span>{specialRequests.length}/500</span>
            </div>
          </label>
        </section>

        <section className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/20 space-y-3">
          <h2 className="font-headline text-lg font-bold">Price summary</h2>
          <Row
            label={
              pricing
                ? `${currency.format(listing.basePrice)} × ${pricing.nights} nights`
                : "Subtotal"
            }
            value={pricing ? currency.format(pricing.subtotal) : "—"}
          />
          <Row
            label="Cleaning fee"
            value={currency.format(pricing?.cleaningFee ?? listing.cleaningFee ?? 0)}
          />
          <Row
            label="Service fee"
            value={currency.format(pricing?.guestServiceFee ?? 0)}
          />
          <div className="pt-3 border-t border-outline-variant/20 flex justify-between items-baseline">
            <span className="font-bold">Total</span>
            <span className="text-2xl font-headline font-extrabold text-primary">
              {currency.format(pricing?.totalAmount ?? listing.basePrice)}
            </span>
          </div>
        </section>

        <div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 bg-primary text-on-primary font-bold text-base rounded-full shadow-glow-primary press hover:brightness-105 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? "Submitting…" : "Confirm booking"}
          </button>
          <p className="text-center text-xs text-on-surface-variant mt-3 leading-relaxed">
            Payment gateway integration is pending — your booking will be created
            with PENDING status and you can pay when contacted by your host.
            <br />
            By confirming, you agree to UNesta&apos;s{" "}
            <a className="underline text-primary" href="#">
              Terms of Service
            </a>{" "}
            and{" "}
            <a className="underline text-primary" href="#">
              Cancellation Policy
            </a>
            .
          </p>
        </div>
      </form>
    </main>
  );
}

function Field({
  label,
  id,
  type = "text",
  value,
  onChange,
  error,
  required,
  autoComplete,
  maxLength,
}: {
  label: string;
  id: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  required?: boolean;
  autoComplete?: string;
  maxLength?: number;
}) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1 ml-1 block">
        {label}
        {required && <span className="text-error ml-0.5">*</span>}
      </span>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        maxLength={maxLength}
        aria-invalid={!!error}
        className={`w-full px-5 py-3.5 bg-surface-container-high rounded-2xl text-on-surface placeholder:text-outline/50 focus:ring-2 focus:ring-primary/30 outline-none transition ${
          error ? "ring-2 ring-error/40" : ""
        }`}
      />
      {error && <p className="text-xs text-error font-medium mt-1 ml-1">{error}</p>}
    </label>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm text-on-surface-variant">
      <span>{label}</span>
      <span className="font-semibold text-on-surface">{value}</span>
    </div>
  );
}

function PaySkeleton() {
  return (
    <main className="max-w-2xl mx-auto px-6 py-8 space-y-6">
      <Skeleton className="h-6 w-24" />
      <Skeleton className="h-28 rounded-2xl" />
      <Skeleton className="h-40 rounded-2xl" />
      <Skeleton className="h-40 rounded-2xl" />
      <Skeleton className="h-14 rounded-full" />
    </main>
  );
}
