import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBook, getSoundtrack } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";
import { catalogNumber } from "@/lib/deeplink";
import { plainProse } from "@/lib/text";
import { BookCover } from "@/components/BookCover";
import { Soundtrack } from "@/components/Soundtrack";
import { RecordVisit } from "@/components/RecordVisit";
import { AccentMark, Eyebrow, Rule, SectionHeader } from "@/components/primitives";

type Params = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const book = await getBook(id).catch(() => null);
  if (!book) return { title: "Book not found" };

  const title = `${book.canonical_title} — the soundtrack`;
  const description = book.song_count
    ? `${book.song_count} songs readers picked for ${book.canonical_title} by ${book.author}. Vote on the soundtrack, or add the one that's missing.`
    : `No one has scored ${book.canonical_title} by ${book.author} yet. Add the first song.`;

  return {
    title,
    description,
    alternates: { canonical: `/book/${book.id}` },
    openGraph: { title, description, url: `/book/${book.id}`, type: "music.playlist" },
  };
}

export default async function BookPage({ params }: Params) {
  const { id } = await params;

  const [book, supabase] = await Promise.all([getBook(id), createClient()]);
  if (!book) notFound();

  const [entries, { data: auth }] = await Promise.all([getSoundtrack(book.id), supabase.auth.getUser()]);

  const description = book.description ? plainProse(book.description) : null;
  const year = book.publication_year ? String(book.publication_year) : null;
  const votes = entries.reduce((sum, e) => sum + e.upvotes + e.downvotes, 0);
  const contributors = new Set(entries.map((e) => e.nominated_by).filter(Boolean)).size;

  return (
    <article className="mx-auto max-w-5xl px-5">
      <RecordVisit book={book} />

      {/* Editorial spread: giant title set against the cover, metadata strip beneath. */}
      <header className="pt-7">
        <div className="flex items-baseline justify-between gap-4">
          <Eyebrow>Soundtrack</Eyebrow>
          <Eyebrow muted>{catalogNumber(book.id)}</Eyebrow>
        </div>

        <div className="mt-5 grid gap-6 sm:grid-cols-[1fr_auto] sm:items-end">
          <div>
            <h1 className="display text-[clamp(2.4rem,9vw,4.75rem)]">{book.canonical_title}</h1>
            <p className="mt-4 text-lg font-bold">{book.author}</p>
            <AccentMark className="mt-5" />
          </div>
          <div className="w-[45%] max-w-[210px] shadow-[6px_6px_0_0_var(--rule-soft)] sm:w-[200px]">
            <div className="aspect-[2/3] w-full overflow-hidden">
              <BookCover
                title={book.canonical_title}
                author={book.author}
                src={book.cover_url}
                size="lg"
                priority
                sizes="(max-width: 640px) 45vw, 200px"
              />
            </div>
          </div>
        </div>

        <div className="mt-7">
          <Rule />
          <dl className="grid grid-cols-3 divide-x divide-[color:var(--rule-soft)]">
            <Stat n="01" label={entries.length === 1 ? "Track" : "Tracks"} value={entries.length} />
            <Stat n="02" label={votes === 1 ? "Vote" : "Votes"} value={votes} />
            <Stat n="03" label={contributors === 1 ? "Reader" : "Readers"} value={contributors} />
          </dl>
          <Rule />
        </div>

        {description ? (
          <details className="group mt-5">
            <summary className="cursor-pointer list-none">
              <p className="text-[15px] leading-relaxed text-muted line-clamp-3 group-open:line-clamp-none">
                {description}
              </p>
              <span className="eyebrow mt-2 inline-block text-muted group-open:hidden">More →</span>
              <span className="eyebrow mt-2 hidden text-muted group-open:inline-block">Less ←</span>
            </summary>
          </details>
        ) : null}

        {year ? (
          <p className="eyebrow mt-4 text-muted">
            First published {year}
          </p>
        ) : null}
      </header>

      <div className="pt-10">
        <SectionHeader title="The chart" subtitle={entries.length ? "Ranked by readers" : "Empty"} />
        <div className="pt-2">
          <Soundtrack
            bookID={book.id}
            bookTitle={book.canonical_title}
            initialEntries={entries}
            signedIn={!!auth.user}
          />
        </div>
      </div>
    </article>
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
