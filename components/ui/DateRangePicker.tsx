"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";

/**
 * A friendly two-field date range picker with an animated month-grid popover.
 * Replaces native <input type="date"> for the stay search / reservation flows.
 *
 * Tap "Check-in" then "Check-out" to set a range; clicking a single day starts
 * a fresh range. Past days (before `min`) are disabled.
 */

function toIso(d: Date) {
  // Local date → YYYY-MM-DD (avoids UTC off-by-one from toISOString()).
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function fromIso(s: string) {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function addDays(d: Date, n: number) {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function buildMonth(year: number, month: number) {
  const first = new Date(year, month, 1);
  const startPad = first.getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < startPad; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

const fieldLabel = (iso: string) =>
  fromIso(iso).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

export function DateRangePicker({
  checkIn,
  checkOut,
  min,
  onChange,
}: {
  checkIn: string;
  checkOut: string;
  /** Earliest selectable date as YYYY-MM-DD. */
  min: string;
  onChange: (checkIn: string, checkOut: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<"in" | "out">("in");
  const rootRef = useRef<HTMLDivElement | null>(null);
  const popId = useId();

  const minDate = useMemo(() => startOfDay(fromIso(min)), [min]);
  const inDate = useMemo(() => startOfDay(fromIso(checkIn)), [checkIn]);
  const outDate = useMemo(() => startOfDay(fromIso(checkOut)), [checkOut]);

  const [view, setView] = useState(() => ({
    year: inDate.getFullYear(),
    month: inDate.getMonth(),
  }));

  // Keep the visible month in sync with check-in when the popover opens.
  useEffect(() => {
    if (open) setView({ year: inDate.getFullYear(), month: inDate.getMonth() });
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  // Close on outside click / Escape.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function selectDay(day: Date) {
    if (day < minDate) return;
    if (active === "in") {
      // Start a fresh range; push check-out to the next day if it'd collapse.
      const nextOut = outDate > day ? outDate : addDays(day, 1);
      onChange(toIso(day), toIso(nextOut));
      setActive("out");
    } else {
      if (day <= inDate) {
        // Tapping on/before check-in restarts the range from here.
        onChange(toIso(day), toIso(addDays(day, 1)));
        setActive("out");
      } else {
        onChange(toIso(inDate), toIso(day));
        setActive("in");
        setOpen(false);
      }
    }
  }

  const cells = buildMonth(view.year, view.month);
  const canGoPrev =
    view.year > minDate.getFullYear() ||
    (view.year === minDate.getFullYear() && view.month > minDate.getMonth());

  const nights = Math.max(
    0,
    Math.round((outDate.getTime() - inDate.getTime()) / 86_400_000),
  );

  return (
    <div ref={rootRef} className="relative">
      <div className="grid grid-cols-2 gap-3">
        <FieldTrigger
          label="Check-in"
          value={fieldLabel(checkIn)}
          activeNow={open && active === "in"}
          aria-expanded={open}
          aria-controls={popId}
          onClick={() => {
            setActive("in");
            setOpen(true);
          }}
        />
        <FieldTrigger
          label="Check-out"
          value={fieldLabel(checkOut)}
          activeNow={open && active === "out"}
          aria-expanded={open}
          aria-controls={popId}
          onClick={() => {
            setActive("out");
            setOpen(true);
          }}
        />
      </div>

      {open && (
        <div
          id={popId}
          role="dialog"
          aria-label="Choose dates"
          className="absolute z-50 mt-2 left-0 right-0 sm:left-auto sm:right-0 sm:w-[20rem] bg-surface-container-lowest rounded-3xl shadow-float border border-outline-variant/30 p-4 animate-scale-in origin-top"
        >
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              aria-label="Previous month"
              disabled={!canGoPrev}
              onClick={() =>
                setView((v) => {
                  const m = v.month - 1;
                  return m < 0
                    ? { year: v.year - 1, month: 11 }
                    : { year: v.year, month: m };
                })
              }
              className="grid place-items-center w-9 h-9 rounded-full hover:bg-surface-container disabled:opacity-30 disabled:pointer-events-none press"
            >
              <span className="material-symbols-outlined text-[20px]">
                chevron_left
              </span>
            </button>
            <p className="text-sm font-semibold font-headline" aria-live="polite">
              {MONTHS[view.month]} {view.year}
            </p>
            <button
              type="button"
              aria-label="Next month"
              onClick={() =>
                setView((v) => {
                  const m = v.month + 1;
                  return m > 11
                    ? { year: v.year + 1, month: 0 }
                    : { year: v.year, month: m };
                })
              }
              className="grid place-items-center w-9 h-9 rounded-full hover:bg-surface-container press"
            >
              <span className="material-symbols-outlined text-[20px]">
                chevron_right
              </span>
            </button>
          </div>

          <div className="grid grid-cols-7 mb-1">
            {WEEKDAYS.map((w, i) => (
              <span
                key={i}
                className="grid place-items-center h-8 text-[11px] font-bold text-on-surface-variant"
              >
                {w}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-y-1">
            {cells.map((day, i) => {
              if (!day) return <span key={i} />;
              const disabled = day < minDate;
              const isIn = sameDay(day, inDate);
              const isOut = sameDay(day, outDate);
              const inRange = day > inDate && day < outDate;
              const isEdge = isIn || isOut;
              return (
                <div
                  key={i}
                  className={[
                    "relative grid place-items-center h-10",
                    inRange ? "bg-primary-container/50" : "",
                    isIn && !sameDay(inDate, outDate)
                      ? "bg-primary-container/50 rounded-l-full"
                      : "",
                    isOut && !sameDay(inDate, outDate)
                      ? "bg-primary-container/50 rounded-r-full"
                      : "",
                  ].join(" ")}
                >
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => selectDay(day)}
                    aria-label={day.toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                    aria-pressed={isEdge}
                    className={[
                      "grid place-items-center w-10 h-10 rounded-full text-sm font-medium press transition-colors",
                      disabled
                        ? "text-on-surface-variant/30 pointer-events-none"
                        : "hover:bg-surface-container",
                      isEdge
                        ? "bg-primary text-on-primary font-bold shadow-glow-primary hover:bg-primary"
                        : "",
                    ].join(" ")}
                  >
                    {day.getDate()}
                  </button>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-surface-container">
            <span className="text-xs font-medium text-on-surface-variant">
              {nights} night{nights === 1 ? "" : "s"}
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-xs font-bold text-primary px-3 py-1.5 rounded-full hover:bg-primary-container/40 press"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function FieldTrigger({
  label,
  value,
  activeNow,
  onClick,
  ...rest
}: {
  label: string;
  value: string;
  activeNow: boolean;
  onClick: () => void;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "flex flex-col items-start text-left w-full rounded-2xl px-3.5 py-2.5 transition-shadow border",
        activeNow
          ? "border-primary ring-2 ring-primary/30 bg-surface-container-lowest"
          : "border-outline-variant/40 bg-surface-container-high hover:border-outline",
      ].join(" ")}
      {...rest}
    >
      <span className="text-[10px] uppercase font-bold tracking-wider text-on-surface-variant">
        {label}
      </span>
      <span className="mt-0.5 text-sm font-semibold text-on-surface">
        {value}
      </span>
    </button>
  );
}
