import type { Book } from "@/lib/types";

/** Recently opened books, kept in localStorage so the shelf works signed out.
 *  Port of Support/RecentBooksStore.swift. */

const KEY = "bookmusic.recents.v1";
const LIMIT = 12;

export function readRecents(): Book[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Book[]) : [];
  } catch {
    return [];
  }
}

export function recordRecent(book: Book) {
  if (typeof window === "undefined") return;
  try {
    const next = [book, ...readRecents().filter((b) => b.id !== book.id)].slice(0, LIMIT);
    window.localStorage.setItem(KEY, JSON.stringify(next));
    window.dispatchEvent(new Event("bookmusic:recents"));
  } catch {
    // Private-mode Safari and friends — the shelf is a nicety, not a requirement.
  }
}
