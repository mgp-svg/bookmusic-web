import Link from "next/link";
import { redirect } from "next/navigation";
import { ResolveError, resolveISBN } from "@/lib/data";
import { AccentMark, Eyebrow } from "@/components/primitives";

/** Shareable exact-match entry point: /isbn/9780593538050 → that book's soundtrack.
 *  Also where the iOS app's scanner can hand a barcode off to the web.
 *  Resolution (edition lookup → metadata provider → cache_book) happens server-side. */

type Params = { params: Promise<{ isbn: string }> };

export const metadata = { robots: { index: false } };

export default async function ISBNPage({ params }: Params) {
  const { isbn } = await params;

  let bookID: string | null = null;
  let failure: "invalid-isbn" | "not-found" | "error" | null = null;

  try {
    bookID = (await resolveISBN(isbn)).id;
  } catch (error) {
    failure = error instanceof ResolveError ? error.kind : "error";
  }

  if (bookID) redirect(`/book/${bookID}`);

  const copy = {
    "invalid-isbn": {
      title: "Not a book barcode",
      body: "That barcode doesn't look like a book ISBN. Book ISBNs are 13 digits starting 978 or 979.",
    },
    "not-found": {
      title: "No record of it",
      body: `We couldn't find a book for ISBN ${isbn} in Open Library or Google Books. Try searching by title instead — you can still start its soundtrack.`,
    },
    error: {
      title: "Something went wrong",
      body: "We couldn't look that ISBN up just now. Try again in a moment.",
    },
  }[failure ?? "error"];

  return (
    <div className="mx-auto max-w-2xl px-5 pt-12">
      <Eyebrow muted>ISBN {isbn}</Eyebrow>
      <h1 className="display mt-4 text-[clamp(2.2rem,8vw,3.5rem)]">{copy.title}</h1>
      <AccentMark className="mt-5" />
      <p className="mt-5 max-w-md text-sm leading-relaxed text-muted">{copy.body}</p>
      <div className="mt-7 flex max-w-md flex-col gap-3 sm:flex-row">
        <Link href="/search" className="btn-primary">
          Search by title
        </Link>
        <Link href="/" className="btn-secondary">
          Back to the front
        </Link>
      </div>
    </div>
  );
}
