import Link from "next/link";
import { Rule } from "./primitives";

export function SiteFooter() {
  return (
    <footer className="mx-auto w-full max-w-5xl px-5 pb-10 pt-16">
      <Rule />
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-3 pt-3">
        <span className="eyebrow text-muted">No audio, ever — just links out</span>
        <div className="flex items-baseline gap-5">
          <Link href="/search" className="eyebrow text-muted hover:text-ink transition-colors">
            Search
          </Link>
          <Link href="/support" className="eyebrow text-muted hover:text-ink transition-colors">
            Support
          </Link>
          <Link href="/privacy" className="eyebrow text-muted hover:text-ink transition-colors">
            Privacy
          </Link>
        </div>
      </div>
    </footer>
  );
}
