"use client";

import { useRef, useState } from "react";

/**
 * Touch-native swipeable image gallery: CSS scroll-snap for momentum + snapping,
 * with live dot indicators and a count chip driven by the scroll position.
 */
export function ImageCarousel({
  images,
  alt,
  className = "",
}: {
  images: { id: string; url: string }[];
  alt: string;
  className?: string;
}) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState(0);

  const slides = images.length ? images : [{ id: "ph", url: "" }];

  function handleScroll() {
    const el = trackRef.current;
    if (!el) return;
    const idx = Math.round(el.scrollLeft / el.clientWidth);
    if (idx !== active) setActive(idx);
  }

  return (
    <div className={`relative ${className}`}>
      <div
        ref={trackRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar scroll-smooth"
      >
        {slides.map((img) => (
          <div key={img.id} className="flex-none w-full snap-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img.url}
              alt={alt}
              className="w-full aspect-[4/5] sm:aspect-[16/10] object-cover"
            />
          </div>
        ))}
      </div>

      {slides.length > 1 && (
        <>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
            {slides.map((img, i) => (
              <span
                key={img.id}
                className={`carousel-dot ${i === active ? "is-active" : ""}`}
              />
            ))}
          </div>
          <div className="absolute top-4 left-4 glass-dark text-white text-xs font-semibold px-2.5 py-1 rounded-full">
            {active + 1} / {slides.length}
          </div>
        </>
      )}
    </div>
  );
}
