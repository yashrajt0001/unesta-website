"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Footer from "@/components/layout/Footer";
import SearchModal from "@/components/layout/SearchModal";
import { SkeletonStayCard } from "@/components/ui/Skeleton";
import { StayCard } from "@/components/ui/StayCard";
import { Reveal } from "@/components/ui/Reveal";
import {
  ApiError,
  fetchPublishedListings,
  type ListingCard,
} from "@/lib/api";

const HERO_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAfVhG-A9Z4NE4O4VD3__E-K3Veue6SYqTog_sJd5ZJpUQ-qJFw-xewyI-7Hc3TY5GYs4XylBlCCRdZ6KnuC6TpccCjmkwKlKqDiJBdsvpyFDR2mn6VHQY5COUXkH9mgpW39_ReIZ6bBeAU9wtKw1RwmSC4lM3ExbOdj1KbYBLnR9Po1Rk4Fb0KNli9wumMPXq4Nz18JGjLKHzQllPF5tQoZYKAVd_jB5QhNXlMOUKOkY3X9496pECD_WnQJspLIR8ohGrR6uHgGz8";

const EXPERIENCES_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBP9xykGGKgQtj5Kp5Kocx4dzKLVSVP1m_jyb4mVONbOgjNSrEbAwpyiWiVkhZcP-1NaIm2AAEeT8RroTM2mFTzp3A9ijvqZN3k9HCAOYFACYUi-GZeUQuiJc4czIenzQGMBPw-hTazzdYv1yU5w02gVrGJu4Pw0Gkxk1h7RpnLM3qdLe9gp3pjbcst7ykIFXnoNTP7Iw66s0AH5fG31WMQB1PW7iZIy0-tFYVAxjPGYzbfQrln0-K6UN42WPKt_CJSxJA4BjZGkpQ";

const categories = [
  { icon: "villa", label: "Lakeside villas" },
  { icon: "temple_hindu", label: "Heritage havelis" },
  { icon: "cottage", label: "Boutique stays" },
  { icon: "deck", label: "Rooftop views" },
  { icon: "pool", label: "With a pool" },
  { icon: "self_improvement", label: "Quiet courtyards" },
];

const trust = [
  {
    icon: "verified_user",
    title: "Verified hosts",
    body: "Every host is reviewed by our team before a single key changes hands.",
  },
  {
    icon: "auto_awesome",
    title: "Handpicked stays",
    body: "No endless scrolling. Just a tight, curated collection worth your time.",
  },
  {
    icon: "support_agent",
    title: "Local support",
    body: "People who actually know Udaipur, on call from arrival to checkout.",
  },
];

export default function StaysPage() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [stays, setStays] = useState<ListingCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchPublishedListings({ limit: 24 })
      .then((data) => {
        if (!cancelled) setStays(data);
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e instanceof ApiError ? e.message : "Could not load stays.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const featured = useMemo(() => stays.slice(0, 8), [stays]);
  const rest = useMemo(() => stays.slice(8), [stays]);

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="px-4 sm:px-6 pt-4 sm:pt-6">
        <div className="relative max-w-7xl mx-auto overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] shadow-float">
          <div className="absolute inset-0 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt="Lake Palace shimmering on Lake Pichola at dusk, Udaipur"
              src={HERO_IMAGE}
              className="w-full h-full object-cover img-zoom-out"
            />
          </div>
          {/* layered scrims for legible text on any image */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/25" />
          <div className="absolute inset-0 bg-gradient-to-br from-[#321201]/40 via-transparent to-transparent" />

          <div className="relative z-10 flex flex-col justify-end min-h-[480px] sm:min-h-[560px] lg:min-h-[600px] p-6 sm:p-10 lg:p-14">
            <div className="max-w-2xl space-y-5">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wide text-white glass-dark rounded-full px-3 py-1.5 animate-fade-up">
                <span className="material-symbols-outlined text-[16px] text-primary-fixed-dim">
                  location_on
                </span>
                Udaipur, Rajasthan — the City of Lakes
              </span>

              <h1
                className="text-4xl sm:text-5xl lg:text-6xl font-headline font-semibold tracking-tight text-white leading-[1.05] animate-fade-up"
                style={{ animationDelay: "80ms" }}
              >
                Find your next{" "}
                <em className="not-italic italic font-medium text-primary-fixed-dim">
                  escape.
                </em>
              </h1>

              <p
                className="text-white/85 text-base sm:text-lg leading-relaxed max-w-xl animate-fade-up"
                style={{ animationDelay: "160ms" }}
              >
                Heritage havelis, lakeside villas and quiet courtyards —
                handpicked stays in the heart of Rajasthan.
              </p>

              {/* Search trigger */}
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="group w-full sm:max-w-md flex items-center bg-surface-container-lowest rounded-full pl-5 pr-2 py-2 gap-3 shadow-float hover:shadow-glow-primary press text-left animate-fade-up"
                style={{ animationDelay: "240ms" }}
                aria-label="Open search"
              >
                <span className="material-symbols-outlined text-primary">
                  search
                </span>
                <span className="flex-1 text-on-surface-variant font-medium truncate">
                  Search stays in Udaipur
                </span>
                <span className="grid place-items-center w-11 h-11 rounded-full bg-primary text-on-primary group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined text-[20px]">
                    tune
                  </span>
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Browse by category ───────────────────────────────────────── */}
      <section className="mt-10 sm:mt-12 max-w-7xl mx-auto">
        <Reveal className="px-4 sm:px-6 mb-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-on-surface-variant">
            Browse by vibe
          </h2>
        </Reveal>
        <div className="flex gap-3 overflow-x-auto hide-scrollbar px-4 sm:px-6 pb-1">
          {categories.map((c) => (
            <button
              key={c.label}
              type="button"
              onClick={() => setSearchOpen(true)}
              className="group flex-none flex items-center gap-2.5 bg-surface-container-lowest border border-outline-variant/30 rounded-full pl-3 pr-5 py-2.5 shadow-soft hover:shadow-lift hover:border-primary/40 press transition-all"
            >
              <span className="grid place-items-center w-9 h-9 rounded-full bg-primary-fixed/50 group-hover:bg-primary-fixed transition-colors">
                <span className="material-symbols-outlined text-[20px] text-primary">
                  {c.icon}
                </span>
              </span>
              <span className="text-sm font-semibold text-on-surface whitespace-nowrap">
                {c.label}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* ── Handpicked (horizontal scroll) ───────────────────────────── */}
      <section className="mt-12 sm:mt-16 max-w-7xl mx-auto">
        <Reveal className="px-4 sm:px-6 flex justify-between items-end gap-2 mb-5">
          <div>
            <h3 className="text-2xl sm:text-3xl font-headline font-semibold text-on-surface tracking-tight">
              Handpicked for you
            </h3>
            <p className="text-sm text-on-surface-variant mt-0.5">
              Fresh listings, ready to book
            </p>
          </div>
          <span className="text-xs font-medium text-on-surface-variant whitespace-nowrap">
            {loading
              ? "Loading…"
              : `${stays.length} stay${stays.length === 1 ? "" : "s"}`}
          </span>
        </Reveal>

        {loading && (
          <div className="flex overflow-x-auto gap-4 sm:gap-6 px-4 sm:px-6 hide-scrollbar">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonStayCard key={i} />
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="mx-4 sm:mx-6 rounded-3xl bg-error-container/40 p-6 text-on-error-container">
            <p className="font-semibold">Couldn’t load stays</p>
            <p className="text-sm mt-1">{error}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-3 text-sm font-bold underline"
            >
              Try again
            </button>
          </div>
        )}

        {!loading && !error && stays.length === 0 && (
          <div className="mx-4 sm:mx-6 rounded-3xl bg-surface-container-low p-12 text-center">
            <span className="material-symbols-outlined text-5xl text-on-surface-variant">
              house
            </span>
            <h2 className="font-headline font-semibold text-xl mt-3">
              No live stays yet
            </h2>
            <p className="text-on-surface-variant text-sm mt-1">
              Check back soon — our curators are adding new stays every week.
            </p>
          </div>
        )}

        {!loading && !error && featured.length > 0 && (
          <div className="flex overflow-x-auto gap-4 sm:gap-6 px-4 sm:px-6 pb-2 hide-scrollbar snap-x">
            {featured.map((stay, i) => (
              <Reveal
                key={stay.id}
                delay={Math.min(i, 5) * 70}
                className="flex-none w-72 snap-start"
              >
                <StayCard stay={stay} />
              </Reveal>
            ))}
          </div>
        )}
      </section>

      {/* ── Trust band ───────────────────────────────────────────────── */}
      <section className="mt-16 sm:mt-20 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="grid gap-4 sm:gap-6 sm:grid-cols-3">
          {trust.map((t, i) => (
            <Reveal key={t.title} delay={i * 80}>
              <div className="h-full bg-surface-container-lowest rounded-3xl p-6 sm:p-7 shadow-soft hover-lift hover:shadow-lift border border-outline-variant/15">
                <span className="grid place-items-center w-12 h-12 rounded-2xl bg-primary-fixed/50 mb-4">
                  <span className="material-symbols-outlined text-primary text-[26px]">
                    {t.icon}
                  </span>
                </span>
                <h4 className="font-headline font-semibold text-lg text-on-surface">
                  {t.title}
                </h4>
                <p className="text-sm text-on-surface-variant leading-relaxed mt-1.5">
                  {t.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── More places to stay (responsive grid) ────────────────────── */}
      {(loading || rest.length > 0) && (
        <section className="mt-16 sm:mt-20 px-4 sm:px-6 max-w-7xl mx-auto">
          <Reveal className="flex justify-between items-end gap-2 mb-6">
            <div>
              <h3 className="text-2xl sm:text-3xl font-headline font-semibold text-on-surface tracking-tight">
                More places to stay
              </h3>
              <p className="text-sm text-on-surface-variant mt-0.5">
                Every stay in our Udaipur collection
              </p>
            </div>
            <Link
              href="/search"
              className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline whitespace-nowrap"
            >
              See all
              <span className="material-symbols-outlined text-[18px]">
                arrow_forward
              </span>
            </Link>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
            {loading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <SkeletonStayCard key={i} className="w-full" />
                ))
              : rest.map((stay, i) => (
                  <Reveal key={stay.id} delay={Math.min(i, 7) * 50}>
                    <StayCard stay={stay} />
                  </Reveal>
                ))}
          </div>
        </section>
      )}

      {/* ── Experiences CTA ──────────────────────────────────────────── */}
      <section className="mt-16 sm:mt-24 px-4 sm:px-6 max-w-7xl mx-auto">
        <Reveal
          as="div"
          className="relative min-h-[320px] sm:min-h-[400px] rounded-[2rem] overflow-hidden flex flex-col justify-end p-7 sm:p-12 shadow-float group"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt="Private dinner on a traditional boat at dusk on Lake Pichola"
            src={EXPERIENCES_IMAGE}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-black/85 via-black/45 to-transparent" />
          <div className="relative z-10 max-w-md space-y-5">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-white/90 glass-dark rounded-full px-3 py-1">
              Beyond the room
            </span>
            <h3 className="text-2xl sm:text-4xl font-headline font-semibold text-white leading-tight tracking-tight">
              Lake dinners, heritage walks & rooftop sunsets
            </h3>
            <p className="text-white/85 font-medium text-sm sm:text-base leading-relaxed">
              Experiences curated by locals who know the city by heart — book
              the stay, then make it a story.
            </p>
            <Link
              href="/experiences"
              className="inline-flex items-center gap-2 bg-white text-primary px-7 sm:px-9 py-3.5 rounded-full font-bold text-sm press shadow-lg hover:shadow-xl"
            >
              Explore experiences
              <span className="material-symbols-outlined text-[18px]">
                arrow_forward
              </span>
            </Link>
          </div>
        </Reveal>
      </section>

      <div className="mt-16 sm:mt-24">
        <Footer />
      </div>

      <SearchModal
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        mode="stays"
      />
    </>
  );
}
