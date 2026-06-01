"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Footer from "@/components/layout/Footer";
import SearchModal from "@/components/layout/SearchModal";
import { SkeletonStayCard } from "@/components/ui/Skeleton";
import { StayCard } from "@/components/ui/StayCard";
import { Reveal } from "@/components/ui/Reveal";
import { fetchPublishedListings, type ListingCard } from "@/lib/api";

const HOST_URL = "https://unesta-host-dashboard.vercel.app";

const categories = [
  { icon: "directions_boat", label: "Boating" },
  { icon: "directions_walk", label: "Heritage Walks" },
  { icon: "palette", label: "Workshops" },
  { icon: "agriculture", label: "Rural Tours" },
  { icon: "history_edu", label: "Culture" },
];

const curatedExperiences = [
  {
    title: "Royal Lake Pichola Boat Dinner",
    price: "₹12,000",
    unit: "/ couple",
    description:
      "Experience the magic of Udaipur's waters under the stars with a private multi-course dinner on a traditional Gangaur boat.",
    badge: "BEST SELLER",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBP9xykGGKgQtj5Kp5Kocx4dzKLVSVP1m_jyb4mVONbOgjNSrEbAwpyiWiVkhZcP-1NaIm2AAEeT8RroTM2mFTzp3A9ijvqZN3k9HCAOYFACYUi-GZeUQuiJc4czIenzQGMBPw-hTazzdYv1yU5w02gVrGJu4Pw0Gkxk1h7RpnLM3qdLe9gp3pjbcst7ykIFXnoNTP7Iw66s0AH5fG31WMQB1PW7iZIy0-tFYVAxjPGYzbfQrln0-K6UN42WPKt_CJSxJA4BjZGkpQ",
    meta: [
      { icon: "schedule", text: "3 Hours" },
      { icon: "star", text: "4.9 (124 reviews)" },
    ],
  },
  {
    title: "Heritage Old City Walk",
    price: "₹1,500",
    unit: "/ person",
    description:
      "Navigate the labyrinthine alleys of the old city with an expert historian. Discover hidden temples and artisan silver workshops.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDPsMIK7Z-XJpmeVl7Ygx7s0R5MF3pZhMPCG2CNP0i1tlmmLKxt0BHxdNvn7u90NgY1yG-aphb89mXDuCXujUclrQqKruRL9XDoeJcEjuIGUMRCrjq44Pzd0gPp_m7TlGbLRQqwBAF2U4WECJm-89BhhT8YUmlGrScdGqwnx3tQX-qVoCXM1p04-_saW8Vlko5CyaoWsoQW6sKqZvJvBzh0JLpFvkD7rMB_JvO0hDVWshKXwQkTnbLhHBeFtQkpI4sz_MfXRb47I2Y",
    meta: [
      { icon: "schedule", text: "4 Hours" },
      { icon: "group", text: "Max 8 people" },
    ],
  },
  {
    title: "Sunrise at Sajjan Garh",
    price: "₹4,500",
    unit: "/ group",
    description:
      "Witness the “Venice of the East” wake up from the highest vantage point in the city at the historic Monsoon Palace.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAiGVqVK2Hu9oLX2muGZE2lKA3SYLeSoO_12slKNxfBM4jk7YaTvUipMreKlw9L7bDwK8-tyrUXEXWUB2VMSUhfLokXS3yQaSqNemGwqd_L1egZSDkrIw7_OUJiT630J1Ft_-J1CIAHug-iJuZymhL8RrUwGaZlSVlsouAsSUBBS2_liS_zFeGSIv5607whR2vUNYhL1Ga67IyiWS5hE68pSDfxoNtQbEnIikGB9kOWnehTZnMbNyZQgyQnYQkZs6Ia6FHNHKTs6xg",
    meta: [{ icon: "distance", text: "Private transport included" }],
  },
];

const dayTrips = [
  {
    title: "Kumbhalgarh Night Safari",
    distance: "2 hours away",
    price: "₹6,500 / Jeep",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAQ34FAr8rQ__zs6sFg01QATwI9lgoeT03Fk9XM8B13rVHi2fqaIh01ZHjE8DAgGStZCU21gv0jOm2fPLegBcqwgb1pJDvEizVG8_knNb570ip8W26PpSP7UTsullNAmEg2wUxxxP5Aq-rMRdCPf7HBHvF9IszNjE6cqsbCsZhKdOxvaXg4Y0BfhKRdPQvYPEZGKO1Dx5BrgjLEDEDPTOQd6ev1kWT8PcXZd-_K4n1f47dZwJk_k3s8mFCay8O6LebynEmrQaSYrMQ",
  },
  {
    title: "Ranakpur Temple Tour",
    distance: "3 hours away",
    price: "₹3,200 / Person",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBgafEwSXud9TY2A2UWboFFvyZKw-rlLBbgys1agWXFFnQJzCdqIguOn-cyTwQYo3CKZNcnEqmDXS6dJAen-478b9AfQsIab3nWVFLtZDr0MSjvn4sq7QRMGyt8npVm4yflYdbj4_CG-L3T7u5Zf1vjdIF7AckJ8bqmhPPd9X5lQr89JHnMt2PZU_uoDHk-wyVlsUWI7BgOOfHQceq5gXp-h4ZhvRkea7nX1cz9wShkUWfmLEco8UaB16vKuRc0bawQ77JE8_pKRtY",
  },
];

const stories = [
  {
    tag: "Slow Travel",
    title: "A morning by Lake Pichola",
    excerpt:
      "A serene sunrise experience with the majestic City Palace reflecting in the calm waters.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBDYTrt5UTwStUd5EuRlPm8YpkQtdeSQ4bcvgBBIdhD_tdI1vYxdI7TzF0U-yNZKtqr3rW2UuPBYox9_oFqNDIcjD290g3h9gfC2-ESGHPdL9u4ngNcN-NlUYaWgydTLox_JINkGp5cN7wr1iDLLGOlmovadK7cDKl3x_9LXCsQxzm6JYwl2cFizTcwKc0D5GNIIUmqkBdDnX06CY_8JvkXm1pvgqhwV6haXvUPpCFkCSjGWB2qxGli4ZLVVxopi2uIrPe1t8wolgY",
  },
  {
    tag: "Local Culture",
    title: "Hidden cafes of the Old City",
    excerpt:
      "Discovering cozy, vibrant rooftop spots with panoramic views of Udaipur's white buildings.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAfVhG-A9Z4NE4O4VD3__E-K3Veue6SYqTog_sJd5ZJpUQ-qJFw-xewyI-7Hc3TY5GYs4XylBlCCRdZ6KnuC6TpccCjmkwKlKqDiJBdsvpyFDR2mn6VHQY5COUXkH9mgpW39_ReIZ6bBeAU9wtKw1RwmSC4lM3ExbOdj1KbYBLnR9Po1Rk4Fb0KNli9wumMPXq4Nz18JGjLKHzQllPF5tQoZYKAVd_jB5QhNXlMOUKOkY3X9496pECD_WnQJspLIR8ohGrR6uHgGz8",
  },
];

export default function ExperiencesPage() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [stays, setStays] = useState<ListingCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPublishedListings({ limit: 12 })
      .then(setStays)
      .catch(() => setStays([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      {/* Hero & search */}
      <section className="px-4 sm:px-6 pt-6 pb-8 space-y-6">
        <div className="space-y-4 lg:text-center max-w-2xl lg:mx-auto animate-fade-up">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-headline font-semibold tracking-tight text-on-surface leading-[1.08]">
            Find your next{" "}
            <em className="not-italic text-gradient-primary font-medium">
              escape in Udaipur.
            </em>
          </h2>
          <p className="text-on-surface-variant text-base leading-relaxed lg:mx-auto">
            Lake dinners, heritage walks and rooftop sunsets — experiences
            curated by locals who know the city by heart.
          </p>
        </div>

        {/* Search trigger (works on every breakpoint) */}
        <button
          type="button"
          onClick={() => setSearchOpen(true)}
          className="group w-full lg:w-[32rem] lg:mx-auto flex items-center bg-surface-container-lowest rounded-full pl-5 pr-2 py-2 gap-3 shadow-lift hover:shadow-float press text-left animate-fade-up"
          style={{ animationDelay: "120ms" }}
          aria-label="Search experiences"
        >
          <span className="material-symbols-outlined text-primary">search</span>
          <span className="flex-1 text-on-surface-variant font-medium truncate">
            Discover experiences in Udaipur
          </span>
          <span className="grid place-items-center w-10 h-10 rounded-full bg-primary text-on-primary group-hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-[20px]">tune</span>
          </span>
        </button>

        {/* Mobile category toggle */}
        <div className="flex justify-center lg:hidden">
          <div className="bg-surface-container-low p-1.5 rounded-full flex gap-1 w-full sm:w-auto">
            <Link
              href="/"
              className="flex-1 sm:flex-none py-2 px-4 sm:px-6 rounded-full text-xs sm:text-sm font-semibold text-on-surface-variant hover:text-on-surface transition-all text-center"
            >
              Stays
            </Link>
            <button className="flex-1 sm:flex-none py-2 px-4 sm:px-6 rounded-full bg-surface-container-lowest shadow-soft text-xs sm:text-sm font-semibold text-primary transition-all">
              Experiences
            </button>
          </div>
        </div>
      </section>

      {/* Experience categories */}
      <section className="mb-14 overflow-x-auto no-scrollbar px-4 sm:px-6">
        <div className="flex gap-6 sm:gap-8 items-center min-w-max pb-2">
          {categories.map((c) => (
            <button
              key={c.label}
              type="button"
              className="flex flex-col items-center gap-2 group press"
            >
              <div className="p-4 rounded-2xl bg-surface-container-low group-hover:bg-primary-fixed/50 transition-colors duration-300">
                <span className="material-symbols-outlined text-primary text-3xl">
                  {c.icon}
                </span>
              </div>
              <span className="text-xs font-medium text-on-surface-variant group-hover:text-on-surface transition-colors">
                {c.label}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Curated experiences */}
      <section className="px-4 sm:px-6 mb-16 max-w-7xl mx-auto">
        <Reveal>
          <h2 className="font-headline text-2xl sm:text-3xl font-semibold tracking-tight mb-7 text-on-surface">
            Curated experiences in Udaipur
          </h2>
        </Reveal>
        <div className="space-y-7 lg:grid lg:grid-cols-2 lg:gap-7 lg:space-y-0">
          {curatedExperiences.map((exp, i) => (
            <Reveal key={exp.title} delay={i * 80}>
              <article className="group bg-surface-container-lowest rounded-3xl overflow-hidden shadow-soft hover-lift hover:shadow-lift h-full">
                <div className="relative aspect-[16/9] overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    alt={exp.title}
                    src={exp.image}
                    className="w-full h-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-110"
                  />
                  {exp.badge && (
                    <div className="absolute top-4 left-4 glass px-3 py-1 rounded-full text-[11px] font-bold tracking-wide text-primary shadow-soft">
                      {exp.badge}
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2 gap-4">
                    <h3 className="font-headline text-xl font-semibold text-on-surface">
                      {exp.title}
                    </h3>
                    <span className="text-primary font-bold text-lg whitespace-nowrap">
                      {exp.price}{" "}
                      <span className="text-on-surface-variant text-xs font-normal">
                        {exp.unit}
                      </span>
                    </span>
                  </div>
                  <p className="text-on-surface-variant text-sm mb-4 leading-relaxed">
                    {exp.description}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-on-surface-variant font-medium flex-wrap">
                    {exp.meta.map((m) => (
                      <span key={m.text} className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">
                          {m.icon}
                        </span>
                        {m.text}
                      </span>
                    ))}
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Beyond the City */}
      <section className="mb-16 px-4 sm:px-6 max-w-7xl mx-auto">
        <Reveal className="flex justify-between items-end mb-6">
          <div>
            <h2 className="font-headline text-2xl sm:text-3xl font-semibold tracking-tight text-on-surface">
              Beyond the city
            </h2>
            <p className="text-on-surface-variant text-sm mt-0.5">
              Curated day trips from Udaipur
            </p>
          </div>
          <button className="text-primary font-semibold text-sm hover:underline">
            View all
          </button>
        </Reveal>
        <div className="flex gap-6 overflow-x-auto no-scrollbar pb-4 -mx-4 px-4 sm:-mx-6 sm:px-6">
          {dayTrips.map((trip) => (
            <div
              key={trip.title}
              className="group min-w-[300px] flex-none"
            >
              <div className="relative h-52 rounded-3xl overflow-hidden shadow-soft hover-lift hover:shadow-lift">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt={trip.title}
                  src={trip.image}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between text-white">
                  <div>
                    <h4 className="font-bold font-headline">{trip.title}</h4>
                    <p className="text-xs opacity-90">{trip.distance}</p>
                    <p className="text-sm font-bold mt-1">{trip.price}</p>
                  </div>
                  <span className="grid place-items-center bg-white/90 text-primary w-9 h-9 rounded-full group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-[20px]">
                      arrow_outward
                    </span>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Popular stays — wired to API */}
      <section className="mb-16 max-w-7xl mx-auto">
        <Reveal className="px-4 sm:px-6 flex justify-between items-end mb-5">
          <h3 className="text-xl sm:text-2xl font-headline font-semibold text-on-surface">
            Popular stays with UNesta
          </h3>
          <Link
            href="/"
            className="text-sm font-semibold text-primary hover:underline"
          >
            View all
          </Link>
        </Reveal>
        <div className="flex overflow-x-auto gap-4 sm:gap-6 px-4 sm:px-6 pb-2 hide-scrollbar snap-x">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <SkeletonStayCard key={i} />
              ))
            : stays.map((stay) => (
                <StayCard
                  key={stay.id}
                  stay={stay}
                  className="flex-none w-72 snap-start"
                />
              ))}
        </div>
      </section>

      {/* Host your space CTA */}
      <section className="px-4 sm:px-6 mb-16 max-w-7xl mx-auto">
        <Reveal
          as="div"
          className="relative min-h-[320px] sm:min-h-[420px] rounded-[2rem] overflow-hidden flex flex-col justify-end p-7 sm:p-12 shadow-float group"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt="Luxury villa interior"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDEqhQmCiXMx_skv2iuJZKGP2vmZKLJ2W9swkiYTDdLd8XfMkBa989CWm2oW5OJzCKT-XSi7uDDKk6NJyB7vN80Otxo8Kbawf_itr0VUvMbnZIram6Z4WpiZB6KbISJFGuJuHs8EQetttVJu1Pel1GGW4_SJ7rH7QUSfcddsNLuBrc-J1xDKwOm4Wbk3c1pThncz-tOfvYvGSLDzRXdAOA6kB_k3HbXknZ61iTgv3P1RFvh89sluMq7OCNWNTvKvYBf4xMiBEyws78"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-black/85 via-black/40 to-transparent" />
          <div className="relative z-10 max-w-md space-y-5">
            <h3 className="text-2xl sm:text-4xl font-headline font-semibold text-white leading-tight tracking-tight">
              Host your space
            </h3>
            <p className="text-white/90 font-medium text-sm sm:text-base leading-relaxed">
              Join our community of exceptional hosts and share your sanctuary
              with a global audience of conscious travelers.
            </p>
            <a
              href={HOST_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white text-primary px-7 sm:px-9 py-3.5 rounded-full font-bold text-sm press shadow-lg hover:shadow-xl"
            >
              Become a host
              <span className="material-symbols-outlined text-[18px]">
                arrow_forward
              </span>
            </a>
          </div>
        </Reveal>
      </section>

      {/* Travel Stories */}
      <section className="mb-12 max-w-7xl mx-auto">
        <Reveal className="px-4 sm:px-6 flex justify-between items-end mb-5">
          <h3 className="text-xl sm:text-2xl font-headline font-semibold text-on-surface">
            Travel stories
          </h3>
          <button className="text-sm font-semibold text-primary hover:underline">
            Read blog
          </button>
        </Reveal>
        <div className="flex overflow-x-auto gap-5 sm:gap-6 px-4 sm:px-6 pb-2 hide-scrollbar">
          {stories.map((s) => (
            <article
              key={s.title}
              className="flex-none w-72 group cursor-pointer"
            >
              <div className="relative aspect-square rounded-3xl overflow-hidden shadow-soft hover-lift hover:shadow-lift">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt={s.title}
                  src={s.image}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="space-y-1 mt-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
                  {s.tag}
                </span>
                <h4 className="text-lg font-headline font-semibold leading-snug group-hover:text-primary transition-colors">
                  {s.title}
                </h4>
                <p className="text-sm text-on-surface-variant line-clamp-2">
                  {s.excerpt}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <Footer />
      <SearchModal
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        mode="experiences"
      />
    </>
  );
}
