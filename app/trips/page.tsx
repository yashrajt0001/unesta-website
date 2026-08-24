"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ApiError, bookingsApi, type Booking } from "@/lib/api";
import { useRequireAuth } from "@/lib/use-require-auth";
import { useToast } from "@/lib/toast";
import { Skeleton } from "@/components/ui/Skeleton";
import { Reveal } from "@/components/ui/Reveal";

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const STATUS_TABS: { key: "all" | "upcoming" | "past" | "cancelled"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "upcoming", label: "Upcoming" },
  { key: "past", label: "Past" },
  { key: "cancelled", label: "Cancelled" },
];

const STATUS_LABELS: Record<Booking["status"], { label: string; tone: string }> =
  {
    PENDING: {
      label: "Payment pending",
      tone: "bg-tertiary-container text-on-tertiary-container",
    },
    AWAITING_HOST: {
      label: "Awaiting host confirmation",
      tone: "bg-tertiary-container text-on-tertiary-container",
    },
    CONFIRMED: {
      label: "Confirmed",
      tone: "bg-secondary-container text-on-secondary-container",
    },
    CHECKED_IN: {
      label: "Checked in",
      tone: "bg-secondary-container text-on-secondary-container",
    },
    COMPLETED: {
      label: "Completed",
      tone: "bg-surface-container-high text-on-surface-variant",
    },
    CANCELLED_BY_GUEST: {
      label: "Cancelled",
      tone: "bg-error-container text-on-error-container",
    },
    CANCELLED_BY_HOST: {
      label: "Cancelled by host",
      tone: "bg-error-container text-on-error-container",
    },
    DECLINED: {
      label: "Declined",
      tone: "bg-error-container text-on-error-container",
    },
    EXPIRED: {
      label: "Expired",
      tone: "bg-surface-container-high text-on-surface-variant",
    },
  };

function bucket(b: Booking): "upcoming" | "past" | "cancelled" {
  if (
    b.status === "CANCELLED_BY_GUEST" ||
    b.status === "CANCELLED_BY_HOST" ||
    b.status === "DECLINED" ||
    b.status === "EXPIRED"
  ) {
    return "cancelled";
  }
  if (b.status === "COMPLETED") return "past";
  if (new Date(b.checkOutDate) < new Date()) return "past";
  return "upcoming";
}

export default function TripsPage() {
  const { isLoading: authLoading, isAuthenticated } = useRequireAuth();
  const toast = useToast();

  const [tab, setTab] = useState<(typeof STATUS_TABS)[number]["key"]>("upcoming");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;
    setLoading(true);
    bookingsApi
      .myBookings({ limit: 50 })
      .then((data) => {
        if (!cancelled) setBookings(data);
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e instanceof ApiError ? e.message : "Could not load trips.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  async function handleCancel(id: string) {
    const reason = prompt("Why are you cancelling? (optional)");
    if (reason === null) return; // user dismissed
    try {
      const updated = await bookingsApi.cancel(id, reason || undefined);
      setBookings((current) =>
        current.map((b) => (b.id === id ? { ...b, status: updated.status } : b)),
      );
      toast.success("Booking cancelled.");
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : "Could not cancel booking.",
      );
    }
  }

  const filtered = bookings.filter((b) => {
    if (tab === "all") return true;
    return bucket(b) === tab;
  });

  if (authLoading || !isAuthenticated) {
    return (
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-12 w-full rounded-2xl" />
        <Skeleton className="h-40 w-full rounded-2xl" />
      </section>
    );
  }

  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
      <header className="mb-6 animate-fade-up">
        <h1 className="text-2xl sm:text-3xl font-headline font-semibold tracking-tight">
          My trips
        </h1>
        <p className="text-on-surface-variant text-sm mt-1">
          All your reservations in one place.
        </p>
      </header>

      <div className="flex gap-2 overflow-x-auto no-scrollbar mb-6 -mx-1 px-1" role="tablist">
        {STATUS_TABS.map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={tab === t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-full text-sm font-semibold press whitespace-nowrap transition-colors ${
              tab === t.key
                ? "bg-primary text-on-primary shadow-soft"
                : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full rounded-2xl" />
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="rounded-2xl bg-error-container/40 p-6 text-on-error-container">
          <p className="font-semibold">Couldn’t load trips</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="rounded-3xl bg-surface-container-low p-12 text-center">
          <span className="material-symbols-outlined text-5xl text-on-surface-variant">
            luggage
          </span>
          <h2 className="font-headline font-semibold text-xl mt-3">
            No {tab === "all" ? "" : tab} trips
          </h2>
          <p className="text-on-surface-variant text-sm mt-1">
            When you book a stay, it’ll show up here.
          </p>
          <Link
            href="/"
            className="inline-block mt-5 px-6 py-3 bg-primary text-on-primary rounded-full font-semibold press shadow-glow-primary"
          >
            Find a stay
          </Link>
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="space-y-4">
          {filtered.map((b, i) => (
            <Reveal key={b.id} delay={Math.min(i, 6) * 60}>
              <TripCard booking={b} onCancel={handleCancel} />
            </Reveal>
          ))}
        </div>
      )}
    </section>
  );
}

function TripCard({
  booking,
  onCancel,
}: {
  booking: Booking;
  onCancel: (id: string) => void;
}) {
  const cover =
    booking.listing.images[0]?.url ||
    "https://via.placeholder.com/600x400?text=No+Image";
  const status = STATUS_LABELS[booking.status];
  const cancellable =
    booking.status === "PENDING" ||
    booking.status === "AWAITING_HOST" ||
    booking.status === "CONFIRMED";
  const fmt = (d: string) =>
    new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short" });

  return (
    <article className="group bg-surface-container-lowest rounded-3xl overflow-hidden shadow-soft hover:shadow-lift transition-shadow border border-outline-variant/15 flex flex-col sm:flex-row">
      <div className="sm:w-56 h-44 sm:h-auto flex-shrink-0 bg-surface-container-low overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={cover}
          alt={booking.listing.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      </div>
      <div className="flex-1 p-5 flex flex-col gap-3">
        <div className="flex justify-between items-start gap-3">
          <div className="min-w-0">
            <h2 className="font-headline font-bold text-lg leading-tight">
              {booking.listing.title}
            </h2>
            <p className="text-sm text-on-surface-variant">
              {booking.listing.city}, {booking.listing.state}
            </p>
          </div>
          <span
            className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full whitespace-nowrap ${status.tone}`}
          >
            {status.label}
          </span>
        </div>
        {booking.status === "AWAITING_HOST" && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-tertiary-container/40 text-on-tertiary-container text-sm">
            <span className="material-symbols-outlined text-[18px]">schedule</span>
            <HostResponseCountdown deadline={booking.hostResponseDeadline} />
          </div>
        )}
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="text-[10px] uppercase font-bold tracking-wider text-on-surface-variant">
              Dates
            </p>
            <p className="font-semibold">
              {fmt(booking.checkInDate)} – {fmt(booking.checkOutDate)}
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold tracking-wider text-on-surface-variant">
              Guests · Total
            </p>
            <p className="font-semibold">
              {booking.numGuests} · {currency.format(booking.totalPrice)}
            </p>
          </div>
        </div>
        <div className="flex gap-2 mt-auto pt-2">
          <Link
            href={`/stays/${booking.listing.id}`}
            className="px-4 py-2 text-sm font-semibold rounded-full border border-outline-variant/40 hover:bg-surface-container-low press"
          >
            View stay
          </Link>
          {cancellable && (
            <button
              type="button"
              onClick={() => onCancel(booking.id)}
              className="px-4 py-2 text-sm font-semibold rounded-full text-error hover:bg-error-container/40 press"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

// Live countdown on a paid booking the host has not confirmed yet. When it runs out
// the API expires the booking and refunds the guest, so we say so rather than tick to
// a stale zero.
function HostResponseCountdown({ deadline }: { deadline: string | null }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!deadline) return <span>Waiting for the host to confirm.</span>;

  const msLeft = new Date(deadline).getTime() - now;
  if (msLeft <= 0) {
    return <span>Time is up — your full refund is being processed.</span>;
  }

  const minutes = Math.floor(msLeft / 60000);
  const seconds = Math.floor((msLeft % 60000) / 1000);

  return (
    <span>
      Host has{" "}
      <span className="font-bold tabular-nums">
        {minutes}:{String(seconds).padStart(2, "0")}
      </span>{" "}
      to confirm — full refund if they don&apos;t.
    </span>
  );
}
