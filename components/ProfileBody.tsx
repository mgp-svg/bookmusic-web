import Link from "next/link";
import type { ProfileActivity, UserProfile } from "@/lib/types";
import { BookShelf } from "./BookCard";
import { AccentMark, Eyebrow, Rule, SectionHeader } from "./primitives";

/** Shared body for /profile and /u/[username]. */
export function ProfileBody({
  profile,
  activity,
  children,
}: {
  profile: UserProfile;
  activity: ProfileActivity;
  /** Owner-only controls (sign out), rendered under the header. */
  children?: React.ReactNode;
}) {
  const { books, nominations, vote_count } = activity;

  return (
    <div className="mx-auto max-w-5xl px-5 pt-7">
      <Eyebrow>Reader</Eyebrow>
      <h1 className="display mt-4 text-[clamp(2.2rem,9vw,3.75rem)]">
        {profile.display_name || profile.username}
      </h1>
      <p className="mt-3 font-mono text-sm text-muted">@{profile.username}</p>
      <AccentMark className="mt-5" />

      <div className="mt-7">
        <Rule />
        <dl className="grid grid-cols-3 divide-x divide-[color:var(--rule-soft)]">
          <Stat n="01" label={nominations.length === 1 ? "Nomination" : "Nominations"} value={nominations.length} />
          <Stat n="02" label={vote_count === 1 ? "Vote" : "Votes"} value={vote_count} />
          <Stat n="03" label={books.length === 1 ? "Book" : "Books"} value={books.length} />
        </dl>
        <Rule />
      </div>

      {children ? <div className="mt-6 max-w-xs">{children}</div> : null}

      {books.length ? (
        <section className="pt-11">
          <SectionHeader title="Books" subtitle="Contributed to" />
          <div className="pt-5">
            <BookShelf books={books} />
          </div>
        </section>
      ) : null}

      <section className="pt-11">
        <SectionHeader title="Nominations" subtitle={nominations.length ? "Newest first" : "None yet"} />
        {nominations.length ? (
          <ul className="pt-2">
            {nominations.map((n, i) => (
              <li key={n.book_song_id}>
                {i > 0 ? <div className="rule-soft" /> : null}
                <Link href={`/book/${n.book.id}`} className="flex items-center gap-4 py-3 hover:opacity-75">
                  <div className="h-12 w-12 shrink-0 overflow-hidden bg-elevated">
                    {n.song.artwork_url ? (
                      <img src={n.song.artwork_url} alt="" loading="lazy" className="h-full w-full object-cover" />
                    ) : null}
                  </div>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[15px] font-bold leading-tight">{n.song.title}</span>
                    <span className="block truncate text-[13px] text-muted">{n.song.artist}</span>
                    <span className="eyebrow mt-1 block truncate text-muted">for {n.book.canonical_title}</span>
                  </span>
                  <span className="shrink-0 text-sm font-black tabular-nums">{n.score > 0 ? `+${n.score}` : n.score}</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="pt-5 text-sm text-muted">
            Nothing nominated yet. Open a book and add the song that belongs to it.
          </p>
        )}
      </section>
    </div>
  );
}

function Stat({ n, label, value }: { n: string; label: string; value: number }) {
  return (
    <div className="flex flex-col gap-1 px-4 py-4 first:pl-0">
      <dt className="eyebrow text-muted">
        {n} {label}
      </dt>
      <dd className="text-[clamp(1.75rem,6vw,2.5rem)] font-black leading-none tabular-nums">{value}</dd>
    </div>
  );
}
