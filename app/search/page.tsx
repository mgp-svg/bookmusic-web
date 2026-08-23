import type { Metadata } from "next";
import Link from "next/link";
import { searchBooks } from "@/lib/metadata";
import { searchCachedBooks } from "@/lib/data";
import { openSearchHit } from "@/app/actions";
import { BookCover } from "@/components/BookCover";
import { ISBNJump } from "@/components/ISBNJump";
import { AccentMark, Eyebrow, SectionHeader } from "@/components/primitives";
import type { BookSearchHit } from "@/lib/types";

export const metadata: Metadata = {
  title: "Search books",
  description: "Find a book by title or author and open its community soundtrack.",
};

type Props = { searchParams: Promise<{ q?: string }> };

export default async function SearchPage({ searchParams }: Props) {
  const query = (await searchParams).q?.trim() ?? "";

  const [cached, hits] = query
    ? await Promise.all([
        searchCachedBooks(query).catch(() => []),
        searchBooks(query).catch(() => [] as BookSearchHit[]),
      ])
    : [[], []];

  // Anything already in Book Music is shown first; drop it from the external list.
  const cachedKeys = new Set(cached.map((b) => b.canonical_title.toLowerCase().replace(/[^a-z0-9]/g, "")));
  const external = hits.filter((h) => !cachedKeys.has(h.title.toLowerCase().replace(/[^a-z0-9]/g, "")));

  return (
    <div className="mx-auto max-w-3xl px-5 pt-7">
      <Eyebrow>Search</Eyebrow>
      <h1 className="display mt-4 text-[clamp(2.2rem,9vw,3.5rem)]">Find the book</h1>
      <AccentMark className="mt-5" />

      <form action="/search" className="mt-7 flex flex-col gap-3 sm:flex-row">
        <input
          name="q"
          type="search"
          defaultValue={query}
          placeholder="Title or author"
          aria-label="Title or author"
          autoFocus
          className="field sm:flex-1"
        />
        <button type="submit" className="btn-primary sm:w-36">
          Search
        </button>
      </form>

      <div className="mt-7">
        <ISBNJump />
      </div>

      {!query ? null : (
        <div className="mt-11 flex flex-col gap-11">
          {cached.length ? (
            <section>
              <SectionHeader title="Already on Book Music" subtitle={`${cached.length}`} />
              <ul className="pt-2">
                {cached.map((book, i) => (
                  <li key={book.id}>
                    {i > 0 ? <div className="rule-soft" /> : null}
                    <Link href={`/book/${book.id}`} className="flex items-center gap-4 py-3 hover:opacity-75">
                      <div className="h-[72px] w-12 shrink-0 overflow-hidden">
                        <BookCover title={book.canonical_title} author={book.author} src={book.cover_url} size="sm" />
                      </div>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[15px] font-bold">{book.canonical_title}</span>
                        <span className="block truncate text-[13px] text-muted">{book.author}</span>
                        <span className="eyebrow mt-1 block text-muted">
                          {book.song_count ?? 0} {book.song_count === 1 ? "track" : "tracks"}
                        </span>
                      </span>
                      <span className="eyebrow shrink-0 text-muted">Open →</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <section>
            <SectionHeader
              title={cached.length ? "Everywhere else" : "Results"}
              subtitle={external.length ? `${external.length}` : "None"}
            />
            {external.length ? (
              <ul className="pt-2">
                {external.map((hit, i) => (
                  <li key={hit.id}>
                    {i > 0 ? <div className="rule-soft" /> : null}
                    <form action={openSearchHit.bind(null, hit)}>
                      <button type="submit" className="flex w-full items-center gap-4 py-3 text-left hover:opacity-75">
                        <span className="block h-[72px] w-12 shrink-0 overflow-hidden">
                          <BookCover title={hit.title} author={hit.author} src={hit.coverURL} size="sm" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[15px] font-bold">{hit.title}</span>
                          <span className="block truncate text-[13px] text-muted">{hit.author}</span>
                          {hit.publicationYear ? (
                            <span className="eyebrow mt-1 block text-muted">{hit.publicationYear}</span>
                          ) : null}
                        </span>
                        <span className="eyebrow shrink-0 text-muted">Open →</span>
                      </button>
                    </form>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="pt-5 text-sm text-muted">
                Nothing matched “{query}”. Check the spelling, or use the ISBN above for an exact match.
              </p>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
