"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { WishlistHeart } from "@/components/ui/WishlistHeart";
import { Tilt, EASE_OUT_SOFT } from "@/components/ui/motion";
import type { ListingCard } from "@/lib/api";

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const PLACEHOLDER = "https://via.placeholder.com/800x600?text=No+Image";

/**
 * The single, shared listing card used across explore, search, experiences
 * and wishlists. Width is controlled by the parent via `className`.
 *
 * Interactions: 3D tilt toward cursor, parallax cover zoom, hover image-cycle
 * through the listing gallery, and a sliding meta chip — all reduced-motion safe.
 */
export function StayCard({
  stay,
  className = "",
}: {
  stay: ListingCard;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const images = stay.images.length ? stay.images : [{ url: PLACEHOLDER }];
  const [idx, setIdx] = useState(0);
  const [hovered, setHovered] = useState(false);

  const canCycle = images.length > 1 && !reduce;

  return (
    <article className={`group ${className}`}>
      <Tilt
        max={6}
        className="relative aspect-[4/3.75] rounded-3xl"
      >
        <div
          className="relative w-full h-full rounded-3xl overflow-hidden bg-surface-container-low shadow-soft transition-shadow duration-500 group-hover:shadow-lift"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => {
            setHovered(false);
            setIdx(0);
          }}
          style={{ transform: "translateZ(0)" }}
        >
          <Link
            href={`/stays/${stay.id}`}
            aria-label={`Open ${stay.title}`}
            className="block w-full h-full"
          >
            {images.map((img, i) => (
              <motion.img
                key={i}
                alt={stay.title}
                src={img.url || PLACEHOLDER}
                loading="lazy"
                initial={false}
                animate={{
                  opacity: i === idx ? 1 : 0,
                  scale: hovered && i === idx ? 1.08 : 1,
                }}
                transition={{
                  opacity: { duration: 0.5, ease: EASE_OUT_SOFT },
                  scale: { duration: 0.9, ease: EASE_OUT_SOFT },
                }}
                className="absolute inset-0 w-full h-full object-cover"
              />
            ))}
            {/* gentle bottom scrim for depth on hover */}
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </Link>

          <div
            className="absolute top-3 right-3"
            style={{ transform: "translateZ(40px)" }}
          >
            <WishlistHeart listingId={stay.id} initialSaved={stay.isSaved} />
          </div>

          {/* hover image-cycle hotspots + dot indicator */}
          {canCycle && (
            <>
              <div className="absolute inset-0 flex">
                {images.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    tabIndex={-1}
                    aria-hidden
                    className="flex-1"
                    onMouseEnter={() => setIdx(i)}
                  />
                ))}
              </div>
              <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {images.map((_, i) => (
                  <span
                    key={i}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === idx ? "w-5 bg-white" : "w-1.5 bg-white/60"
                    }`}
                  />
                ))}
              </div>
            </>
          )}

          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 glass rounded-full pl-2 pr-3 py-1 shadow-soft translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-400 ease-[cubic-bezier(0.22,1,0.36,1)]">
            <span className="material-symbols-outlined text-[15px] text-on-surface-variant">
              group
            </span>
            <span className="text-xs font-semibold text-on-surface">
              Up to {stay.maxGuests}
            </span>
          </div>
        </div>
      </Tilt>

      <Link href={`/stays/${stay.id}`} className="block mt-3 px-0.5">
        <h4 className="font-bold text-[15px] text-on-surface group-hover:text-primary transition-colors line-clamp-1">
          {stay.title}
        </h4>
        <p className="text-sm text-on-surface-variant line-clamp-1">
          {stay.city}, {stay.state}
        </p>
        <p className="mt-1.5 text-on-surface">
          <span className="text-lg font-headline font-semibold">
            {currency.format(stay.basePrice)}
          </span>
          <span className="text-xs font-medium text-on-surface-variant"> / night</span>
        </p>
      </Link>
    </article>
  );
}
