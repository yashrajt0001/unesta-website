"use client";

import { motion, useReducedMotion } from "motion/react";

/**
 * Per-navigation wrapper. Re-mounts on every route change, giving each page a
 * soft cross-fade entrance.
 *
 * Note: opacity only — a transform here would create a containing block and
 * break the position:fixed / sticky chrome used on the listing and detail pages.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();
  if (reduce) return <>{children}</>;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
