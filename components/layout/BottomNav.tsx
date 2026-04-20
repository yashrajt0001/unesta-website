"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { href: "/", icon: "home", fill: true },
    { href: "/search", icon: "search", fill: false },
    { href: "/wishlists", icon: "favorite", fill: false },
  ];

  return (
    <nav
      className="fixed bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center bg-surface/70 backdrop-blur-[32px] rounded-full py-2 shadow-[0px_0px_60px_0px_rgba(26,28,28,0.08)] gap-6 sm:gap-8 px-4 sm:px-6 lg:hidden"
      aria-label="Bottom navigation"
    >
      {navItems.map(({ href, icon, fill }) => {
        const isActive = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={`nav-item flex items-center justify-center p-3 transition-all duration-300 hover:scale-105 active:scale-95 ${
              isActive ? "active-nav-pill" : "text-on-surface-variant"
            }`}
          >
            <span
              className="material-symbols-outlined"
              style={
                fill || isActive
                  ? { fontVariationSettings: "'FILL' 1, 'wght' 300, 'GRAD' 0, 'opsz' 24" }
                  : undefined
              }
            >
              {icon}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
