"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError, wishlistsApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/toast";

const DEFAULT_NAME = "Saved";

/**
 * Heart toggle that adds/removes a listing from the user's default "Saved"
 * wishlist. Falls back to redirecting to login when the user is unauthenticated.
 */
export function WishlistHeart({
  listingId,
  className = "",
}: {
  listingId: string;
  className?: string;
}) {
  const { isAuthenticated } = useAuth();
  const toast = useToast();
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const [wishlistId, setWishlistId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [popping, setPopping] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setSaved(false);
      setWishlistId(null);
      return;
    }
    let cancelled = false;
    wishlistsApi
      .list()
      .then((lists) => {
        if (cancelled) return;
        const def =
          lists.find((w) => w.name === DEFAULT_NAME) || lists[0] || null;
        if (def) {
          setWishlistId(def.id);
          setSaved(def.items.some((i) => i.listing.id === listingId));
        }
      })
      .catch(() => {
        // Non-fatal — leave heart empty
      });
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, listingId]);

  async function handleToggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (busy) return;

    if (!isAuthenticated) {
      router.push(`/login?next=${encodeURIComponent(location.pathname)}`);
      return;
    }

    setBusy(true);
    try {
      let id = wishlistId;
      if (!id) {
        const created = await wishlistsApi.create(DEFAULT_NAME);
        id = created.id;
        setWishlistId(id);
      }

      if (saved) {
        await wishlistsApi.removeItem(id, listingId);
        setSaved(false);
        toast.info("Removed from Saved");
      } else {
        await wishlistsApi.addItem(id, listingId);
        setSaved(true);
        setPopping(true);
        window.setTimeout(() => setPopping(false), 450);
        toast.success("Saved to your wishlist");
      }
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : "Could not update wishlist.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-pressed={saved}
      aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
      className={`grid place-items-center w-9 h-9 glass rounded-full shadow-soft press hover:scale-110 transition-transform disabled:opacity-60 ${className}`}
      disabled={busy}
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
