import "server-only";
import { createClient } from "@/lib/supabase/server";
import { lookupISBN } from "@/lib/metadata";
import { normalizeISBN } from "@/lib/isbn";
import type { Book, BookMetadata, BookSearchHit, ProfileActivity, SoundtrackEntry, UserProfile } from "@/lib/types";

/** Every read the web app does. Mirrors SoundtrackRepository on iOS, against the same
 *  Supabase project — RLS and the SECURITY DEFINER RPCs are the only authority. */

export async function getBook(id: string): Promise<Book | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("books_with_stats").select().eq("id", id).maybeSingle();
  return data as Book | null;
}

export async function getBookByISBN(isbn13: string): Promise<Book | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("book_editions").select("book_id").eq("isbn_13", isbn13).maybeSingle();
  return data?.book_id ? getBook(data.book_id as string) : null;
}

export async function getBookByExternalID(externalID: string): Promise<Book | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("books_with_stats").select().eq("external_book_id", externalID).maybeSingle();
  return data as Book | null;
}

/** Caches freshly-looked-up metadata. Links to an existing book when the work already exists. */
export async function cacheBook(meta: BookMetadata): Promise<Book> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("cache_book", {
    p_title: meta.title,
    p_author: meta.authors.join(", ") || "Unknown author",
    p_cover_url: meta.coverURL,
    p_description: meta.description,
    p_publication_year: meta.publicationYear,
    p_external_book_id: meta.workID,
    p_isbn_13: meta.isbn13,
    p_isbn_10: meta.isbn10,
    p_publisher: meta.publisher,
    p_format: meta.format,
  });
  if (error) throw new Error(error.message);
  const book = await getBook(data as string);
  if (!book) throw new Error("Book was cached but could not be read back.");
  return book;
}

export async function getSoundtrack(bookID: string): Promise<SoundtrackEntry[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_soundtrack", { p_book_id: bookID });
  if (error) throw new Error(error.message);
  return (data ?? []) as SoundtrackEntry[];
}

export async function getTrending(limit = 12): Promise<Book[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("books_with_stats")
    .select()
    .gt("song_count", 0)
    .order("vote_count", { ascending: false })
    .order("song_count", { ascending: false })
    .limit(limit);
  return (data ?? []) as Book[];
}

/** Books we've already cached — shown above external results so they're one click away. */
export async function searchCachedBooks(query: string): Promise<Book[]> {
  const supabase = await createClient();
  const pattern = `%${query.replace(/%/g, "")}%`;
  const { data } = await supabase
    .from("books_with_stats")
    .select()
    .or(`canonical_title.ilike.${pattern},author.ilike.${pattern}`)
    .limit(10);
  return (data ?? []) as Book[];
}

export async function getProfile(userID: string): Promise<UserProfile | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select().eq("id", userID).maybeSingle();
  return data as UserProfile | null;
}

export async function getProfileByUsername(username: string): Promise<UserProfile | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select().eq("username", username).maybeSingle();
  return data as UserProfile | null;
}

export async function getProfileActivity(userID: string): Promise<ProfileActivity> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_profile_activity", { p_user_id: userID });
  if (error) throw new Error(error.message);
  return (data ?? { books: [], nominations: [], vote_count: 0 }) as ProfileActivity;
}

/** Turns an ISBN or a search hit into a canonical book, caching external metadata as it goes.
 *  Edition-matching strategy lives here so it can be improved in one place (see BookResolver.swift):
 *    1. Do we already have an edition with this ISBN? → its book.
 *    2. Ask the metadata provider. Does its *work* ID match a book we have? → link a new edition.
 *    3. Otherwise create a new book + edition. */
export class ResolveError extends Error {
  constructor(readonly kind: "invalid-isbn" | "not-found", readonly isbn?: string) {
    super(kind);
  }
}

export async function resolveISBN(raw: string): Promise<Book> {
  const isbn13 = normalizeISBN(raw);
  if (!isbn13) throw new ResolveError("invalid-isbn", raw);

  const cached = await getBookByISBN(isbn13);
  if (cached) return cached;

  const meta = await lookupISBN(isbn13);
  if (!meta) throw new ResolveError("not-found", isbn13);
  return cacheBook(meta);
}

export async function resolveHit(hit: BookSearchHit): Promise<Book> {
  if (hit.workID) {
    const cached = await getBookByExternalID(hit.workID);
    if (cached) return cached;
  }
  if (hit.isbn13) {
    const cached = await getBookByISBN(hit.isbn13);
    if (cached) return cached;
    const meta = await lookupISBN(hit.isbn13);
    if (meta) {
      return cacheBook({
        ...meta,
        workID: meta.workID ?? hit.workID,
        coverURL: meta.coverURL ?? hit.coverURL,
      });
    }
  }
  // No ISBN available (e.g. ebook-only): create the book from the search hit itself.
  return cacheBook({
    title: hit.title,
    authors: [hit.author],
    coverURL: hit.coverURL,
    description: null,
    publisher: null,
    publicationYear: hit.publicationYear,
    isbn13: hit.isbn13,
    isbn10: null,
    format: null,
    workID: hit.workID,
  });
}
