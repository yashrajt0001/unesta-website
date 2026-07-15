"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { ApiError, wishlistsApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/toast";

const DEFAULT_NAME = "Saved";

type WishlistContextValue = {
  /**
   * Session override for a listing's saved state, or undefined if the user
   * hasn't toggled it this session (in which case use the server-provided flag).
   */
  override: (listingId: string) => boolean | undefined;
  /** Optimistically save/unsave a listing given its current displayed state. */
  toggle: (listingId: string, currentSaved: boolean) => void;
  /** Record a saved-state change made outside a heart (e.g. the wishlists page). */
  setSaved: (listingId: string, saved: boolean) => void;
};

const WishlistContext = createContext<WishlistContextValue | undefined>(
  undefined,
);

/**
 * Holds only what the server can't send with the page: the user's in-session
 * toggles (so every card showing the same listing stays in sync) plus the
 * lazily-resolved "Saved" wishlist id. The saved state itself rides along on
 * each listing as `isSaved` from the API — no extra fetch, no id list to map.
 */
export function WishlistProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const toast = useToast();

  const [overrides, setOverrides] = useState<Map<string, boolean>>(new Map());

  // The default "Saved" wishlist id — resolved once on first toggle.
  const wishlistIdRef = useRef<string | null>(null);
  const inFlight = useRef<Set<string>>(new Set());

  // Clear session state when the user changes (login/logout).
  useEffect(() => {
    setOverrides(new Map());
    wishlistIdRef.current = null;
  }, [isAuthenticated]);

  const setOverride = useCallback((listingId: string, saved: boolean) => {
    setOverrides((prev) => new Map(prev).set(listingId, saved));
  }, []);

  const override = useCallback(
    (listingId: string) => overrides.get(listingId),
    [overrides],
  );

  const toggle = useCallback(
    async (listingId: string, currentSaved: boolean) => {
      if (!isAuthenticated) return; // caller redirects to login
      if (inFlight.current.has(listingId)) return;
      inFlight.current.add(listingId);

      const nextSaved = !currentSaved;
      setOverride(listingId, nextSaved);

      if (nextSaved) toast.success("Saved to your wishlist");
      else toast.info("Removed from Saved");

      try {
        let id = wishlistIdRef.current;
        if (!id) {
          const lists = await wishlistsApi.list();
          const def =
            lists.find((w) => w.name === DEFAULT_NAME) || lists[0] || null;
          id = def ? def.id : (await wishlistsApi.create(DEFAULT_NAME)).id;
          wishlistIdRef.current = id;
        }
        if (nextSaved) await wishlistsApi.addItem(id, listingId);
        else await wishlistsApi.removeItem(id, listingId);
      } catch (err) {
        // 409 (already added) / 404 (already removed) mean the server already
        // matches our optimistic state — keep it. Otherwise revert + report.
        const benign =
          err instanceof ApiError &&
          ((nextSaved && err.status === 409) ||
            (!nextSaved && err.status === 404));
        if (!benign) {
          setOverride(listingId, currentSaved);
          toast.error(
            err instanceof ApiError ? err.message : "Could not update wishlist.",
          );
        }
      } finally {
        inFlight.current.delete(listingId);
      }
    },
    [isAuthenticated, toast, setOverride],
  );

  return (
    <WishlistContext.Provider value={{ override, toggle, setSaved: setOverride }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
