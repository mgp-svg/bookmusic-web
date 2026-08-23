/** Mirrors BookMusic/Sources/Models — same shapes, snake_case as they come off Supabase. */

export type Book = {
  id: string;
  canonical_title: string;
  author: string;
  cover_url: string | null;
  description: string | null;
  publication_year: number | null;
  external_book_id: string | null;
  created_at?: string;
  // Present when loaded through the `books_with_stats` view.
  song_count?: number;
  vote_count?: number;
  contributor_count?: number;
};

export type Song = {
  id: string;
  title: string;
  artist: string;
  album: string | null;
  artwork_url: string | null;
  spotify_id: string | null;
  spotify_url: string | null;
  apple_music_id: string | null;
  apple_music_url: string | null;
  created_at?: string;
};

/** One row of a book's community soundtrack — the `get_soundtrack` RPC row. */
export type SoundtrackEntry = {
  book_song_id: string;
  book_id: string;
  song: Song;
  nominated_by: string | null;
  nominated_by_username: string | null;
  score: number;
  upvotes: number;
  downvotes: number;
  /** 1, -1, or null when the viewer hasn't voted (or isn't signed in). */
  my_vote: number | null;
  created_at: string;
};

export type UserProfile = {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at?: string;
};

export type ProfileActivity = {
  books: Book[];
  nominations: { book_song_id: string; book: Book; song: Song; score: number }[];
  vote_count: number;
};

/** A track from a music search provider, before it's saved. */
export type MusicSearchResult = {
  id: string;
  title: string;
  artist: string;
  album: string | null;
  artwork_url: string | null;
  spotify_id: string | null;
  spotify_url: string | null;
  apple_music_id: string | null;
  apple_music_url: string | null;
};

/** External book metadata, before it's cached via the `cache_book` RPC. */
export type BookMetadata = {
  title: string;
  authors: string[];
  coverURL: string | null;
  description: string | null;
  publisher: string | null;
  publicationYear: number | null;
  isbn13: string | null;
  isbn10: string | null;
  format: string | null;
  workID: string | null;
};

export type BookSearchHit = {
  id: string;
  title: string;
  author: string;
  coverURL: string | null;
  publicationYear: number | null;
  isbn13: string | null;
  workID: string | null;
};
