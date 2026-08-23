import type { BookMetadata, BookSearchHit } from "@/lib/types";
import * as openLibrary from "./openlibrary";
import * as googleBooks from "./googlebooks";

/** Open Library first (it has work IDs, which is how editions get grouped onto one
 *  soundtrack), Google Books as the fallback. Mirrors CompositeBookMetadataService. */

export async function lookupISBN(isbn13: string): Promise<BookMetadata | null> {
  const primary = await openLibrary.lookupISBN(isbn13).catch(() => null);
  if (primary) return primary;
  return googleBooks.lookupISBN(isbn13).catch(() => null);
}

export async function searchBooks(query: string): Promise<BookSearchHit[]> {
  const [ol, gb] = await Promise.all([
    openLibrary.searchBooks(query).catch(() => [] as BookSearchHit[]),
    googleBooks.searchBooks(query).catch(() => [] as BookSearchHit[]),
  ]);

  // Interleave, then drop near-duplicate titles so one work doesn't fill the page.
  const merged: BookSearchHit[] = [];
  for (let i = 0; i < Math.max(ol.length, gb.length); i++) {
    if (ol[i]) merged.push(ol[i]);
    if (gb[i]) merged.push(gb[i]);
  }

  const seen = new Set<string>();
  return merged.filter((hit) => {
    const key = `${hit.title.toLowerCase().replace(/[^a-z0-9]/g, "")}|${hit.author.toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
