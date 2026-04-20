"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface TopAppBarProps {
  onMenuClick: () => void;
}

export default function TopAppBar({ onMenuClick }: TopAppBarProps) {
  const pathname = usePathname();
  const isExperiences = pathname === "/experiences";

  return (
    <header className="bg-surface flex items-center justify-between w-full px-4 sm:px-6 py-3 sm:py-4 sticky top-0 z-40 border-b border-outline-variant/20">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2">
        <span className="material-symbols-outlined text-primary icon-md sm:icon-lg">
          travel_explore
        </span>
        <h1 className="text-base sm:text-xl font-bold text-on-surface font-headline tracking-tight">
          UNesta
        </h1>
      </Link>

      {/* Desktop category tabs */}
      <div className="hidden lg:flex items-center gap-2">
        <Link
          href="/"
          className={`py-2 px-5 rounded-full text-sm font-semibold transition-all ${
            !isExperiences
              ? "bg-surface-container-lowest shadow-sm text-primary"
              : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest"
          }`}
        >
          Stays
        </Link>
        <Link
          href="/experiences"
          className={`py-2 px-5 rounded-full text-sm font-semibold transition-all ${
            isExperiences
              ? "bg-surface-container-lowest shadow-sm text-primary"
              : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest"
          }`}
        >
          Experiences
        </Link>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2">
        <button className="hidden lg:inline-flex items-center justify-center py-2 px-4 rounded-full bg-primary text-white text-sm font-semibold hover:bg-primary-container transition-all">
          Become a Host
        </button>
        <button
          className="text-on-surface-variant hover:opacity-80 transition-opacity p-1"
          onClick={onMenuClick}
          aria-label="Open menu"
        >
          <span className="material-symbols-outlined icon-md sm:icon-lg">menu</span>
        </button>
      </div>
    </header>
  );
}
