"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import SideDrawer from "./SideDrawer";
import TopAppBar from "./TopAppBar";
import BottomNav from "./BottomNav";

// Routes that render their own chrome (auth flows, full-bleed checkout)
const BARE_ROUTES = ["/login", "/signup"];

function isBareRoute(pathname: string | null) {
  if (!pathname) return false;
  return BARE_ROUTES.some((r) => pathname === r || pathname.startsWith(`${r}/`));
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pathname = usePathname();
  const bare = isBareRoute(pathname);

  if (bare) {
    return <>{children}</>;
  }

  return (
    <>
      <SideDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      <TopAppBar onMenuClick={() => setDrawerOpen(true)} />
      <main className="pb-24 lg:pb-12">{children}</main>
      <BottomNav />
    </>
  );
}
