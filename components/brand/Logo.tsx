/**
 * Unesta brand marks — the bird, the UNESTA wordmark, and the two locked up.
 */

type MarkProps = { className?: string; strokeWidth?: number };
type BrandProps = { className?: string };

/**
 * Unesta bird mark, vectorised from the master logo.
 *
 * It is a single-weight line drawing, so it is drawn as strokes in
 * `currentColor` and inherits the surrounding text colour. Size it with a
 * height class; the width follows. Below ~40px the hairline drops out, so
 * small placements pass a heavier `strokeWidth`.
 */
export function UnestaMark({ className = "", strokeWidth = 7 }: MarkProps) {
  return (
    <svg
      viewBox="0 0 296.5 201.3"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <g
        transform="translate(-269.5 -165.7)"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M331 169.2C331.7 170.8 333.1 175 335 178.8C336.8 182.6 338.2 186.1 342 192C345.8 198 351.2 206.5 357.7 214.6C364.2 222.7 375.6 234.9 381 240.7C386.4 246.5 387 246.5 390.2 249.2C393.3 251.8 396.6 254.6 400.1 256.7C403.6 258.8 407.8 260.9 411.3 261.8C414.8 262.8 417.9 262.8 421.1 262.5C424.4 262.1 424.6 262.4 430.7 259.9C436.8 257.3 451.7 249.6 457.8 247.2C463.9 244.8 464.7 245.6 467.6 245.5C470.4 245.3 472.2 245.4 474.9 246.3C477.6 247.1 481.2 248.6 483.7 250.5C486.3 252.4 488.6 255 490.4 257.7C492.2 260.4 493.5 263.1 494.6 266.7C495.6 270.2 496.4 276.9 496.8 278.9L497.2 284.5L562.5 302.5" />
        <path d="M303.4 226.5C307.4 229.8 320.3 240.1 327.2 246.3C334.1 252.6 339.3 257.8 344.8 264C350.3 270.3 356.5 278.7 360.2 283.7C363.9 288.7 364.8 290.7 366.8 294.3C368.9 297.9 370.7 301.2 372.5 305.4C374.3 309.6 376.7 316.3 377.8 319.4C378.9 322.6 378.7 322.7 378.8 324.3C379 325.9 379.1 327.2 378.5 329C378 330.9 378.5 331.8 375.3 335.3C372.2 338.8 362.1 347.5 359.5 350" />
        <path d="M273 363.5C278.8 362.7 295.3 360.6 307.7 358.5C320 356.4 333.4 351.9 346.9 350.9C360.4 349.9 379.2 352.4 388.7 352.4C398.1 352.4 398.7 351.8 403.6 351C408.5 350.2 413 349.2 418.2 347.6C423.3 346 428.9 344.1 434.5 341.4C440.1 338.7 446.3 335.2 451.7 331.4C457.2 327.6 462.1 323.6 467.1 318.6C472.1 313.6 479.5 304.3 482 301.5" />
        <circle cx="464.5" cy="277" r="10.8" />
      </g>
    </svg>
  );
}

/** The UNESTA wordmark on its own. */
export function UnestaWordmark({ className = "" }: BrandProps) {
  return (
    <svg
      viewBox="0 0 267.9 46.4"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <g
        transform="translate(-284.3 -399.8)"
        stroke="currentColor"
        strokeWidth={9.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M289 404.5V427A14.5 14.5 0 0 0 318 427V404.5" />
        <path d="M339.5 441.5V419A14.5 14.5 0 0 1 368.5 419V441.5" />
        <path d="M410.5 405H390.5V441.5H411M390.5 423H408" />
        <path d="M453.5 408A11.1 10 0 0 0 433.5 414C433.5 421.5 456.5 424 456.5 431.5A12 10 0 0 1 432.8 434" />
        <path d="M475.5 405H499.5M487.5 405V441.5" />
        <path d="M518.5 441.5V419A14.5 14.5 0 0 1 547.5 419V441.5M518.5 430.1H547.5" />
      </g>
    </svg>
  );
}

/**
 * Bird + wordmark side by side. Everything is sized in `em`, so the lockup
 * scales with whatever font size you put on it (e.g. `text-lg sm:text-xl`).
 */
export default function UnestaLogo({ className = "" }: BrandProps) {
  return (
    <span className={`inline-flex items-center gap-[0.32em] ${className}`}>
      <UnestaMark className="h-[1.45em] w-auto shrink-0" strokeWidth={9.5} />
      <UnestaWordmark className="h-[0.6em] w-auto shrink-0" />
      <span className="sr-only">Unesta</span>
    </span>
  );
}
