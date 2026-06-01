"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./auth-context";

/**
 * Redirects to /login?next=<current path> when the user is unauthenticated.
 * Waits for the initial auth-context load before deciding. Reads the target
 * from window.location inside the effect (client-only) so pages using this
 * hook don't need a useSearchParams Suspense boundary.
 */
export function useRequireAuth() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (isAuthenticated) return;
    const next = window.location.pathname + window.location.search;
    router.replace(`/login?next=${encodeURIComponent(next)}`);
  }, [isLoading, isAuthenticated, router]);

  return { isAuthenticated, isLoading };
}
