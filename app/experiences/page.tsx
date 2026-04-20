"use client";

import { useState } from "react";
import Link from "next/link";
import Footer from "@/components/layout/Footer";
import SearchModal from "@/components/layout/SearchModal";

/* ── Data ──────────────────────────────────────────────────── */

const expCategories = [
  { icon: "directions_boat", label: "Boating" },
  { icon: "directions_walk", label: "Heritage Walks" },
  { icon: "palette", label: "Workshops" },
  { icon: "agriculture", label: "Rural Tours" },
  { icon: "history_edu", label: "Culture" },
];

const curatedExperiences = [
  {
    id: 1,
    name: "Royal Lake Pichola Boat Dinner",
    desc: "Experience the magic of Udaipur's waters under the stars with a private multi-course dinner on a traditional Gangaur boat.",
    price: "₹12,000",
    priceUnit: "/ couple",
    duration: "3 Hours",
    rating: "4.9",
    reviews: 124,
    badge: "BEST SELLER",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBP9xykGGKgQtj5Kp5Kocx4dzKLVSVP1m_jyb4mVONbOgjNSrEbAwpyiWiVkhZcP-1NaIm2AAEeT8RroTM2mFTzp3A9ijvqZN3k9HCAOYFACYUi-GZeUQuiJc4czIenzQGMBPw-hTazzdYv1yU5w02gVrGJu4Pw0Gkxk1h7RpnLM3qdLe9gp3pjbcst7ykIFXnoNTP7Iw66s0AH5fG31WMQB1PW7iZIy0-tFYVAxjPGYzbfQrln0-K6UN42WPKt_CJSxJA4BjZGkpQ",
  },
  {
    id: 2,
    name: "Heritage Old City Walk",
    desc: "Navigate the labyrinthine alleys of the old city with an expert historian. Discover hidden temples and artisan silver workshops.",
    price: "₹1,500",
    priceUnit: "/ person",
    duration: "4 Hours",
    groupSize: "Max 8 people",
    badge: null,
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDPsMIK7Z-XJpmeVl7Ygx7s0R5MF3pZhMPCG2CNP0i1tlmmLKxt0BHxdNvn7u90NgY1yG-aphb89mXDuCXujUclrQqKruRL9XDoeJcEjuIGUMRCrjq44Pzd0gPp_m7TlGbLRQqwBAF2U4WECJm-89BhhT8YUmlGrScdGqwnx3tQX-qVoCXM1p04-_saW8Vlko5CyaoWsoQW6sKqZvJvBzh0JLpFvkD7rMB_JvO0hDVWshKXwQkTnbLhHBeFtQkpI4sz_MfXRb47I2Y",
  },
  {
    id: 3,
    name: "Sunrise at Sajjan Garh",
    desc: "Witness the 'Venice of the East' wake up from the highest vantage point in the city at the historic Monsoon Palace.",
    price: "₹4,500",
    priceUnit: "/ group",
    transport: "Private transport included",
    badge: null,
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAiGVqVK2Hu9oLX2muGZE2lKA3SYLeSoO_12slKNxfBM4jk7YaTvUipMreKlw9L7bDwK8-tyrUXEXWUB2VMSUhfLokXS3yQaSqNemGwqd_L1egZSDkrIw7_OUJiT630J1Ft_-J1CIAHug-iJuZymhL8RrUwGaZlSVlsouAsSUBBS2_liS_zFeGSIv5607whR2vUNYhL1Ga67IyiWS5hE68pSDfxoNtQbEnIikGB9kOWnehTZnMbNyZQgyQnYQkZs6Ia6FHNHKTs6xg",
  },
];

const dayTrips = [
  {
    id: 1,
    name: "Kumbhalgarh Night Safari",
    distance: "2 hours away",
    price: "₹6,500 / Jeep",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAQ34FAr8rQ__zs6sFg01QATwI9lgoeT03Fk9XM8B13rVHi2fqaIh01ZHjE8DAgGStZCU21gv0jOm2fPLegBcqwgb1pJDvEizVG8_knNb570ip8W26PpSP7UTsullNAmEg2wUxxxP5Aq-rMRdCPf7HBHvF9IszNjE6cqsbCsZhKdOxvaXg4Y0BfhKRdPQvYPEZGKO1Dx5BrgjLEDEDPTOQd6ev1kWT8PcXZd-_K4n1f47dZwJk_k3s8mFCay8O6LebynEmrQaSYrMQ",
    available: true,
  },
  {
    id: 2,
    name: "Ranakpur Temple Tour",
    distance: "3 hours away",
    price: null,
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBgafEwSXud9TY2A2UWboFFvyZKw-rlLBbgys1agWXFFnQJzCdqIguOn-cyTwQYo3CKZNcnEqmDXS6dJAen-478b9AfQsIab3nWJHop_y3m2ckwn0v2K5mvkOuzx7RiGlb2x8L0a2oc-L4",
    available: false,
  },
];

const popularStays = [
  {
    id: 1,
    name: "The Ivory Villa",
    location: "Rishikesh, Uttarakhand",
    price: "₹28,500",
    rating: "4.9",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDoMAtOPzHSDtg3BbG4VvZXV6NqCSixnqEQZFXaoIsIewXYke17GGNCk3uOvptJ-YLBTC8Ok65RGmcTxDuCAar6lNx5OoTKTu5_CipTalNgrg2Ypdoaz5m9ErKCJESYIoQc8FKw9xuEX0b4pLzm08YNmrQmD6TWMEnxdyMOLK54svwb4hedqn3gsJIjkAIvf6Y787tB8--PAwFZxBF0CZHm6KAXgRQg-HQhi2cxgFLSN4kimI6WUWqwVNOULCJi-ybfoE73U9sVkwI",
  },
  {
    id: 2,
    name: "Heritage Haveli",
    location: "Jodhpur, Rajasthan",
    price: "₹18,000",
    rating: "4.8",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDWZMzCYz_lL1vNT_AAwjquAZDBYC4jbgX_joiV6l8QGLJt_Tfhd5XvbX6NhaBBlRKBauQ_8CmS2qkwnwk69LLSC7ge-CCXlKMfozLL2mUTNFKwSjHGLxzidF36ztDvZbxZH_h7UyUf2xTi-bbAkSP33yDtg6tX6Wykj6XNWuujaTclvnXa2lTjYPPnM-OixeHcuXg7ad_Vvfo_TV0zZ6tG6TBV97hicf_81DjBgAFef_Sgw3pUuHgmPNREZPEyFQqI6xy5YgRjaQc",
  },
];

const travelStories = [
  {
    id: 1,
    tag: "Slow Travel",
    title: "A morning by Lake Pichola",
    desc: "A serene sunrise experience with the majestic City Palace reflecting in the calm waters.",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBDYTrt5UTwStUd5EuRlPm8YpkQtdeSQ4bcvgBBIdhD_tdI1vYxdI7TzF0U-yNZKtqr3rW2UuPBYox9_oFqNDIcjD290g3h9gfC2-ESGHPdL9u4ngNcN-NlUYaWgydTLox_JINkGp5cN7wr1iDLLGOlmovadK7cDKl3x_9LXCsQxzm6JYwl2cFizTcwKc0D5GNIIUmqkBdDnX06CY_8JvkXm1pvgqhwV6haXvUPpCFkCSjGWB2qxGli4ZLVVxopi2uIrPe1t8wolgY",
  },
  {
    id: 2,
    tag: "Local Culture",
    title: "Hidden cafes of the Old City",
    desc: "Discovering cozy, vibrant rooftop spots with panoramic views of Udaipur's white buildings.",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAfVhG-A9Z4NE4O4VD3__E-K3Veue6SYqTog_sJd5ZJpUQ-qJFw-xewyI-7Hc3TY5GYs4XylBlCCRdZ6KnuC6TpccCjmkwKlKqDiJBdsvpyFDR2mn6VHQY5COUXkH9mgpW39_ReIZ6bBeAU9wtKw1RwmSC4lM3ExbOdj1KbYBLnR9Po1Rk4Fb0KNli9wumMPXq4Nz18JGjLKHzQllPF5tQoZYKAVd_jB5QhNXlMOUKOkY3X9496pECD_WnQJspLIR8ohGrR6uHgGz8",
  },
];

/* ── Page ───────────────────────────────────────────────────── */

export default function ExperiencesPage() {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      {/* ── Hero + Search ── */}
      <section className="px-4 sm:px-6 pt-4 pb-8 space-y-6">
        <div className="space-y-4">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl lg:text-center font-headline font-extrabold tracking-tight text-on-surface leading-tight">
            <span className="block lg:inline">Discover unforgettable </span>
            <span className="block lg:inline text-primary">experiences in Udaipur.</span>
          </h2>

          {/* Desktop search */}
          <div className="hidden lg:block lg:w-[70%] lg:mx-auto">
            <div className="bg-surface-container-high rounded-full p-1.5 shadow-sm grid lg:grid-cols-3 gap-3">
              <label className="bg-surface-container-low rounded-full px-4 py-2 flex items-center gap-3 cursor-text">
                <span className="material-symbols-outlined text-primary">location_on</span>
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">
                    Location
                  </p>
                  <input
                    className="bg-transparent border-0 focus:ring-0 outline-none w-full text-sm text-on-surface placeholder:text-on-surface-variant"
                    type="text"
                    placeholder="Udaipur, Rajasthan"
                  />
                </div>
              </label>
              <label className="bg-surface-container-low rounded-full px-4 py-2 flex items-center gap-3 cursor-text">
                <span className="material-symbols-outlined text-primary">calendar_month</span>
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">
                    Date
                  </p>
                  <input
                    className="bg-transparent border-0 focus:ring-0 outline-none w-full text-sm text-on-surface placeholder:text-on-surface-variant"
                    type="text"
                    placeholder="Select date"
                  />
                </div>
              </label>
              <label className="bg-surface-container-low rounded-full px-4 py-2 flex items-center gap-3 cursor-text">
                <span className="material-symbols-outlined text-primary">group</span>
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">
                    Guests
                  </p>
                  <input
                    className="bg-transparent border-0 focus:ring-0 outline-none w-full text-sm text-on-surface placeholder:text-on-surface-variant"
                    type="text"
                    placeholder="2 Adults"
                  />
                </div>
              </label>
            </div>
          </div>

          {/* Mobile search pill */}
          <div className="lg:hidden">
            <div
              className="flex items-center bg-surface-container-high rounded-full px-4 sm:px-6 py-3 sm:py-4 gap-4 cursor-pointer hover:bg-surface-container-highest transition-colors shadow-sm"
              onClick={() => setSearchOpen(true)}
            >
              <span className="material-symbols-outlined text-primary">search</span>
              <span className="text-on-surface-variant font-medium truncate text-sm sm:text-base">
                Discover experiences in Udaipur
              </span>
            </div>
          </div>
        </div>

        {/* Mobile category toggle */}
        <div className="flex justify-center lg:hidden">
          <div className="bg-surface-container-low p-1.5 rounded-full flex gap-1 w-full sm:w-auto">
            <Link
              href="/"
              className="flex-1 sm:flex-none py-2 px-4 sm:px-6 rounded-full text-xs sm:text-sm font-semibold text-on-surface-variant hover:text-on-surface transition-all text-center"
            >
              Stays
            </Link>
            <button className="flex-1 sm:flex-none py-2 px-4 sm:px-6 rounded-full bg-surface-container-lowest shadow-sm text-xs sm:text-sm font-semibold text-primary transition-all">
              Experiences
            </button>
          </div>
        </div>
      </section>

      {/* ── Experience Categories ── */}
      <section className="mb-12 overflow-x-auto no-scrollbar px-6">
        <div className="flex gap-8 items-center min-w-max pb-2">
          {expCategories.map((cat) => (
            <div key={cat.label} className="flex flex-col items-center gap-2 group cursor-pointer">
              <div className="p-4 rounded-2xl bg-surface-container-low group-hover:bg-primary-container/20 transition-colors">
                <span className="material-symbols-outlined text-primary text-3xl">{cat.icon}</span>
              </div>
              <span className="text-xs font-medium text-on-surface-variant">{cat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Curated Experiences ── */}
      <section className="px-6 mb-16">
        <h2 className="font-headline text-2xl font-bold tracking-tight mb-8 text-on-surface">
          Curated Experiences in Udaipur
        </h2>
        <div className="space-y-8 lg:grid lg:grid-cols-2 lg:gap-8 lg:space-y-0">
          {curatedExperiences.map((exp) => (
            <article
              key={exp.id}
              className="group bg-surface-container-lowest rounded overflow-hidden shadow-sm transition-transform hover:scale-[1.01]"
            >
              <div className="relative aspect-video overflow-hidden">
                <img
                  alt={exp.name}
                  src={exp.img}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                {exp.badge && (
                  <div className="absolute top-4 right-4 bg-surface/80 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-primary">
                    {exp.badge}
                  </div>
                )}
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-headline text-xl font-bold text-on-surface">{exp.name}</h3>
                  <span className="text-primary font-bold text-lg shrink-0 ml-2">
                    {exp.price}{" "}
                    <span className="text-on-surface-variant text-xs font-normal">
                      {exp.priceUnit}
                    </span>
                  </span>
                </div>
                <p className="text-on-surface-variant text-sm mb-4 leading-relaxed">{exp.desc}</p>
                <div className="flex items-center gap-4 text-xs text-on-surface-variant font-medium flex-wrap">
                  {exp.duration && (
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">schedule</span>
                      {exp.duration}
                    </span>
                  )}
                  {exp.rating && (
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">star</span>
                      {exp.rating} ({exp.reviews} reviews)
                    </span>
                  )}
                  {exp.groupSize && (
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">group</span>
                      {exp.groupSize}
                    </span>
                  )}
                  {exp.transport && (
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">distance</span>
                      {exp.transport}
                    </span>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ── Beyond the City ── */}
      <section className="mb-16 px-6">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="font-headline text-2xl font-bold tracking-tight text-on-surface">
              Beyond the City
            </h2>
            <p className="text-on-surface-variant text-sm">Curated day trips from Udaipur</p>
          </div>
          <button className="text-primary font-bold text-sm hover:underline">View All</button>
        </div>
        <div className="flex gap-6 overflow-x-auto no-scrollbar pb-4 -mx-6 px-6">
          {dayTrips.map((trip) => (
            <div
              key={trip.id}
              className={`min-w-[300px] bg-surface-container-low rounded-lg p-3 ${
                !trip.available ? "opacity-60" : ""
              }`}
            >
              <div className="relative h-48 rounded overflow-hidden mb-4">
                <img alt={trip.name} src={trip.img} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 text-white">
                  <h4 className="font-bold">{trip.name}</h4>
                  <p className="text-xs opacity-90">{trip.distance}</p>
                </div>
              </div>
              {trip.available && trip.price && (
                <div className="flex justify-between items-center px-1">
                  <span className="text-sm font-bold text-primary">{trip.price}</span>
                  <button className="bg-primary text-white p-2 rounded-full leading-none">
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── Popular stays with UNESTA ── */}
      <section className="space-y-4 mb-10">
        <div className="px-6 flex justify-between items-end">
          <h3 className="text-xl font-headline font-bold text-on-surface">
            Popular stays with UNESTA
          </h3>
          <button className="text-sm font-semibold text-primary hover:underline">View all</button>
        </div>
        <div className="flex overflow-x-auto gap-6 px-6 hide-scrollbar">
          {popularStays.map((stay) => (
            <div key={stay.id} className="flex-none w-72 space-y-3">
              <div className="relative aspect-[4/3.75] rounded-lg overflow-hidden group">
                <img
                  alt={stay.name}
                  src={stay.img}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute top-4 right-4 bg-surface/70 backdrop-blur-md p-2 rounded-full cursor-pointer">
                  <span className="material-symbols-outlined text-primary text-lg">favorite</span>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-on-surface">{stay.name}</h4>
                  <div className="flex items-center gap-1">
                    <span
                      className="material-symbols-outlined text-xs text-primary"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      star
                    </span>
                    <span className="text-sm font-medium">{stay.rating}</span>
                  </div>
                </div>
                <p className="text-sm text-on-surface-variant">{stay.location}</p>
                <p className="text-lg font-headline font-bold text-primary mt-1">
                  {stay.price}{" "}
                  <span className="text-xs font-normal text-on-surface-variant">/ night</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Host CTA ── */}
      <section className="px-4 sm:px-6 mb-12">
        <div className="relative min-h-[300px] sm:min-h-[400px] lg:min-h-[500px] rounded-lg overflow-hidden flex flex-col justify-end p-6 sm:p-12 border border-outline-variant/20 shadow-xl group lg:w-[70%] lg:mx-auto">
          <img
            alt="Luxury villa interior"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDEqhQmCiXMx_skv2iuJZKGP2vmZKLJ2W9swkiYTDdLd8XfMkBa989CWm2oW5OJzCKT-XSi7uDDKk6NJyB7vN80Otxo8Kbawf_itr0VUvMbnZIram6Z4WpiZB6KbISJFGuJuHs8EQetttVJu1Pel1GGW4_SJ7rH7QUSfcddsNLuBrc-J1xDKwOm4Wbk3c1pThncz-tOfvYvGSLDzRXdAOA6kB_k3HbXknZ61iTgv3P1RFvh89sluMq7OCNWNTvKvYBf4xMiBEyws78"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-black/80 via-black/40 to-transparent" />
          <div className="relative z-10 max-w-md space-y-4 sm:space-y-6">
            <div className="space-y-2 sm:space-y-3">
              <h3 className="text-2xl sm:text-4xl font-headline font-extrabold text-white leading-tight tracking-tight">
                Host your experience
              </h3>
              <p className="text-white/90 font-medium text-sm sm:text-base leading-relaxed">
                Share your passion with curious travelers. Turn your local knowledge into an
                unforgettable experience.
              </p>
            </div>
            <button className="inline-flex items-center justify-center bg-primary hover:bg-primary-container text-white px-6 sm:px-10 py-3 sm:py-4 rounded-full font-bold text-xs sm:text-sm transition-all transform hover:-translate-y-0.5 shadow-lg active:scale-95">
              Become a Host
            </button>
          </div>
        </div>
      </section>

      {/* ── Travel Stories ── */}
      <section className="space-y-4 mb-12">
        <div className="px-4 sm:px-6 flex justify-between items-end gap-2">
          <h3 className="text-lg sm:text-xl font-headline font-bold text-on-surface">
            Travel Stories
          </h3>
          <button className="text-xs sm:text-sm font-semibold text-primary hover:underline whitespace-nowrap">
            Read blog
          </button>
        </div>
        <div className="flex overflow-x-auto gap-4 sm:gap-6 px-4 sm:px-6 hide-scrollbar">
          {travelStories.map((story) => (
            <div
              key={story.id}
              className="flex-none w-60 sm:w-72 group cursor-pointer space-y-3"
            >
              <div className="relative aspect-square rounded-lg overflow-hidden">
                <img
                  alt={story.title}
                  src={story.img}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
                  {story.tag}
                </span>
                <h4 className="text-lg font-headline font-bold leading-snug group-hover:text-primary transition-colors">
                  {story.title}
                </h4>
                <p className="text-sm text-on-surface-variant line-clamp-2">{story.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} mode="experiences" />
    </>
  );
}
