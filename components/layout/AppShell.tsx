"use client";

import { useState } from "react";
import SideDrawer from "./SideDrawer";
import TopAppBar from "./TopAppBar";
import BottomNav from "./BottomNav";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <SideDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      <TopAppBar onMenuClick={() => setDrawerOpen(true)} />
      <main className="pb-32">{children}</main>
      <BottomNav />
    </>
  );
}
