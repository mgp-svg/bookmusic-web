import type { BookMetadata, BookSearchHit } from "@/lib/types";
import { plainProse } from "@/lib/text";

/** Google Books — fallback for the many recent US editions Open Library is missing.
 *  Key is server-only (GOOGLE_BOOKS_API_KEY); it is never shipped to the browser.
 *  Port of Services/GoogleBooks/GoogleBooksMetadataService.swift. */

const BASE = "https://www.googleapis.com/books/v1/volumes";

type Volume = {
  id: string;
  volumeInfo?: {
    title?: string;
    subtitle?: string;
    authors?: string[];
    publisher?: string;
    publishedDate?: string;
    description?: string;
    printType?: string;
    imageLinks?: { thumbnail?: string; smallThumbnail?: string };
    industryIdentifiers?: { type: string; identifier: string }[];
  };
};

function url(params: Record<string, string>) {
  const u = new URL(BASE);
  Object.entries(params).forEach(([k, v]) => u.searchParams.set(k, v));
  const key = process.env.GOOGLE_BOOKS_API_KEY;
  if (key) u.searchParams.set("key", key);
  return u;
}

/** Google's thumbnails come back small, http, and with page-curl edges. */
function cover(v: Volume): string | null {
  const raw = v.volumeInfo?.imageLinks?.thumbnail ?? v.volumeInfo?.imageLinks?.smallThumbnail;
  if (!raw) return null;
  return raw.replace(/^http:/, "https:").replace("&edge=curl", "") + "&zoom=2";
}

const yearOf = (s?: string) => {
  const m = s?.match(/\d{4}/);
  return m ? Number(m[0]) : null;
};

const isbnOf = (v: Volume, type: "ISBN_13" | "ISBN_10") =>
  v.volumeInfo?.industryIdentifiers?.find((i) => i.type === type)?.identifier ?? null;

async function volumes(params: Record<string, string>): Promise<Volume[]> {
  const res = await fetch(url(params), { next: { revalidate: 60 * 60 * 24 } });
  if (!res.ok) throw new Error(`Google Books ${res.status}`);
  const data = (await res.json()) as { items?: Volume[] };
  return data.items ?? [];
}

export async function lookupISBN(isbn13: string): Promise<BookMetadata | null> {
  const [v] = await volumes({ q: `isbn:${isbn13}`, maxResults: "1" });
  const info = v?.volumeInfo;
  if (!info?.title) return null;

  return {
    title: [info.title, info.subtitle].filter(Boolean).join(": "),
    authors: info.authors ?? [],
    coverURL: cover(v),
    description: info.description ? plainProse(info.description.replace(/<[^>]+>/g, " ")) : null,
    publisher: info.publisher ?? null,
    publicationYear: yearOf(info.publishedDate),
    isbn13,
    isbn10: isbnOf(v, "ISBN_10"),
    format: info.printType ?? null,
    // Google has no work-level id; volume ids are per-edition, so editions can't be grouped by it.
    workID: null,
  };
}

export async function searchBooks(query: string): Promise<BookSearchHit[]> {
  const items = await volumes({ q: query, maxResults: "20", printType: "books" });
  return items.flatMap((v) => {
    const info = v.volumeInfo;
    if (!info?.title) return [];
    return [
      {
        id: `google:${v.id}`,
        title: info.title,
        author: info.authors?.[0] ?? "Unknown author",
        coverURL: cover(v),
        publicationYear: yearOf(info.publishedDate),
        isbn13: isbnOf(v, "ISBN_13"),
        workID: null,
      },
    ];
  });
}
