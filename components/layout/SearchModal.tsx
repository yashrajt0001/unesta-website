"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { DateRangePicker } from "@/components/ui/DateRangePicker";

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
  mode: "stays" | "experiences";
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function addDaysIso(base: string, days: number) {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export default function SearchModal({ open, onClose, mode }: SearchModalProps) {
  const router = useRouter();

  const [location, setLocation] = useState("Udaipur, Rajasthan");
  const [checkIn, setCheckIn] = useState(addDaysIso(todayIso(), 1));
  const [checkOut, setCheckOut] = useState(addDaysIso(todayIso(), 4));
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  const minToday = todayIso();
  const guests = adults + children;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (mode === "stays") {
      if (new Date(checkOut) <= new Date(checkIn)) {
        setError("Check-out must be after check-in.");
        return;
      }
      if (guests < 1) {
        setError("Add at least one guest.");
        return;
      }
      const qp = new URLSearchParams({
        location: location.trim() || "Udaipur",
        checkIn,
        checkOut,
        guests: String(guests),
      });
      router.push(`/search?${qp.toString()}`);
      onClose();
    } else {
      const q = query.trim();
      if (!q) {
        setError("Enter what you're looking for.");
        return;
      }
      const qp = new URLSearchParams({ q });
      router.push(`/search?${qp.toString()}`);
      onClose();
    }
  }

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={mode === "stays" ? "Find a stay" : "Find an experience"}
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {mode === "stays" ? (
          <div className="space-y-3">
            <label className="block">
              <span className="text-[10px] uppercase tracking-wider font-bold text-on-surface-variant">
                Location
              </span>
              <div className="mt-1.5 flex items-center gap-3 p-3.5 bg-surface-container-high rounded-2xl focus-within:ring-2 focus-within:ring-primary/30 transition-shadow">
                <span className="material-symbols-outlined text-primary">
                  location_on
                </span>
                <input
                  className="flex-1 bg-transparent outline-none text-sm font-medium text-on-surface placeholder:text-on-surface-variant/60"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="City or region"
                />
              </div>
            </label>

            <DateRangePicker
              checkIn={checkIn}
              checkOut={checkOut}
              min={minToday}
              onChange={(ci, co) => {
                setCheckIn(ci);
                setCheckOut(co);
              }}
            />

            <div className="p-4 bg-surface-container-high rounded-2xl space-y-3.5">
              <span className="text-[10px] uppercase tracking-wider font-bold text-on-surface-variant">
                Guests
              </span>
              <GuestRow
                label="Adults"
                sub="Age 13+"
                value={adults}
                min={1}
                onChange={setAdults}
              />
              <GuestRow
                label="Children"
                sub="Ages 2–12"
                value={children}
                min={0}
                onChange={setChildren}
              />
            </div>
          </div>
        ) : (
          <label className="block">
            <span className="text-[10px] uppercase tracking-wider font-bold text-on-surface-variant">
              What are you looking for?
            </span>
            <input
              className="mt-1.5 w-full p-4 bg-surface-container-high rounded-2xl outline-none focus:ring-2 focus:ring-primary/30 text-on-surface placeholder:text-on-surface-variant/60 transition-shadow"
              placeholder="e.g. boat dinner, heritage walk"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
          </label>
        )}

        {error && (
          <p role="alert" className="text-sm text-error font-medium">
            {error}
          </p>
        )}

        <button
          type="submit"
          className="w-full py-4 bg-primary text-on-primary rounded-full font-semibold press shadow-glow-primary hover:brightness-105 flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-[20px]">search</span>
          Search
        </button>
      </form>
    </BottomSheet>
  );
}

function GuestRow({
  label,
  sub,
  value,
  min,
  onChange,
}: {
  label: string;
  sub: string;
  value: number;
  min: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="font-semibold text-sm">{label}</p>
        <p className="text-xs text-on-surface-variant">{sub}</p>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label={`Decrease ${label}`}
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className="grid place-items-center w-9 h-9 rounded-full border border-outline/60 disabled:opacity-40 hover:border-primary hover:text-primary press transition-colors"
        >
          <span className="material-symbols-outlined text-base">remove</span>
        </button>
        <span className="w-5 text-center font-bold text-sm tabular-nums" aria-live="polite">
          {value}
        </span>
        <button
          type="button"
          aria-label={`Increase ${label}`}
          onClick={() => onChange(value + 1)}
          className="grid place-items-center w-9 h-9 rounded-full border border-outline/60 hover:border-primary hover:text-primary press transition-colors"
        >
          <span className="material-symbols-outlined text-base">add</span>
        </button>
      </div>
    </div>
  );
}
