"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ApiError, wishlistsApi, type Wishlist } from "@/lib/api";
import { useRequireAuth } from "@/lib/use-require-auth";
import { useToast } from "@/lib/toast";
import { Skeleton } from "@/components/ui/Skeleton";
import { Reveal } from "@/components/ui/Reveal";

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export default function WishlistsPage() {
  const { isLoading: authLoading, isAuthenticated } = useRequireAuth();
  const toast = useToast();

  const [wishlists, setWishlists] = useState<Wishlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");

  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;
    wishlistsApi
      .list()
      .then((data) => {
        if (!cancelled) setWishlists(data);
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e instanceof ApiError ? e.message : "Could not load wishlists.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;
    setCreating(true);
    try {
      const created = await wishlistsApi.create(name);
      setWishlists((current) => [...current, created]);
      setNewName("");
      toast.success(`Wishlist "${name}" created.`);
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : "Could not create wishlist.",
      );
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete wishlist "${name}"?`)) return;
    try {
      await wishlistsApi.delete(id);
      setWishlists((current) => current.filter((w) => w.id !== id));
      toast.success("Wishlist deleted.");
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : "Could not delete wishlist.",
      );
    }
  }

  async function handleRemoveItem(wishlistId: string, listingId: string) {
    try {
      await wishlistsApi.removeItem(wishlistId, listingId);
      setWishlists((current) =>
        current.map((w) =>
          w.id === wishlistId
            ? { ...w, items: w.items.filter((i) => i.listing.id !== listingId) }
            : w,
        ),
      );
      toast.info("Removed from wishlist.");
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : "Could not remove item.",
      );
    }
  }

  if (authLoading || !isAuthenticated) {
    return (
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <Skeleton className="h-8 w-64 mb-6" />
        <div className="space-y-6">
          <Skeleton className="h-12 w-full rounded-2xl" />
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full rounded-2xl" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
      <header className="mb-6 animate-fade-up">
        <h1 className="text-2xl sm:text-3xl font-headline font-semibold tracking-tight">
          Your wishlists
        </h1>
        <p className="text-on-surface-variant text-sm mt-1">
          Save your favourite stays and revisit them later.
        </p>
      </header>

      <form
        onSubmit={handleCreate}
        className="flex gap-2 mb-7 p-2 bg-surface-container-low rounded-full focus-within:ring-2 focus-within:ring-primary/30 transition-shadow"
      >
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Create a new wishlist…"
          maxLength={80}
          className="flex-1 px-4 py-2.5 bg-transparent outline-none text-sm"
        />
        <button
          type="submit"
          disabled={creating || !newName.trim()}
          className="px-5 py-2.5 bg-primary text-on-primary text-sm font-semibold rounded-full disabled:opacity-50 disabled:cursor-not-allowed press"
        >
          {creating ? "Creating…" : "Create"}
        </button>
      </form>

      {loading && (
        <div className="space-y-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full rounded-2xl" />
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="rounded-2xl bg-error-container/40 p-6 text-on-error-container">
          <p className="font-semibold">Couldn’t load wishlists</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {!loading && !error && wishlists.length === 0 && (
        <div className="rounded-3xl bg-surface-container-low p-12 text-center">
          <span className="material-symbols-outlined text-5xl text-on-surface-variant">
            favorite_border
          </span>
          <h2 className="font-headline font-semibold text-xl mt-3">
            No wishlists yet
          </h2>
          <p className="text-on-surface-variant text-sm mt-1">
            Browse stays and tap the heart icon to save them.
          </p>
          <Link
            href="/"
            className="inline-block mt-5 px-6 py-3 bg-primary text-on-primary rounded-full font-semibold press shadow-glow-primary"
          >
            Explore stays
          </Link>
        </div>
      )}

      {!loading && !error && wishlists.length > 0 && (
        <div className="space-y-10">
          {wishlists.map((w, wi) => (
            <Reveal as="article" key={w.id} delay={wi * 60} className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-headline font-semibold">{w.name}</h2>
                <button
                  type="button"
                  onClick={() => handleDelete(w.id, w.name)}
                  className="text-xs text-on-surface-variant hover:text-error font-semibold press px-2 py-1 rounded-full"
                >
                  Delete
                </button>
              </div>
              {w.items.length === 0 ? (
                <p className="text-sm text-on-surface-variant italic px-1">
                  Empty — heart a stay to add it here.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {w.items.map((item) => {
                    const cover =
                      item.listing.images[0]?.url ||
                      "https://via.placeholder.com/600x400?text=No+Image";
                    return (
                      <div
                        key={item.id}
                        className="relative group rounded-3xl overflow-hidden bg-surface-container-lowest shadow-soft hover-lift hover:shadow-lift"
                      >
                        <Link
                          href={`/stays/${item.listing.id}`}
                          className="block"
                        >
                          <div className="relative aspect-[4/3] overflow-hidden">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={cover}
                              alt={item.listing.title}
                              loading="lazy"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                            />
                          </div>
                          <div className="p-3.5">
                            <p className="font-bold line-clamp-1">
                              {item.listing.title}
                            </p>
                            <p className="text-sm text-on-surface-variant">
                              {item.listing.city}, {item.listing.state}
                            </p>
                            <p className="text-sm font-bold text-primary mt-1">
                              {currency.format(item.listing.basePrice)}
                              <span className="text-xs font-normal text-on-surface-variant">
                                {" "}
                                / night
                              </span>
                            </p>
                          </div>
                        </Link>
                        <button
                          type="button"
                          onClick={() =>
                            handleRemoveItem(w.id, item.listing.id)
                          }
                          aria-label="Remove from wishlist"
                          className="absolute top-3 right-3 grid place-items-center w-9 h-9 glass rounded-full text-error shadow-soft press hover:scale-110 transition-transform"
                        >
                          <span
                            className="material-symbols-outlined text-base"
                            style={{ fontVariationSettings: "'FILL' 1" }}
                          >
                            favorite
                          </span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </Reveal>
          ))}
        </div>
      )}
    </section>
  );
}
