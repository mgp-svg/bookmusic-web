import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

/** Issue-style masthead: wordmark, utility nav, one hard rule under it. */
export async function Masthead() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="sticky top-0 z-40 bg-paper">
      <div className="mx-auto flex max-w-5xl items-baseline justify-between gap-4 px-5 pt-3 pb-2.5">
        <Link href="/" className="eyebrow hover:text-orange transition-colors">
          Book&nbsp;Music
        </Link>
        <nav className="flex items-baseline gap-4 sm:gap-6">
          <Link href="/search" className="eyebrow text-muted hover:text-ink transition-colors">
            Search
          </Link>
          {user ? (
            <Link href="/profile" className="eyebrow text-muted hover:text-ink transition-colors">
              You
            </Link>
          ) : (
            <Link href="/signin" className="eyebrow text-muted hover:text-ink transition-colors">
              Sign&nbsp;in
            </Link>
          )}
        </nav>
      </div>
      <div className="mx-auto max-w-5xl px-5">
        <div className="rule" />
      </div>
    </header>
  );
}
