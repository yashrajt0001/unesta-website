import Link from "next/link";
import { WishlistHeart } from "@/components/ui/WishlistHeart";
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
 */
export function StayCard({
  stay,
  className = "",
}: {
  stay: ListingCard;
  className?: string;
}) {
  const cover = stay.images[0]?.url || PLACEHOLDER;

  return (
    <article className={`group ${className}`}>
      <div className="relative aspect-[4/3.75] rounded-3xl overflow-hidden bg-surface-container-low shadow-soft hover-lift group-hover:shadow-lift">
        <Link
          href={`/stays/${stay.id}`}
          aria-label={`Open ${stay.title}`}
          className="block w-full h-full"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt={stay.title}
            src={cover}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.08]"
          />
          {/* gentle bottom scrim for depth */}
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/25 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </Link>

        <div className="absolute top-3 right-3">
          <WishlistHeart listingId={stay.id} />
        </div>

        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 glass rounded-full pl-2 pr-3 py-1 shadow-soft translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-400 ease-[cubic-bezier(0.22,1,0.36,1)]">
          <span className="material-symbols-outlined text-[15px] text-on-surface-variant">
            group
          </span>
          <span className="text-xs font-semibold text-on-surface">
            Up to {stay.maxGuests}
          </span>
        </div>
      </div>

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
