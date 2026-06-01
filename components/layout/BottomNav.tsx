"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

type NavItem = {
  href: string;
  label: string;
  icon: string;
};

const items: NavItem[] = [
  { href: "/", label: "Explore", icon: "home" },
  { href: "/search", label: "Search", icon: "search" },
  { href: "/wishlists", label: "Wishlists", icon: "favorite" },
  { href: "/trips", label: "Trips", icon: "luggage" },
];

function NavButton({
  href,
  label,
  icon,
  isActive,
}: {
  href: string;
  label: string;
  icon: string;
  isActive: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={`group flex flex-col items-center justify-center px-3 py-1.5 rounded-full min-w-[60px] transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] active:scale-90 ${
        isActive ? "active-nav-pill" : "text-on-surface-variant hover:text-on-surface"
      }`}
    >
      <span
        className={`material-symbols-outlined text-[22px] transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
          isActive ? "-translate-y-0.5" : "group-active:scale-110"
        }`}
        style={
          isActive
            ? { fontVariationSettings: "'FILL' 1, 'wght' 500" }
            : undefined
        }
      >
        {icon}
      </span>
      <span className="text-[10px] font-semibold mt-0.5">{label}</span>
    </Link>
  );
}

export default function BottomNav() {
  const pathname = usePathname() || "/";
  const { isAuthenticated } = useAuth();

  return (
    <nav
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 flex items-center glass rounded-full shadow-float gap-1 px-2 py-2 lg:hidden border border-outline-variant/30"
      aria-label="Primary navigation"
    >
      {items.map((item) => {
        const target =
          !isAuthenticated &&
          (item.href === "/wishlists" || item.href === "/trips")
            ? `/login?next=${encodeURIComponent(item.href)}`
            : item.href;
        const isActive =
          pathname === item.href ||
          (item.href !== "/" && pathname.startsWith(`${item.href}/`));
        return (
          <NavButton
            key={item.href}
            href={target}
            label={item.label}
            icon={item.icon}
            isActive={isActive}
          />
        );
      })}

      <NavButton
        href={isAuthenticated ? "/profile" : "/login"}
        label={isAuthenticated ? "Profile" : "Log in"}
        icon="person"
        isActive={pathname === "/profile"}
      />
    </nav>
  );
}
