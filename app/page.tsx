"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Footer from "@/components/layout/Footer";
import SearchModal from "@/components/layout/SearchModal";

/* ── Data ──────────────────────────────────────────────────── */

const featuredStays = [
  {
    id: 1,
    name: "The Mewar Palace",
    location: "Lake Pichola, Udaipur",
    price: "₹42,000",
    rating: "5.0",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBDYTrt5UTwStUd5EuRlPm8YpkQtdeSQ4bcvgBBIdhD_tdI1vYxdI7TzF0U-yNZKtqr3rW2UuPBYox9_oFqNDIcjD290g3h9gfC2-ESGHPdL9u4ngNcN-NlUYaWgydTLox_JINkGp5cN7wr1iDLLGOlmovadK7cDKl3x_9LXCsQxzm6JYwl2cFizTcwKc0D5GNIIUmqkBdDnX06CY_8JvkXm1pvgqhwV6haXvUPpCFkCSjGWB2qxGli4ZLVVxopi2uIrPe1t8wolgY",
  },
  {
    id: 2,
    name: "Fateh Vilas Heritage",
    location: "Fateh Sagar, Udaipur",
    price: "₹22,500",
    rating: "4.7",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBPs7wDJetZzXri8CH0TPA6nSOSK94g-8W1QJ3RsnDq4kU4TdnVK8l8-aiIOTxZeMS6YEjHAf37r_4KHJNp3mFtAbMxNlE2J_Wht--BhDy2_jc2zS-KfFR8rwlFY8MkDW8AKrBpemGXvvuP7tnd0hISZSupdnxrsl7DqeCCmPIo11MQ4EC-vCy-wTRAkCJEKB45yPYXEjn_LWyZSZNrYeZzqTu6_uLjtOpUtK_U76SuDNpcgMJ_fuVB1kRNpp4wtiYiZi-Kmc1f5ig",
  },
];

const exploreCategories = [
  {
    label: "Couple Friendly",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuC9EEAqtgVWiLw__f_far801PZ66AbeHz4-JPnMgcfgbgHmju67gm1z1ufM6DaVZSddvktJG7ECLcWxZhKR6xoqBBJ7p1fSeF6Tti_jIRP4NWrgNkUvrTlyv8MtUCdxZtch77XNJOXmhw0F5YI5qBvr25KWj2HQIdXhpEsiEv9XIGYHCS6yZsF7Ld2p9D90dxT5Gwc5J-7rvwkCBLHdkLfvLEKHlSDAAiQudgIsTt2GkQVyuuECAFvkGhRNw94yCFZGS-fk_wliCPU",
    colSpan: "col-span-2",
    tall: false,
  },
  {
    label: "Lake View",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuB_AnxKMl4DsPYLnpHKLTaxZlPRL1-lira9oqkuhQX_LqEpMZAN4RRzsYSLYDHTNVM_jMQx6KtCGU1HkvqMArZhcvMOwjPR2z0eD6cMSMKed9CeFsNnPIkW1zrmnTY9Xdp1wDtKYdW-vDQBbSg1LobgFVqmiIA4bJfZtoTgi_YuhyqG1yojKypZJhaG1jU7WZRaLDOogdINN2546cNzZll0GMWlHLbgDlO2hev-G-R4DDDMxbFIzEqSiExYBZNtS1qQBrKm8Mb3AI8",
    colSpan: "col-span-2",
    tall: false,
  },
  {
    label: "Vacation Homes",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuA2x9kaXB_xzX1NGoeYoHqcwMUgOnku1aYUg0APS95xJ2kEEsw0szeliwg3bnMtfgD4n8M_BDmUJ43gQjYyRyu8eDKl2eqiZPwxoFro482hZJSR8WnpYoCm0jq4njfYGIi4j1BEgrG9vy--oEU6poy89pfW9gdcvDYEU2Wl8ojTUW3-v2d7s4A2l8ewiApyrGGQYNen-eWVyJ6LtwlfVwOGW9P1xuUDK787GWEAEJbVGKgNle88p_s7WKgmUyOmGsbcHPY5yVmcol0",
    colSpan: "col-span-1",
    tall: true,
  },
  {
    label: "Farm Stays",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBDYTrt5UTwStUd5EuRlPm8YpkQtdeSQ4bcvgBBIdhD_tdI1vYxdI7TzF0U-yNZKtqr3rW2UuPBYox9_oFqNDIcjD290g3h9gfC2-ESGHPdL9u4ngNcN-NlUYaWgydTLox_JINkGp5cN7wr1iDLLGOlmovadK7cDKl3x_9LXCsQxzm6JYwl2cFizTcwKc0D5GNIIUmqkBdDnX06CY_8JvkXm1pvgqhwV6haXvUPpCFkCSjGWB2qxGli4ZLVVxopi2uIrPe1t8wolgY",
    colSpan: "col-span-1",
    tall: true,
  },
];

const popularStays = [
  {
    id: 1,
    name: "The Mewar Palace",
    location: "Lake Pichola, Udaipur",
    price: "₹42,000",
    rating: "5.0",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBDYTrt5UTwStUd5EuRlPm8YpkQtdeSQ4bcvgBBIdhD_tdI1vYxdI7TzF0U-yNZKtqr3rW2UuPBYox9_oFqNDIcjD290g3h9gfC2-ESGHPdL9u4ngNcN-NlUYaWgydTLox_JINkGp5cN7wr1iDLLGOlmovadK7cDKl3x_9LXCsQxzm6JYwl2cFizTcwKc0D5GNIIUmqkBdDnX06CY_8JvkXm1pvgqhwV6haXvUPpCFkCSjGWB2qxGli4ZLVVxopi2uIrPe1t8wolgY",
  },
  {
    id: 2,
    name: "Fateh Vilas Heritage",
    location: "Fateh Sagar, Udaipur",
    price: "₹22,500",
    rating: "4.7",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBPs7wDJetZzXri8CH0TPA6nSOSK94g-8W1QJ3RsnDq4kU4TdnVK8l8-aiIOTxZeMS6YEjHAf37r_4KHJNp3mFtAbMxNlE2J_Wht--BhDy2_jc2zS-KfFR8rwlFY8MkDW8AKrBpemGXvvuP7tnd0hISZSupdnxrsl7DqeCCmPIo11MQ4EC-vCy-wTRAkCJEKB45yPYXEjn_LWyZSZNrYeZzqTu6_uLjtOpUtK_U76SuDNpcgMJ_fuVB1kRNpp4wtiYiZi-Kmc1f5ig",
  },
];

const curatedExperiences = [
  {
    id: 1,
    name: "Royal Lake Pichola Boat Dinner",
    desc: "A private five-course dinner served on a historic ceremonial boat as you glide past the illuminated City Palace.",
    location: "Lake Pichola, Udaipur",
    badge: "Signature",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAlHEcdy8G6N_xewJ1hsD3h86gLAQbm0ulgI-5lA7QFxTHjr-NEq2kbmh_gU6IYFrP4s-clkEMtsFcfBiJl-kKebkSPbaEnKv6VBgW8BhqHYX_-dXbehCIHp3pqPHGYMaHtzEMu-DeClxLFE5inTjJUjzjJcXvrPvRlfEr1a74mKhmonAwfqS_SfHX_Uv8zIlwfX79mfQGh3JMdhltDBSaPZaUh0aRNu1JPjos2cX0NZNGxBl79iFqYNYvuzlfJJ8lt80wbHW7RQCE",
  },
  {
    id: 2,
    name: "Heritage Old City Walk",
    desc: "Explore the narrow winding lanes of the old city, visiting ancient temples and meeting traditional miniature painting artists.",
    location: "Old City, Udaipur",
    badge: null,
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAfVhG-A9Z4NE4O4VD3__E-K3Veue6SYqTog_sJd5ZJpUQ-qJFw-xewyI-7Hc3TY5GYs4XylBlCCRdZ6KnuC6TpccCjmkwKlKqDiJBdsvpyFDR2mn6VHQY5COUXkH9mgpW39_ReIZ6bBeAU9wtKw1RwmSC4lM3ExbOdj1KbYBLnR9Po1Rk4Fb0KNli9wumMPXq4Nz18JGjLKHzQllPF5tQoZYKAVd_jB5QhNXlMOUKOkY3X9496pECD_WnQJspLIR8ohGrR6uHgGz8",
  },
  {
    id: 3,
    name: "Sunrise at Sajjan Garh",
    desc: "Witness the sun rise over the Aravalli hills from the majestic heights of the Monsoon Palace.",
    location: "Monsoon Palace, Udaipur",
    badge: null,
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuA2x9kaXB_xzX1NGoeYoHqcwMUgOnku1aYUg0APS95xJ2kEEsw0szeliwg3bnMtfgD4n8M_BDmUJ43gQjYyRyu8eDKl2eqiZPwxoFro482hZJSR8WnpYoCm0jq4njfYGIi4j1BEgrG9vy--oEU6poy89pfW9gdcvDYEU2Wl8ojTUW3-v2d7s4A2l8ewiApyrGGQYNen-eWVyJ6LtwlfVwOGW9P1xuUDK787GWEAEJbVGKgNle88p_s7WKgmUyOmGsbcHPY5yVmcol0",
  },
];

const handpicked = [
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
  {
    id: 3,
    name: "Whispering Pines",
    location: "Mussoorie, Uttarakhand",
    price: "₹12,500",
    rating: "4.7",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAeur90X2GuuTk6MulfdL5nMI_SavyVfQcg9Ep-ZMBLLggKig95PKEHqh0buyDFwHwTVLMRMXWT06DL5dRT8HdY8Fmyndg9cpl3yDghELEshzrZOGokCzZN7oTk2N1Bnl9pd133XvQvCILhZsaCgUIA8zygm_ijyinIPREKtmJDP4iB78DJlq-E1E5vEHaFrEkHCkvjmhQUevxrkpZ_7aNyhLRHo95bwgpVflbyiUXF348ebVb_cstLCf_x9URf7xn2ea87wXuOabE",
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
  {
    id: 3,
    tag: "Architecture",
    title: "Inside Udaipur's heritage havelis",
    desc: "Exploring the intricate carvings and colorful glass work of traditional Rajasthani mansions.",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBPs7wDJetZzXri8CH0TPA6nSOSK94g-8W1QJ3RsnDq4kU4TdnVK8l8-aiIOTxZeMS6YEjHAf37r_4KHJNp3mFtAbMxNlE2J_Wht--BhDy2_jc2zS-KfFR8rwlFY8MkDW8AKrBpemGXvvuP7tnd0hISZSupdnxrsl7DqeCCmPIo11MQ4EC-vCy-wTRAkCJEKB45yPYXEjn_LWyZSZNrYeZzqTu6_uLjtOpUtK_U76SuDNpcgMJ_fuVB1kRNpp4wtiYiZi-Kmc1f5ig",
  },
];

/* ── Shared sub-components ──────────────────────────────────── */

function StayCard({ stay }: { stay: (typeof featuredStays)[0] }) {
  return (
    <div className="flex-none w-60 sm:w-72 space-y-3">
      <div className="relative aspect-[4/3.75] rounded-lg overflow-hidden group">
        <img
          alt={stay.name}
          src={stay.img}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute top-4 right-4 bg-surface/70 backdrop-blur-md p-2 rounded-full">
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
  );
}

function TravelStoryCard({ story }: { story: (typeof travelStories)[0] }) {
  return (
    <div className="flex-none w-60 sm:w-72 group cursor-pointer space-y-3">
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
  );
}

/* ── Page ───────────────────────────────────────────────────── */

export default function StaysPage() {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      {/* ── Hero + Search ── */}
      <section className="px-4 sm:px-6 pt-4 pb-8 space-y-6">
        <div className="space-y-4">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl lg:text-center font-headline font-extrabold tracking-tight text-on-surface leading-tight">
            <span className="block lg:inline">Find your next </span>
            <span className="block lg:inline text-primary">escape in Udaipur.</span>
          </h2>

          {/* Desktop search pill */}
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
                    Check-in / Check-out
                  </p>
                  <input
                    className="bg-transparent border-0 focus:ring-0 outline-none w-full text-sm text-on-surface placeholder:text-on-surface-variant"
                    type="text"
                    placeholder="Oct 12 – Oct 15"
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
                    placeholder="2 Adults, 1 Child"
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
                Discover Stays in Udaipur
              </span>
            </div>
          </div>
        </div>

        {/* Mobile category toggle */}
        <div className="flex justify-center lg:hidden">
          <div className="bg-surface-container-low p-1.5 rounded-full flex gap-1 w-full sm:w-auto">
            <button className="flex-1 sm:flex-none py-2 px-4 sm:px-6 rounded-full bg-surface-container-lowest shadow-sm text-xs sm:text-sm font-semibold text-primary transition-all">
              Stays
            </button>
            <Link
              href="/experiences"
              className="flex-1 sm:flex-none py-2 px-4 sm:px-6 rounded-full text-xs sm:text-sm font-semibold text-on-surface-variant hover:text-on-surface transition-all text-center"
            >
              Experiences
            </Link>
          </div>
        </div>
      </section>

      {/* ── Featured Stays ── */}
      <section className="space-y-4 mb-10">
        <div className="px-4 sm:px-6 flex justify-between items-end gap-2">
          <h3 className="text-lg sm:text-xl font-headline font-bold text-on-surface">
            Featured Stays
          </h3>
          <button className="text-xs sm:text-sm font-semibold text-primary hover:underline whitespace-nowrap">
            View all
          </button>
        </div>
        <div className="flex overflow-x-auto gap-4 sm:gap-6 px-4 sm:px-6 hide-scrollbar">
          {featuredStays.map((stay) => (
            <StayCard key={stay.id} stay={stay} />
          ))}
        </div>
      </section>

      {/* ── Explore Udaipur ── */}
      <section className="px-4 sm:px-6 space-y-4 mb-10">
        <h3 className="text-lg sm:text-xl font-headline font-bold text-on-surface">
          Explore Udaipur
        </h3>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:flex lg:flex-row lg:justify-center lg:gap-6">
          {exploreCategories.map((cat) => (
            <div
              key={cat.label}
              className={`relative overflow-hidden group destination-card cursor-pointer ${cat.colSpan} ${
                cat.tall
                  ? "aspect-[9/16] lg:aspect-none lg:h-[364px] lg:flex-1"
                  : "h-40 sm:h-48 lg:h-[364px] lg:flex-1"
              }`}
            >
              <img
                alt={cat.label}
                src={cat.img}
                className="w-full h-full object-cover img-zoom-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col justify-end p-6">
                <p className="text-white font-headline font-extrabold text-xl sm:text-2xl tracking-tight">
                  {cat.label}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Popular stays with UNESTA ── */}
      <section className="space-y-4 mb-10">
        <div className="px-4 sm:px-6 flex justify-between items-end gap-2">
          <h3 className="text-lg sm:text-xl font-headline font-bold text-on-surface">
            Popular stays with UNESTA
          </h3>
          <button className="text-xs sm:text-sm font-semibold text-primary hover:underline whitespace-nowrap">
            View all
          </button>
        </div>
        <div className="flex overflow-x-auto gap-4 sm:gap-6 px-4 sm:px-6 hide-scrollbar">
          {popularStays.map((stay) => (
            <StayCard key={stay.id} stay={stay} />
          ))}
        </div>
      </section>

      {/* ── Curated Experiences in Udaipur ── */}
      <section className="space-y-6 mb-10 bg-surface-container-low py-8 sm:py-10 px-4 sm:px-6">
        <h3 className="text-lg sm:text-xl font-headline font-bold text-on-surface">
          Curated Experiences in Udaipur
        </h3>
        <div className="flex flex-col lg:flex-row gap-6">
          {curatedExperiences.map((exp) => (
            <div
              key={exp.id}
              className="bg-surface-container-lowest rounded-lg overflow-hidden shadow-sm flex flex-col lg:flex-1 lg:h-[400px]"
            >
              <div className="relative h-[200px] sm:h-[230px]">
                <img alt={exp.name} src={exp.img} className="w-full h-full object-cover" />
                {exp.badge && (
                  <span className="absolute top-4 left-4 bg-primary text-white text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full">
                    {exp.badge}
                  </span>
                )}
              </div>
              <div className="p-4 sm:p-6 flex flex-col justify-end gap-2 flex-1">
                <h4 className="text-base sm:text-lg font-bold">{exp.name}</h4>
                <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                  {exp.desc}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="material-symbols-outlined text-primary text-sm">location_on</span>
                  <span className="text-xs font-medium text-on-surface-variant">{exp.location}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Handpicked by UNESTA ── */}
      <section className="space-y-4 mb-10">
        <div className="px-4 sm:px-6 flex justify-between items-end">
          <h3 className="text-lg sm:text-xl font-headline font-bold text-on-surface">
            Handpicked by UNESTA
          </h3>
          <button className="text-xs sm:text-sm font-semibold text-primary hover:underline whitespace-nowrap">
            View all
          </button>
        </div>
        <div className="flex overflow-x-auto gap-4 sm:gap-6 px-4 sm:px-6 hide-scrollbar">
          {handpicked.map((stay) => (
            <StayCard key={stay.id} stay={stay} />
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
                Host your space
              </h3>
              <p className="text-white/90 font-medium text-sm sm:text-base leading-relaxed">
                Join our community of exceptional hosts and share your sanctuary with a global
                audience of conscious travelers.
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
            <TravelStoryCard key={story.id} story={story} />
          ))}
        </div>
      </section>

      <Footer />
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} mode="stays" />
    </>
  );
}
