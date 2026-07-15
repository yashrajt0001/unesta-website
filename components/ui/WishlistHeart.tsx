"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useWishlist } from "@/lib/wishlist-context";

/**
 * Heart toggle for a listing. Initial saved-state comes from the listing itself
 * (`isSaved`, stamped by the API), so hearts render correctly on first paint
 * with no per-card request. Toggling is optimistic via the shared context.
 */
export function WishlistHeart({
  listingId,
  initialSaved = false,
  className = "",
}: {
  listingId: string;
  initialSaved?: boolean;
  className?: string;
}) {
  const { isAuthenticated } = useAuth();
  const { override, toggle } = useWishlist();
  const router = useRouter();
  const [popping, setPopping] = useState(false);

  const ov = override(listingId);
  const saved = ov === undefined ? initialSaved : ov;

  function handleToggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      router.push(`/login?next=${encodeURIComponent(location.pathname)}`);
      return;
    }

    if (!saved) {
      setPopping(true);
      window.setTimeout(() => setPopping(false), 450);
    }
    toggle(listingId, saved);
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-pressed={saved}
      aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
      className={`grid place-items-center w-9 h-9 glass rounded-full shadow-soft press hover:scale-110 transition-transform ${className}`}
    >
      <span
        className={`material-symbols-outlined text-[20px] transition-colors ${
          saved ? "text-error" : "text-on-surface/80"
        } ${popping ? "animate-heart-pop" : ""}`}
        style={
          saved
            ? { fontVariationSettings: "'FILL' 1, 'wght' 500" }
            : { fontVariationSettings: "'FILL' 0, 'wght' 500" }
        }
      >
        favorite
      </span>
    </button>
  );
}
