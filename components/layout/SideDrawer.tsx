"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/toast";

interface SideDrawerProps {
  open: boolean;
  onClose: () => void;
}

export default function SideDrawer({ open, onClose }: SideDrawerProps) {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname() || "/";
  const toast = useToast();
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  // ESC to close + focus management
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    // Lock body scroll while drawer is open
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  function handleLogout() {
    logout();
    toast.info("Signed out.");
    onClose();
    router.push("/");
  }

  const displayName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    user?.phone ||
    "Guest";

  return (
    <>
      <div
        className={`fixed inset-0 glass-dark z-[60] transition-opacity duration-300 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Main menu"
        aria-hidden={!open}
        className={`fixed top-0 right-0 h-full w-[320px] max-w-[90vw] bg-surface-container-lowest z-[70] transition-transform duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] rounded-l-[2rem] shadow-float flex flex-col ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-6 flex flex-col h-full">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">
                travel_explore
              </span>
              <h2 className="text-lg font-bold font-headline tracking-tight">
                UNesta
              </h2>
            </div>
            <button
              ref={closeButtonRef}
              type="button"
              className="p-2 hover:bg-surface-container-high rounded-full transition-colors"
              onClick={onClose}
              aria-label="Close menu"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {isAuthenticated ? (
            <div className="flex items-center gap-3 mb-4 p-3 rounded-2xl bg-surface-container-low">
              <div className="w-11 h-11 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-sm uppercase overflow-hidden">
                {user?.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.avatarUrl}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  [user?.firstName?.[0], user?.lastName?.[0]]
                    .filter(Boolean)
                    .join("") || (user?.phone?.slice(-2) ?? "U")
                )}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-on-surface truncate">
                  {displayName}
                </p>
                <p className="text-xs text-on-surface-variant truncate">
                  {user?.email || user?.phone}
                </p>
              </div>
            </div>
          ) : (
            <Link
              href="/login"
              onClick={onClose}
              className="flex items-center justify-center gap-2 mb-4 p-3.5 rounded-2xl bg-primary text-on-primary font-semibold press shadow-glow-primary"
            >
              <span className="material-symbols-outlined">login</span>
              Log in or sign up
            </Link>
          )}

          <nav className="flex-1 space-y-1 overflow-y-auto" aria-label="Drawer">
            <DrawerLink href="/" icon="explore" label="Explore stays" onClose={onClose} />
            <DrawerLink
              href="/experiences"
              icon="local_activity"
              label="Experiences"
              onClose={onClose}
            />
            <DrawerLink href="/search" icon="search" label="Search" onClose={onClose} />
            {isAuthenticated && (
              <>
                <DrawerLink
                  href="/trips"
                  icon="luggage"
                  label="My trips"
                  onClose={onClose}
                />
                <DrawerLink
                  href="/wishlists"
                  icon="favorite"
                  label="Wishlists"
                  onClose={onClose}
                />
                <DrawerLink
                  href="/profile"
                  icon="person"
                  label="Profile"
                  onClose={onClose}
                />
              </>
            )}

            <div className="h-px bg-outline-variant/30 my-3" />

            <DrawerLink
              href="https://unesta-host-dashboard.vercel.app"
              icon="home_work"
              label="Become a host"
              onClose={onClose}
              external
            />
            <DrawerLink
              href="#"
              icon="help"
              label="Help center"
              onClose={onClose}
            />
          </nav>

          {isAuthenticated && (
            <button
              type="button"
              onClick={handleLogout}
              className="mt-4 flex items-center justify-center gap-2 p-3.5 rounded-2xl border border-outline-variant/40 text-on-surface hover:bg-surface-container-low press font-semibold"
            >
              <span className="material-symbols-outlined">logout</span>
              Log out
            </button>
          )}

          <p className="mt-4 text-xs text-on-surface-variant/60 font-medium text-center">
            © 2026 UNesta
          </p>
        </div>
      </aside>
    </>
  );
}

function DrawerLink({
  href,
  icon,
  label,
  onClose,
  external,
}: {
  href: string;
  icon: string;
  label: string;
  onClose: () => void;
  external?: boolean;
}) {
  const pathname = usePathname() || "/";
  const active = !external && pathname === href;
  const className = `flex items-center gap-4 px-3 py-3 rounded-2xl press font-medium transition-colors ${
    active
      ? "bg-primary-fixed/50 text-primary"
      : "text-on-surface hover:bg-surface-container-low"
  }`;
  const content = (
    <>
      <span
        className={`material-symbols-outlined ${active ? "text-primary" : "text-on-surface-variant"}`}
        style={active ? { fontVariationSettings: "'FILL' 1" } : undefined}
      >
        {icon}
      </span>
      {label}
    </>
  );
  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        onClick={onClose}
      >
        {content}
      </a>
    );
  }
  return (
    <Link href={href} className={className} onClick={onClose}>
      {content}
    </Link>
  );
}
