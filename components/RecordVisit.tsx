"use client";

import { useEffect } from "react";
import type { Book } from "@/lib/types";
import { recordRecent } from "@/lib/recents";

/** Writes the book into the local "recently opened" shelf. Client-only, localStorage,
 *  no account required — the same idea as RecentBooksStore on iOS. */
export function RecordVisit({ book }: { book: Book }) {
  useEffect(() => {
    recordRecent(book);
  }, [book]);
  return null;
}
