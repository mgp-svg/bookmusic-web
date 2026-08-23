"use client";

import { useEffect, useState } from "react";
import type { Book } from "@/lib/types";
import { readRecents } from "@/lib/recents";
import { BookShelf } from "./BookCard";
import { SectionHeader } from "./primitives";

/** Local shelf of books this browser has opened. Renders nothing until it has some. */
export function RecentShelf() {
  const [books, setBooks] = useState<Book[]>([]);

  useEffect(() => {
    const sync = () => setBooks(readRecents());
    sync();
    window.addEventListener("bookmusic:recents", sync);
    return () => window.removeEventListener("bookmusic:recents", sync);
  }, []);

  if (!books.length) return null;

  return (
    <section className="pt-11">
      <SectionHeader title="Recently opened" subtitle={`${books.length} ${books.length === 1 ? "title" : "titles"}`} />
      <div className="pt-5">
        <BookShelf books={books} />
      </div>
    </section>
  );
}
