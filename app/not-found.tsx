import Link from "next/link";
import { UnestaMark } from "@/components/brand/Logo";

export default function NotFound() {
  return (
    <main className="min-h-[60vh] flex items-center justify-center px-6 py-16">
      <div className="max-w-md text-center space-y-4 animate-fade-up">
        <UnestaMark className="mx-auto block h-16 w-auto text-primary" />
        <h1 className="font-headline text-3xl sm:text-4xl font-semibold tracking-tight">
          We couldn’t find that page
        </h1>
        <p className="text-on-surface-variant">
          The link may be broken, or the page may have moved. Let’s get you back
          on the road.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            href="/"
            className="px-6 py-3 bg-primary text-on-primary rounded-full font-semibold press shadow-glow-primary"
          >
            Back to home
          </Link>
          <Link
            href="/search"
            className="px-6 py-3 bg-surface-container-low text-on-surface rounded-full font-semibold hover:bg-surface-container press"
          >
            Search stays
          </Link>
        </div>
      </div>
    </main>
  );
}
