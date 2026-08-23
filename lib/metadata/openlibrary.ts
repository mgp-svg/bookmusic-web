import type { BookMetadata, BookSearchHit } from "@/lib/types";
import { plainProse } from "@/lib/text";

/** Open Library — free, no key, and crucially exposes a *work* ID that groups editions
 *  of the same book. That work ID becomes `books.external_book_id`.
 *  Port of Services/OpenLibrary/OpenLibraryBookMetadataService.swift. */

const BASE = "https://openlibrary.org";
const REVALIDATE = 60 * 60 * 24; // metadata is effectively static

async function get<T>(path: string): Promise<T | null> {
  const res = await fetch(BASE + path, { next: { revalidate: REVALIDATE } });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Open Library ${res.status} for ${path}`);
  return (await res.json()) as T;
}

/** Open Library returns description as either a string or { type, value }. */
function text(value: unknown): string | null {
  if (typeof value === "string") return plainProse(value);
  if (value && typeof value === "object" && "value" in value) return plainProse(String((value as { value: unknown }).value));
  return null;
}

function yearFrom(s: string | undefined): number | null {
  if (!s) return null;
  const years = (s.match(/\d+/g) ?? []).map(Number).filter((n) => n >= 1000 && n <= 2100);
  return years.length ? years[years.length - 1] : null;
}

const coverById = (id: number) => `https://covers.openlibrary.org/b/id/${id}-L.jpg`;

type KeyRef = { key: string };

export async function lookupISBN(isbn13: string): Promise<BookMetadata | null> {
  type Edition = {
    title?: string;
    authors?: KeyRef[];
    works?: KeyRef[];
    publishers?: string[];
    publish_date?: string;
    covers?: number[];
    isbn_10?: string[];
    physical_format?: string;
    by_statement?: string;
    description?: unknown;
  };

  const edition = await get<Edition>(`/isbn/${isbn13}.json`);
  if (!edition) return null;

  const workKey = edition.works?.[0]?.key; // "/works/OL123W"
  let title = edition.title ?? "Untitled";
  let description = text(edition.description);
  let coverURL =
    edition.covers?.[0] != null
      ? coverById(edition.covers[0])
      : `https://covers.openlibrary.org/b/isbn/${isbn13}-L.jpg?default=false`;
  const authors: string[] = [];

  if (workKey) {
    type Work = { title?: string; description?: unknown; covers?: number[]; authors?: { author?: KeyRef }[] };
    const work = await get<Work>(`${workKey}.json`).catch(() => null);
    if (work) {
      // Work titles are curated; edition titles are often messy ("Fourth WIng", "…: A Novel").
      if (work.title) title = work.title;
      description ??= text(work.description);
      if (!edition.covers?.length && work.covers?.[0] != null) coverURL = coverById(work.covers[0]);
      for (const a of (work.authors ?? []).slice(0, 3)) {
        if (!a.author?.key) continue;
        const author = await get<{ name?: string }>(`${a.author.key}.json`).catch(() => null);
        if (author?.name) authors.push(author.name);
      }
    }
  }

  if (!authors.length) {
    for (const a of (edition.authors ?? []).slice(0, 3)) {
      const author = await get<{ name?: string }>(`${a.key}.json`).catch(() => null);
      if (author?.name) authors.push(author.name);
    }
  }
  if (!authors.length && edition.by_statement) authors.push(edition.by_statement);

  return {
    title,
    authors,
    coverURL,
    description,
    publisher: edition.publishers?.[0] ?? null,
    publicationYear: yearFrom(edition.publish_date),
    isbn13,
    isbn10: edition.isbn_10?.[0] ?? null,
    format: edition.physical_format ?? null,
    workID: workKey ? "openlibrary:" + workKey.replace("/works/", "") : null,
  };
}

export async function searchBooks(query: string): Promise<BookSearchHit[]> {
  const url = new URL(BASE + "/search.json");
  url.searchParams.set("q", query);
  url.searchParams.set("limit", "20");
  url.searchParams.set("fields", "key,title,author_name,cover_i,first_publish_year,isbn");

  const res = await fetch(url, { next: { revalidate: 60 * 60 } });
  if (!res.ok) throw new Error(`Open Library search ${res.status}`);
  const data = (await res.json()) as {
    docs: {
      key?: string;
      title?: string;
      author_name?: string[];
      cover_i?: number;
      first_publish_year?: number;
      isbn?: string[];
    }[];
  };

  return data.docs.flatMap((d) => {
    if (!d.title) return [];
    const isbn = (d.isbn ?? []).find((i) => i.length === 13 && /^97[89]/.test(i)) ?? null;
    return [
      {
        id: d.key ?? d.title,
        title: d.title,
        author: d.author_name?.[0] ?? "Unknown author",
        coverURL: d.cover_i != null ? coverById(d.cover_i) : null,
        publicationYear: d.first_publish_year ?? null,
        isbn13: isbn,
        workID: d.key ? "openlibrary:" + d.key.replace("/works/", "") : null,
      },
    ];
  });
}
