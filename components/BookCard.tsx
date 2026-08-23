import Link from "next/link";
import type { Book } from "@/lib/types";
import { BookCover } from "./BookCover";

/** Shelf item: numbered, cover, title, author, song count. */
export function BookCard({ book, index, className = "" }: { book: Book; index?: number; className?: string }) {
  return (
    <Link
      href={`/book/${book.id}`}
      className={`group flex w-[150px] shrink-0 flex-col gap-2 sm:w-[168px] ${className}`}
    >
      {index != null ? <span className="eyebrow text-muted">{String(index + 1).padStart(2, "0")}</span> : null}
      <div className="aspect-[2/3] w-full overflow-hidden transition-opacity group-hover:opacity-80">
        <BookCover title={book.canonical_title} author={book.author} src={book.cover_url} size="md" />
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="text-[13px] font-bold leading-tight line-clamp-2">{book.canonical_title}</span>
        <span className="text-[12px] text-muted leading-tight line-clamp-1">{book.author}</span>
        {book.song_count != null ? (
          <span className="eyebrow text-muted pt-0.5">
            {book.song_count} {book.song_count === 1 ? "track" : "tracks"}
          </span>
        ) : null}
      </div>
    </Link>
  );
}

/** Horizontal shelf with edge-to-edge scroll on small screens. */
export function BookShelf({ books }: { books: Book[] }) {
  return (
    <div className="no-scrollbar -mx-5 flex gap-4 overflow-x-auto px-5 pb-1">
      {books.map((book, i) => (
        <BookCard key={book.id} book={book} index={i} />
      ))}
    </div>
  );
}
