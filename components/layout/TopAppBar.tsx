"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

interface TopAppBarProps {
  onMenuClick: () => void;
}

export default function TopAppBar({ onMenuClick }: TopAppBarProps) {
  const pathname = usePathname() || "/";
  const isExperiences = pathname === "/experiences";
  const { user, isAuthenticated, isLoading } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const initials =
    [user?.firstName?.[0], user?.lastName?.[0]].filter(Boolean).join("") ||
    user?.phone?.slice(-2) ||
    "U";

  return (
    <header
      className={`sticky top-0 z-40 flex items-center justify-between w-full px-4 sm:px-6 py-3 transition-all duration-300 ${
        scrolled
          ? "glass shadow-soft border-b border-outline-variant/20"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <Link href="/" className="flex items-center gap-2 press">
        <span className="material-symbols-outlined text-primary icon-md sm:icon-lg">
          travel_explore
        </span>
        <h1 className="text-lg sm:text-2xl font-bold text-on-surface font-headline tracking-tight">
          UNesta
        </h1>
      </Link>

      <div className="hidden lg:flex items-center gap-1 bg-surface-container-low/70 rounded-full p-1 border border-outline-variant/20">
        <Link
          href="/"
          aria-current={!isExperiences ? "page" : undefined}
          className={`py-2 px-5 rounded-full text-sm font-semibold transition-all duration-300 ${
            !isExperiences
              ? "bg-surface-container-lowest shadow-soft text-primary"
              : "text-on-surface-variant hover:text-on-surface"
          }`}
        >
          Stays
        </Link>
        <Link
          href="/experiences"
          aria-current={isExperiences ? "page" : undefined}
          className={`py-2 px-5 rounded-full text-sm font-semibold transition-all duration-300 ${
            isExperiences
              ? "bg-surface-container-lowest shadow-soft text-primary"
              : "text-on-surface-variant hover:text-on-surface"
          }`}
        >
          Experiences
        </Link>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <a
          href="https://unesta-host-dashboard.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden lg:inline-flex items-center justify-center py-2 px-4 rounded-full bg-primary text-white text-sm font-semibold press hover:brightness-105 shadow-soft"
        >
          Become a Host
        </a>

        {!isLoading && !isAuthenticated && (
          <Link
            href="/login"
            className="hidden sm:inline-flex text-on-surface-variant hover:text-primary transition-colors text-sm font-semibold"
          >
            Log in
          </Link>
        )}

        {!isLoading && isAuthenticated && (
          <Link
            href="/profile"
            aria-label="Open profile"
            className="hidden sm:grid place-items-center w-9 h-9 rounded-full bg-primary-container text-on-primary-container text-xs font-bold uppercase tracking-wider press overflow-hidden ring-2 ring-surface-container-lowest"
          >
            {user?.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.avatarUrl}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              initials
            )}
          </Link>
        )}

        <button
          type="button"
          className="grid place-items-center w-10 h-10 rounded-full text-on-surface-variant hover:bg-surface-container-high press transition-colors"
          onClick={onMenuClick}
          aria-label="Open menu"
        >
          <span className="material-symbols-outlined icon-md">menu</span>
        </button>
      </div>
    </header>
  );
}
