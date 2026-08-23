import Link from "next/link";
import { getTrending } from "@/lib/data";
import { BookShelf } from "@/components/BookCard";
import { RecentShelf } from "@/components/RecentShelf";
import { AccentMark, Eyebrow, Rule, SectionHeader } from "@/components/primitives";

export const revalidate = 60;

export default async function HomePage() {
  const trending = await getTrending(12).catch(() => []);

  return (
    <div className="mx-auto max-w-5xl px-5">
      <section className="pt-8 pb-7">
        <h1 className="display text-[clamp(3rem,13vw,7rem)]">
          What are
          <br />
          you
          <br />
          reading?
        </h1>
        <AccentMark className="mt-6" />
        <p className="mt-6 max-w-lg text-[15px] leading-relaxed text-muted">
          Every book has a soundtrack. Find the one you&apos;re reading, hear what other readers put to it,
          and vote on the songs that belong.
        </p>
      </section>

      <Link
        href="/search"
        className="-mx-5 flex items-center gap-4 bg-ink px-5 py-6 text-paper transition-opacity hover:opacity-85 sm:mx-0"
      >
        <span className="display text-[clamp(1.25rem,5vw,1.6rem)]">Search books</span>
        <span className="ml-auto flex items-center gap-3">
          <SearchGlyph />
          <span className="text-xl font-black text-orange" aria-hidden>
            →
          </span>
        </span>
      </Link>

      <RecentShelf />

      <section className="pt-11">
        <SectionHeader
          title="Trending"
          subtitle={trending.length ? "Most voted this week" : "Nothing charted yet"}
        />
        <div className="pt-5">
          {trending.length ? (
            <BookShelf books={trending} />
          ) : (
            <p className="text-sm text-muted">
              No soundtracks have been voted on yet. Find a book and start the first chart.
            </p>
          )}
        </div>
      </section>

      <section className="pt-14">
        <Rule />
        <ol className="grid gap-8 pt-7 sm:grid-cols-3 sm:gap-6">
          {[
            { n: "01", title: "Find", body: "Search any book by title or author — or paste the ISBN for an exact match." },
            { n: "02", title: "Listen", body: "Land on that book's page and see the songs readers ranked for it." },
            { n: "03", title: "Vote", body: "Push the right songs up, add the one that's missing. No audio, just links out." },
          ].map((step) => (
            <li key={step.n} className="flex flex-col gap-2">
              <Eyebrow muted>{step.n}</Eyebrow>
              <h3 className="display text-[1.6rem]">{step.title}</h3>
              <p className="text-sm leading-relaxed text-muted">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

function SearchGlyph() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden fill="none">
      <circle cx="10.5" cy="10.5" r="7" stroke="currentColor" strokeWidth="2" />
      <path d="m16 16 6 6" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}
