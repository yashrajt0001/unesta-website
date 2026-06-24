"use client";

/**
 * Shared motion primitives for the guest site, built on `motion/react`.
 * Everything here honours prefers-reduced-motion via `useReducedMotion`,
 * and reuses the brand spring/soft easings defined in globals.css.
 */

import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useInView,
  useMotionValue,
  animate,
  type Variants,
} from "motion/react";
import {
  useEffect,
  useRef,
  useState,
  type ElementType,
  type ReactNode,
} from "react";

// Brand easings (mirror of globals.css custom properties)
const EASE_OUT_SOFT = [0.22, 1, 0.36, 1] as const;
const EASE_SPRING = [0.34, 1.56, 0.64, 1] as const;

type RevealDir = "up" | "down" | "left" | "right" | "scale" | "blur";

function offset(dir: RevealDir) {
  switch (dir) {
    case "up":
      return { y: 26 };
    case "down":
      return { y: -26 };
    case "left":
      return { x: 34 };
    case "right":
      return { x: -34 };
    case "scale":
      return { scale: 0.94 };
    case "blur":
      return { filter: "blur(14px)", y: 14 };
    default:
      return { y: 26 };
  }
}

/**
 * Single element that animates in the first time it scrolls into view.
 * A richer, multi-directional replacement for the CSS-only <Reveal/>.
 */
export function FadeIn({
  children,
  dir = "up",
  delay = 0,
  duration = 0.7,
  className = "",
  as = "div",
  once = true,
  id,
}: {
  children: ReactNode;
  dir?: RevealDir;
  delay?: number;
  duration?: number;
  className?: string;
  as?: ElementType;
  once?: boolean;
  id?: string;
}) {
  const reduce = useReducedMotion();
  const MotionTag = motion[as as keyof typeof motion] as typeof motion.div;

  const hidden = reduce
    ? { opacity: 0 }
    : { opacity: 0, ...offset(dir) };
  const shown = reduce
    ? { opacity: 1 }
    : { opacity: 1, x: 0, y: 0, scale: 1, filter: "blur(0px)" };

  return (
    <MotionTag
      id={id}
      className={className}
      initial={hidden}
      whileInView={shown}
      viewport={{ once, amount: 0.18, margin: "0px 0px -8% 0px" }}
      transition={{ duration, delay, ease: EASE_OUT_SOFT }}
    >
      {children}
    </MotionTag>
  );
}

const staggerParent: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

const staggerChild: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: EASE_OUT_SOFT },
  },
};

/**
 * Container that choreographs its <StaggerItem/> children into view in sequence.
 */
export function Stagger({
  children,
  className = "",
  amount = 0.15,
}: {
  children: ReactNode;
  className?: string;
  amount?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      variants={reduce ? undefined : staggerParent}
      initial={reduce ? undefined : "hidden"}
      whileInView={reduce ? undefined : "show"}
      viewport={{ once: true, amount }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      variants={reduce ? undefined : staggerChild}
    >
      {children}
    </motion.div>
  );
}

/**
 * Headline that animates in word-by-word. Use for hero titles.
 */
export function KineticText({
  text,
  className = "",
  delay = 0,
}: {
  text: string;
  className?: string;
  delay?: number;
}) {
  const reduce = useReducedMotion();
  const words = text.split(" ");

  if (reduce) return <span className={className}>{text}</span>;

  return (
    <motion.span
      className={className}
      initial="hidden"
      animate="show"
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: 0.07, delayChildren: delay } },
      }}
      style={{ display: "inline-block" }}
    >
      {words.map((w, i) => (
        <span
          key={`${w}-${i}`}
          style={{ display: "inline-block", overflow: "hidden" }}
        >
          <motion.span
            style={{ display: "inline-block", willChange: "transform" }}
            variants={{
              hidden: { y: "110%", opacity: 0 },
              show: {
                y: "0%",
                opacity: 1,
                transition: { duration: 0.7, ease: EASE_OUT_SOFT },
              },
            }}
          >
            {w}
            {i < words.length - 1 ? " " : ""}
          </motion.span>
        </span>
      ))}
    </motion.span>
  );
}

/**
 * Number that counts up from 0 to `to` the first time it enters view.
 */
export function CountUp({
  to,
  suffix = "",
  duration = 1.4,
  className = "",
}: {
  to: number;
  suffix?: string;
  duration?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const [val, setVal] = useState(reduce ? to : 0);

  useEffect(() => {
    if (reduce || !inView) return;
    const controls = animate(0, to, {
      duration,
      ease: EASE_OUT_SOFT,
      onUpdate: (v) => setVal(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, to, duration, reduce]);

  return (
    <span ref={ref} className={className}>
      {val.toLocaleString("en-IN")}
      {suffix}
    </span>
  );
}

/**
 * Pointer-following "magnetic" wrapper — the child drifts toward the cursor.
 * Disabled for touch / reduced-motion.
 */
export function Magnetic({
  children,
  strength = 0.35,
  className = "",
}: {
  children: ReactNode;
  strength?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 18, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 220, damping: 18, mass: 0.4 });

  function onMove(e: React.PointerEvent) {
    if (reduce || e.pointerType !== "mouse") return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * strength);
    y.set((e.clientY - (r.top + r.height / 2)) * strength);
  }
  function reset() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ x: sx, y: sy }}
      onPointerMove={onMove}
      onPointerLeave={reset}
    >
      {children}
    </motion.div>
  );
}

/**
 * Scroll-linked vertical parallax. Wrap an absolutely-positioned image layer.
 * `speed` > 0 moves slower than scroll (background feel).
 */
export function Parallax({
  children,
  speed = 0.2,
  className = "",
}: {
  children: ReactNode;
  speed?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(
    scrollYProgress,
    [0, 1],
    [`${-speed * 100}%`, `${speed * 100}%`],
  );

  return (
    <div ref={ref} className={className}>
      <motion.div
        style={reduce ? undefined : { y }}
        className="w-full h-full"
      >
        {children}
      </motion.div>
    </div>
  );
}

/**
 * 3D tilt-on-hover card. Children sit on a perspective plane that rotates
 * toward the cursor. No-op for touch / reduced-motion.
 */
export function Tilt({
  children,
  className = "",
  max = 8,
}: {
  children: ReactNode;
  className?: string;
  max?: number;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 200, damping: 20 });
  const sry = useSpring(ry, { stiffness: 200, damping: 20 });

  function onMove(e: React.PointerEvent) {
    if (reduce || e.pointerType !== "mouse") return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    ry.set(px * max);
    rx.set(-py * max);
  }
  function reset() {
    rx.set(0);
    ry.set(0);
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      onPointerMove={onMove}
      onPointerLeave={reset}
      style={{
        rotateX: srx,
        rotateY: sry,
        transformStyle: "preserve-3d",
        transformPerspective: 900,
      }}
    >
      {children}
    </motion.div>
  );
}

export { EASE_OUT_SOFT, EASE_SPRING };
