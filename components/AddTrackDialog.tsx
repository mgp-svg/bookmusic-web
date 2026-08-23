"use client";

import { useEffect, useRef, useState } from "react";
import type { MusicSearchResult } from "@/lib/types";
import { Eyebrow, Rule } from "./primitives";

/** Search Apple's catalogue and nominate a track. Songs are metadata only —
 *  Book Music never stores or streams audio. */
export function AddTrackDialog({
  bookTitle,
  existing,
  onClose,
  onAdd,
}: {
  bookTitle: string;
  /** "title|artist" keys already on the soundtrack, lowercased. */
  existing: string[];
  onClose: () => void;
  onAdd: (track: MusicSearchResult) => Promise<string | null>;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MusicSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [pendingID, setPendingID] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  useEffect(() => {
    const term = query.trim();
    const controller = new AbortController();

    // Debounced: everything, including clearing, happens off the effect body so a
    // keystroke can't cascade renders.
    const timer = setTimeout(async () => {
      if (term.length < 2) {
        setResults([]);
        setIsSearching(false);
        return;
      }
      setIsSearching(true);
      try {
        const res = await fetch(`/api/music/search?q=${encodeURIComponent(term)}`, { signal: controller.signal });
        setResults(res.ok ? await res.json() : []);
        setIsSearching(false);
      } catch {
        // Aborted by the next keystroke, or offline — the empty state covers both.
        if (!controller.signal.aborted) setIsSearching(false);
      }
    }, 280);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [query]);

  async function add(track: MusicSearchResult) {
    setPendingID(track.id);
    setError(null);
    const message = await onAdd(track);
    setPendingID(null);
    if (message) setError(message);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Add a track to ${bookTitle}`}
        onClick={(e) => e.stopPropagation()}
        className="rise flex max-h-[88vh] w-full max-w-lg flex-col bg-paper"
      >
        <div className="flex items-baseline justify-between px-5 pt-4 pb-3">
          <Eyebrow>Add a track</Eyebrow>
          <button type="button" onClick={onClose} className="eyebrow text-muted hover:text-ink">
            Close
          </button>
        </div>
        <div className="px-5">
          <Rule />
        </div>

        <div className="px-5 pt-4">
          <p className="display text-[clamp(1.3rem,4.5vw,1.75rem)]">{bookTitle}</p>
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Song or artist"
            aria-label="Search for a song"
            className="field mt-4"
          />
          {error ? <p className="mt-3 text-sm font-bold text-orange">{error}</p> : null}
        </div>

        <div className="mt-3 flex-1 overflow-y-auto px-5 pb-5">
          {isSearching && results.length === 0 ? (
            <ul className="flex flex-col gap-3 pt-2">
              {[0, 1, 2, 3].map((i) => (
                <li key={i} className="flex items-center gap-3">
                  <div className="shimmer h-12 w-12" />
                  <div className="flex-1">
                    <div className="shimmer h-3 w-2/3" />
                    <div className="shimmer mt-2 h-3 w-1/3" />
                  </div>
                </li>
              ))}
            </ul>
          ) : results.length > 0 ? (
            <ul className="flex flex-col">
              {results.map((track, i) => {
                const already = existing.includes(`${track.title.toLowerCase()}|${track.artist.toLowerCase()}`);
                return (
                  <li key={track.id}>
                    {i > 0 ? <div className="rule-soft" /> : null}
                    <button
                      type="button"
                      disabled={already || pendingID != null}
                      onClick={() => add(track)}
                      className="flex w-full items-center gap-3 py-2.5 text-left disabled:opacity-45"
                    >
                      <div className="h-12 w-12 shrink-0 overflow-hidden bg-elevated">
                        {track.artwork_url ? (
                          <img src={track.artwork_url} alt="" loading="lazy" className="h-full w-full object-cover" />
                        ) : null}
                      </div>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[14px] font-bold leading-tight">{track.title}</span>
                        <span className="block truncate text-[12px] text-muted">{track.artist}</span>
                      </span>
                      <span className="eyebrow shrink-0 text-muted">
                        {already ? "On it" : pendingID === track.id ? "Adding…" : "Add"}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : query.trim().length >= 2 && !isSearching ? (
            <p className="py-8 text-center text-sm text-muted">Nothing matched “{query.trim()}”.</p>
          ) : (
            <p className="py-8 text-center text-sm text-muted">
              Search Apple’s catalogue, then pick the track that belongs to this book.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
