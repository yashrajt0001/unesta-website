"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  ApiError,
  fetchSearchSuggestions,
  type SearchSuggestion,
} from "@/lib/api";
import { EASE_OUT_SOFT } from "@/components/ui/motion";

/* ─── date helpers (local-time safe) ─────────────────────────────────────── */

function toIso(d: Date) {
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
function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
function buildMonth(year: number, month: number) {
  const first = new Date(year, month, 1);
  const startPad = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < startPad; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}
const dayLabel = (d: Date) =>
  d.toLocaleDateString("en-US", { month: "short", day: "numeric" });

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/* Fallback destinations shown before the user types (mirrors the reference). */
const POPULAR: { icon: string; tint: string; label: string; sub: string; value: string }[] = [
  { icon: "near_me", tint: "bg-sky-100 text-sky-600", label: "Nearby", sub: "Find what's around you", value: "" },
  { icon: "castle", tint: "bg-amber-100 text-amber-700", label: "Udaipur, Rajasthan", sub: "City of Lakes", value: "Udaipur" },
  { icon: "temple_hindu", tint: "bg-rose-100 text-rose-600", label: "Jaipur, Rajasthan", sub: "The Pink City", value: "Jaipur" },
  { icon: "beach_access", tint: "bg-teal-100 text-teal-600", label: "Goa", sub: "Beaches & nightlife", value: "Goa" },
  { icon: "forest", tint: "bg-emerald-100 text-emerald-700", label: "Manali, Himachal", sub: "Mountain escapes", value: "Manali" },
];

type Section = "where" | "when" | "who" | null;

/* ─── component ───────────────────────────────────────────────────────────── */

export default function ExpandSearch() {
  const router = useRouter();
  const reduce = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const whereInputRef = useRef<HTMLInputElement>(null);

  const [active, setActive] = useState<Section>(null);

  // where
  const [location, setLocation] = useState("");
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [suggestLoading, setSuggestLoading] = useState(false);

  // when
  const today = useMemo(() => startOfDay(new Date()), []);
  const [checkIn, setCheckIn] = useState<string | null>(null);
  const [checkOut, setCheckOut] = useState<string | null>(null);
  const [edge, setEdge] = useState<"in" | "out">("in");
  const [view, setView] = useState(() => ({
    year: today.getFullYear(),
    month: today.getMonth(),
  }));

  // who
  const [adults, setAdults] = useState(0);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [pets, setPets] = useState(0);

  const open = active !== null;

  /* close on outside click / Escape */
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setActive(null);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActive(null);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  /* focus the Where input when it opens */
  useEffect(() => {
    if (active === "where") whereInputRef.current?.focus();
  }, [active]);

  /* debounced suggestion fetch */
  useEffect(() => {
    if (active !== "where") return;
    const q = location.trim();
    const t = setTimeout(
      () => {
        if (q.length < 2) {
          setSuggestions([]);
          setSuggestLoading(false);
          return;
        }
        setSuggestLoading(true);
        fetchSearchSuggestions(q)
          .then(setSuggestions)
          .catch((e) => {
            if (e instanceof ApiError) setSuggestions([]);
          })
          .finally(() => setSuggestLoading(false));
      },
      q.length < 2 ? 0 : 250,
    );
    return () => clearTimeout(t);
  }, [location, active]);

  /* derived labels */
  const whenLabel =
    checkIn && checkOut
      ? `${dayLabel(fromIso(checkIn))} – ${dayLabel(fromIso(checkOut))}`
      : checkIn
        ? dayLabel(fromIso(checkIn))
        : "Add dates";

  const guestTotal = adults + children;
  const whoLabel =
    guestTotal + infants + pets === 0
      ? "Add guests"
      : [
          guestTotal > 0 ? `${guestTotal} guest${guestTotal > 1 ? "s" : ""}` : null,
          infants > 0 ? `${infants} infant${infants > 1 ? "s" : ""}` : null,
          pets > 0 ? `${pets} pet${pets > 1 ? "s" : ""}` : null,
        ]
          .filter(Boolean)
          .join(", ");

  /* date selection */
  function selectDay(day: Date) {
    if (day < today) return;
    const ci = checkIn ? startOfDay(fromIso(checkIn)) : null;
    if (edge === "in" || !ci) {
      setCheckIn(toIso(day));
      setCheckOut(null);
      setEdge("out");
    } else if (day <= ci) {
      setCheckIn(toIso(day));
      setCheckOut(null);
      setEdge("out");
    } else {
      setCheckOut(toIso(day));
      setEdge("in");
    }
  }

  function pickLocation(value: string, label: string) {
    setLocation(value || label);
    setActive("when");
  }

  function submit() {
    const qp = new URLSearchParams();
    const loc = location.trim();
    if (loc) qp.set("location", loc);
    if (checkIn && checkOut) {
      qp.set("checkIn", checkIn);
      qp.set("checkOut", checkOut);
    }
    if (guestTotal > 0) qp.set("guests", String(guestTotal));
    setActive(null);
    router.push(`/search?${qp.toString()}`);
  }

  /* ─── render ───────────────────────────────────────────────────────────── */

  return (
    <>
      {/* dim backdrop while expanded */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-30 bg-black/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setActive(null)}
          />
        )}
      </AnimatePresence>

      <div ref={rootRef} className="search-bar relative z-40 w-full max-w-3xl mx-auto">
        {/* the pill bar */}
        <motion.div
          layout
          transition={
            reduce ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 34 }
          }
          className={[
            "relative flex items-stretch rounded-full border shadow-float",
            open
              ? "bg-surface-container-low/95 border-outline-variant/40"
              : "bg-surface-container-lowest border-outline-variant/30",
          ].join(" ")}
        >
          <WhereField
            active={active}
            setActive={setActive}
            location={location}
            setLocation={setLocation}
            inputRef={whereInputRef}
            onEnter={() => setActive("when")}
          />

          <Divider show={active !== "where" && active !== "when"} />

          <Segment
            id="when"
            active={active}
            setActive={setActive}
            label="When"
          >
            <span
              className={[
                "block text-sm truncate",
                checkIn ? "font-semibold text-on-surface" : "text-on-surface-variant/70",
              ].join(" ")}
            >
              {whenLabel}
            </span>
          </Segment>

          <Divider show={active !== "when" && active !== "who"} />

          {/* Who + search button share the last cell */}
          <div className="flex items-center pr-2">
            <Segment
              id="who"
              active={active}
              setActive={setActive}
              label="Who"
            >
              <span
                className={[
                  "block text-sm truncate",
                  guestTotal + infants + pets > 0
                    ? "font-semibold text-on-surface"
                    : "text-on-surface-variant/70",
                ].join(" ")}
              >
                {whoLabel}
              </span>
            </Segment>

            <motion.button
              type="button"
              onClick={submit}
              layout
              aria-label="Search"
              className="ml-1 flex items-center gap-2 h-12 rounded-full bg-primary text-on-primary font-semibold press shadow-glow-primary hover:brightness-105 overflow-hidden"
              animate={{ paddingLeft: open ? 18 : 14, paddingRight: open ? 22 : 14 }}
              transition={{ type: "spring", stiffness: 380, damping: 32 }}
            >
              <span className="material-symbols-outlined text-[20px]">search</span>
              <AnimatePresence initial={false}>
                {open && (
                  <motion.span
                    key="label"
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: "auto", opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="whitespace-nowrap text-sm"
                  >
                    Search
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </motion.div>

        {/* ── popovers ─────────────────────────────────────────────────── */}
        <AnimatePresence>
          {active === "where" && (
            <Popover key="pop-where" anchor="left">
              <p className="px-2 pt-1 pb-2 text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                {location.trim().length >= 2 ? "Destinations" : "Suggested destinations"}
              </p>

              {location.trim().length >= 2 ? (
                suggestLoading ? (
                  <div className="px-3 py-8 text-center text-sm text-on-surface-variant">
                    Searching…
                  </div>
                ) : suggestions.length > 0 ? (
                  <ul className="space-y-0.5">
                    {suggestions.map((s) => (
                      <li key={`${s.type}-${s.label}`}>
                        <button
                          type="button"
                          onClick={() => pickLocation(s.value, s.label)}
                          className="w-full flex items-center gap-3 rounded-2xl px-2 py-2.5 text-left hover:bg-surface-container press"
                        >
                          <span className="grid place-items-center w-11 h-11 rounded-xl bg-surface-container-high text-on-surface-variant flex-none">
                            <span className="material-symbols-outlined text-[22px]">
                              {s.type === "country"
                                ? "public"
                                : s.type === "state"
                                  ? "map"
                                  : "location_city"}
                            </span>
                          </span>
                          <span className="text-sm font-medium text-on-surface">
                            {s.label}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="px-3 py-8 text-center text-sm text-on-surface-variant">
                    No matches. Try another place.
                  </div>
                )
              ) : (
                <ul className="space-y-0.5">
                  {POPULAR.map((p) => (
                    <li key={p.label}>
                      <button
                        type="button"
                        onClick={() => pickLocation(p.value, p.label)}
                        className="w-full flex items-center gap-3 rounded-2xl px-2 py-2.5 text-left hover:bg-surface-container press"
                      >
                        <span className={`grid place-items-center w-11 h-11 rounded-xl flex-none ${p.tint}`}>
                          <span className="material-symbols-outlined text-[22px]">
                            {p.icon}
                          </span>
                        </span>
                        <span>
                          <span className="block text-sm font-semibold text-on-surface">
                            {p.label}
                          </span>
                          <span className="block text-xs text-on-surface-variant">
                            {p.sub}
                          </span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </Popover>
          )}

          {active === "when" && (
            <Popover key="pop-when" anchor="center" wide>
              <div className="relative grid grid-cols-1 sm:grid-cols-2 gap-6">
                <button
                  type="button"
                  aria-label="Previous month"
                  disabled={
                    view.year === today.getFullYear() &&
                    view.month <= today.getMonth()
                  }
                  onClick={() =>
                    setView((v) => {
                      const m = v.month - 1;
                      return m < 0 ? { year: v.year - 1, month: 11 } : { year: v.year, month: m };
                    })
                  }
                  className="absolute -top-1 left-0 grid place-items-center w-9 h-9 rounded-full hover:bg-surface-container disabled:opacity-30 disabled:pointer-events-none press"
                >
                  <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                </button>
                <button
                  type="button"
                  aria-label="Next month"
                  onClick={() =>
                    setView((v) => {
                      const m = v.month + 1;
                      return m > 11 ? { year: v.year + 1, month: 0 } : { year: v.year, month: m };
                    })
                  }
                  className="absolute -top-1 right-0 grid place-items-center w-9 h-9 rounded-full hover:bg-surface-container press"
                >
                  <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                </button>

                <MonthGrid
                  year={view.year}
                  month={view.month}
                  today={today}
                  checkIn={checkIn}
                  checkOut={checkOut}
                  onSelect={selectDay}
                />
                <MonthGrid
                  year={view.month === 11 ? view.year + 1 : view.year}
                  month={view.month === 11 ? 0 : view.month + 1}
                  today={today}
                  checkIn={checkIn}
                  checkOut={checkOut}
                  onSelect={selectDay}
                  className="hidden sm:block"
                />
              </div>

              <div className="flex items-center justify-between mt-4 pt-3 border-t border-outline-variant/20">
                <button
                  type="button"
                  onClick={() => {
                    setCheckIn(null);
                    setCheckOut(null);
                    setEdge("in");
                  }}
                  className="text-sm font-semibold text-on-surface underline px-2 py-1 hover:text-primary press"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={() => setActive("who")}
                  className="text-sm font-bold text-on-primary bg-primary rounded-full px-5 py-2 press hover:brightness-105"
                >
                  Next
                </button>
              </div>
            </Popover>
          )}

          {active === "who" && (
            <Popover key="pop-who" anchor="right">
              <GuestRow
                label="Adults"
                sub="Ages 13 or above"
                value={adults}
                min={0}
                onChange={setAdults}
              />
              <GuestRow
                label="Children"
                sub="Ages 2–12"
                value={children}
                min={0}
                onChange={setChildren}
              />
              <GuestRow
                label="Infants"
                sub="Under 2"
                value={infants}
                min={0}
                onChange={setInfants}
              />
              <GuestRow
                label="Pets"
                sub="Bringing a service animal?"
                value={pets}
                min={0}
                onChange={setPets}
                last
              />
            </Popover>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

/* ─── sub-components ──────────────────────────────────────────────────────── */

function Segment({
  id,
  active,
  setActive,
  label,
  children,
  grow = false,
}: {
  id: Exclude<Section, null>;
  active: Section;
  setActive: (s: Section) => void;
  label: string;
  children: ReactNode;
  grow?: boolean;
}) {
  const isActive = active === id;
  return (
    <button
      type="button"
      onClick={() => setActive(id)}
      className={[
        "relative text-left rounded-full px-6 py-3 transition-colors",
        grow ? "flex-1 min-w-0" : "min-w-0",
        !isActive && active !== null ? "hover:bg-surface-container/60" : "",
      ].join(" ")}
    >
      {isActive && (
        <motion.span
          layoutId="searchSeg"
          className="absolute inset-0 rounded-full bg-surface-container-lowest shadow-lift"
          transition={{ type: "spring", stiffness: 420, damping: 36 }}
        />
      )}
      <span className="relative block">
        <span className="block text-[11px] font-bold uppercase tracking-wider text-on-surface mb-0.5">
          {label}
        </span>
        {children}
      </span>
    </button>
  );
}

/**
 * "Where" field with a Material-style floating label: "Where" sits centered as a
 * placeholder, then animates up onto the top edge of the pill when focused or
 * filled. No focus ring — it's a div wrapper, not a nested button.
 */
function WhereField({
  active,
  setActive,
  location,
  setLocation,
  inputRef,
  onEnter,
}: {
  active: Section;
  setActive: (s: Section) => void;
  location: string;
  setLocation: (s: string) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onEnter: () => void;
}) {
  const isActive = active === "where";
  const floated = isActive || location.trim().length > 0;

  return (
    <div
      onClick={() => {
        setActive("where");
        inputRef.current?.focus();
      }}
      className={[
        "relative flex-1 min-w-0 rounded-full cursor-text transition-colors",
        !isActive && active !== null ? "hover:bg-surface-container/60" : "",
      ].join(" ")}
    >
      {isActive && (
        <motion.span
          layoutId="searchSeg"
          className="absolute inset-0 rounded-full bg-surface-container-lowest shadow-lift"
          transition={{ type: "spring", stiffness: 420, damping: 36 }}
        />
      )}

      <div className="relative h-full px-6">
        <motion.label
          htmlFor="where-input"
          className="pointer-events-none absolute left-6 font-semibold tracking-wide text-on-surface whitespace-nowrap"
          initial={false}
          animate={{
            top: floated ? "9px" : "50%",
            y: floated ? "0%" : "-50%",
            fontSize: floated ? "11px" : "15px",
            letterSpacing: floated ? "0.06em" : "0em",
            textTransform: floated ? "uppercase" : "none",
            opacity: floated ? 0.9 : 0.75,
          }}
          transition={{ duration: 0.18, ease: EASE_OUT_SOFT }}
        >
          Where
        </motion.label>

        <input
          id="where-input"
          ref={inputRef}
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          onFocus={() => setActive("where")}
          placeholder={floated ? "Search destinations" : ""}
          className="absolute inset-x-6 bottom-[9px] bg-transparent outline-none border-none text-sm font-semibold text-on-surface placeholder:font-normal placeholder:text-on-surface-variant/60"
          onKeyDown={(e) => e.key === "Enter" && onEnter()}
        />
      </div>
    </div>
  );
}

function Divider({ show }: { show: boolean }) {
  return (
    <span
      aria-hidden
      className={[
        "self-center w-px h-8 bg-outline-variant/40 transition-opacity duration-200",
        show ? "opacity-100" : "opacity-0",
      ].join(" ")}
    />
  );
}

function Popover({
  children,
  anchor,
  wide = false,
}: {
  children: ReactNode;
  anchor: "left" | "center" | "right";
  wide?: boolean;
}) {
  const pos =
    anchor === "left"
      ? "left-0"
      : anchor === "right"
        ? "right-0"
        : "left-1/2 -translate-x-1/2";
  return (
    <motion.div
      role="dialog"
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.98 }}
      transition={{ duration: 0.22, ease: EASE_OUT_SOFT }}
      className={[
        "absolute top-full mt-3 z-50 origin-top",
        "bg-surface-container-lowest rounded-3xl shadow-float border border-outline-variant/30 p-4",
        wide ? "w-[min(46rem,calc(100vw-2rem))]" : "w-[26rem] max-w-[calc(100vw-2rem)]",
        pos,
      ].join(" ")}
    >
      {children}
    </motion.div>
  );
}

function MonthGrid({
  year,
  month,
  today,
  checkIn,
  checkOut,
  onSelect,
  className = "",
}: {
  year: number;
  month: number;
  today: Date;
  checkIn: string | null;
  checkOut: string | null;
  onSelect: (d: Date) => void;
  className?: string;
}) {
  const cells = buildMonth(year, month);
  const inDate = checkIn ? startOfDay(fromIso(checkIn)) : null;
  const outDate = checkOut ? startOfDay(fromIso(checkOut)) : null;

  return (
    <div className={className}>
      <p className="text-sm font-semibold font-headline text-center mb-3">
        {MONTHS[month]} {year}
      </p>
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map((w, i) => (
          <span
            key={i}
            className="grid place-items-center h-7 text-[11px] font-bold text-on-surface-variant"
          >
            {w}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-0.5">
        {cells.map((day, i) => {
          if (!day) return <span key={i} />;
          const disabled = day < today;
          const isIn = inDate && sameDay(day, inDate);
          const isOut = outDate && sameDay(day, outDate);
          const inRange = inDate && outDate && day > inDate && day < outDate;
          const isEdge = isIn || isOut;
          const hasRange = inDate && outDate && !sameDay(inDate, outDate);
          return (
            <div
              key={i}
              className={[
                "relative grid place-items-center h-10",
                inRange ? "bg-primary-container/40" : "",
                isIn && hasRange ? "bg-primary-container/40 rounded-l-full" : "",
                isOut && hasRange ? "bg-primary-container/40 rounded-r-full" : "",
              ].join(" ")}
            >
              <button
                type="button"
                disabled={disabled}
                onClick={() => onSelect(day)}
                aria-pressed={!!isEdge}
                className={[
                  "grid place-items-center w-10 h-10 rounded-full text-sm font-medium press transition-colors",
                  disabled
                    ? "text-on-surface-variant/30 line-through pointer-events-none"
                    : "hover:bg-surface-container",
                  isEdge ? "bg-primary text-on-primary font-bold shadow-glow-primary" : "",
                ].join(" ")}
              >
                {day.getDate()}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function GuestRow({
  label,
  sub,
  value,
  min,
  onChange,
  last = false,
}: {
  label: string;
  sub: string;
  value: number;
  min: number;
  onChange: (n: number) => void;
  last?: boolean;
}) {
  return (
    <div
      className={[
        "flex items-center justify-between py-4",
        last ? "" : "border-b border-outline-variant/20",
      ].join(" ")}
    >
      <div>
        <p className="font-semibold text-sm text-on-surface">{label}</p>
        <p className="text-xs text-on-surface-variant">{sub}</p>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label={`Decrease ${label}`}
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className="grid place-items-center w-8 h-8 rounded-full border border-outline/60 disabled:opacity-30 disabled:pointer-events-none hover:border-on-surface hover:text-on-surface press transition-colors"
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
          className="grid place-items-center w-8 h-8 rounded-full border border-outline/60 hover:border-on-surface hover:text-on-surface press transition-colors"
        >
          <span className="material-symbols-outlined text-base">add</span>
        </button>
      </div>
    </div>
  );
}
