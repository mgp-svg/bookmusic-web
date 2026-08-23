"use client";

import { useCallback, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { SoundtrackEntry } from "@/lib/types";
import { hasDirectLink, musicURL } from "@/lib/deeplink";
import { nominateAction, voteAction } from "@/app/actions";
import { AddTrackDialog } from "./AddTrackDialog";
import { Rule } from "./primitives";

/** The community soundtrack: ranked rows, optimistic voting, add-a-track.
 *  Voting mirrors BookPageViewModel — the row re-sorts instantly, then reconciles with
 *  the server's score (and reverts on failure). */
export function Soundtrack({
  bookID,
  bookTitle,
  initialEntries,
  signedIn,
}: {
  bookID: string;
  bookTitle: string;
  initialEntries: SoundtrackEntry[];
  signedIn: boolean;
}) {
  const [entries, setEntries] = useState(initialEntries);
  const [toast, setToast] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [, startTransition] = useTransition();
  const router = useRouter();
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const say = useCallback((message: string) => {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 4000);
  }, []);

  const ranked = useMemo(
    () =>
      [...entries].sort((a, b) =>
        b.score !== a.score ? b.score - a.score : a.created_at.localeCompare(b.created_at),
      ),
    [entries],
  );

  const vote = useCallback(
    (entry: SoundtrackEntry, next: 1 | -1) => {
      if (!signedIn) {
        router.push(`/signin?next=/book/${bookID}`);
        return;
      }
      const old = entry.my_vote ?? 0;
      // Tapping your existing vote clears it.
      const value: -1 | 0 | 1 = old === next ? 0 : next;

      setEntries((current) =>
        current.map((e) =>
          e.book_song_id !== entry.book_song_id
            ? e
            : {
                ...e,
                my_vote: value === 0 ? null : value,
                score: e.score + value - old,
                upvotes: e.upvotes + (value === 1 ? 1 : 0) - (old === 1 ? 1 : 0),
                downvotes: e.downvotes + (value === -1 ? 1 : 0) - (old === -1 ? 1 : 0),
              },
        ),
      );

      startTransition(async () => {
        const result = await voteAction(entry.book_song_id, value);
        if (result.ok) {
          setEntries((current) =>
            current.map((e) => (e.book_song_id === entry.book_song_id ? { ...e, score: result.data } : e)),
          );
          return;
        }
        // Revert to exactly what the row looked like before the tap.
        setEntries((current) => current.map((e) => (e.book_song_id === entry.book_song_id ? entry : e)));
        say(result.error);
        if (result.needsAuth) router.push(`/signin?next=/book/${bookID}`);
      });
    },
    [bookID, router, say, signedIn],
  );

  const openAdd = useCallback(() => {
    if (!signedIn) {
      router.push(`/signin?next=/book/${bookID}`);
      return;
    }
    setIsAdding(true);
  }, [bookID, router, signedIn]);

  const add = useCallback(
    async (track: Parameters<typeof nominateAction>[1]) => {
      const result = await nominateAction(bookID, track);
      if (!result.ok) {
        if (result.needsAuth) router.push(`/signin?next=/book/${bookID}`);
        return result.error;
      }
      setEntries((current) => [...current.filter((e) => e.book_song_id !== result.data.book_song_id), result.data]);
      setIsAdding(false);
      say("Added to the soundtrack");
      return null;
    },
    [bookID, router, say],
  );

  return (
    <section aria-label="Soundtrack">
      {ranked.length === 0 ? (
        <div className="border border-rule-soft px-5 py-12 text-center">
          <p className="display text-[clamp(1.6rem,5vw,2.4rem)]">No tracks yet</p>
          <p className="mx-auto mt-3 max-w-sm text-sm text-muted">
            This soundtrack is empty. Add the first song and it starts the chart.
          </p>
          <button type="button" onClick={openAdd} className="btn-primary mt-6 sm:mx-auto sm:w-auto sm:px-10">
            Add the first track
          </button>
        </div>
      ) : (
        <>
          <ol className="flex flex-col">
            {ranked.map((entry, i) => (
              <li key={entry.book_song_id}>
                {i > 0 ? <div className="rule-soft" /> : null}
                <TrackRow entry={entry} index={i} onVote={vote} />
              </li>
            ))}
          </ol>
          <Rule className="mt-0" />
          <button type="button" onClick={openAdd} className="btn-secondary mt-6">
            Add a track
          </button>
        </>
      )}

      {isAdding ? (
        <AddTrackDialog
          bookTitle={bookTitle}
          existing={entries.map((e) => `${e.song.title.toLowerCase()}|${e.song.artist.toLowerCase()}`)}
          onClose={() => setIsAdding(false)}
          onAdd={add}
        />
      ) : null}

      {toast ? (
        <div
          role="status"
          className="rise fixed inset-x-4 bottom-6 z-50 mx-auto max-w-sm bg-ink px-4 py-3 text-center text-sm font-bold text-paper sm:bottom-8"
        >
          {toast}
        </div>
      ) : null}
    </section>
  );
}

function TrackRow({
  entry,
  index,
  onVote,
}: {
  entry: SoundtrackEntry;
  index: number;
  onVote: (entry: SoundtrackEntry, value: 1 | -1) => void;
}) {
  const { song } = entry;
  const apple = musicURL(song, "apple");
  const spotify = musicURL(song, "spotify");

  return (
    <div className="flex items-center gap-3 py-3.5 sm:gap-4">
      <span className="eyebrow w-6 shrink-0 text-muted tabular-nums">{String(index + 1).padStart(2, "0")}</span>

      <div className="h-14 w-14 shrink-0 overflow-hidden bg-elevated sm:h-16 sm:w-16">
        {song.artwork_url ? (
          <img
            src={song.artwork_url}
            alt=""
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
          />
        ) : null}
      </div>

      <div className="min-w-0 flex-1">
        <a
          href={apple}
          target="_blank"
          rel="noreferrer"
          className="block truncate text-[15px] font-bold leading-tight hover:text-orange"
        >
          {song.title}
        </a>
        <p className="truncate text-[13px] text-muted">{song.artist}</p>
        <p className="mt-1 flex items-center gap-2.5 text-[11px] text-muted">
          <a href={apple} target="_blank" rel="noreferrer" className="hover:text-ink">
            {hasDirectLink(song, "apple") ? "Apple Music" : "Find on Apple"}
          </a>
          <span aria-hidden>·</span>
          <a href={spotify} target="_blank" rel="noreferrer" className="hover:text-ink">
            {hasDirectLink(song, "spotify") ? "Spotify" : "Find on Spotify"}
          </a>
          {entry.nominated_by_username ? (
            <>
              <span aria-hidden className="hidden sm:inline">
                ·
              </span>
              <Link
                href={`/u/${entry.nominated_by_username}`}
                className="hidden truncate hover:text-ink sm:inline"
              >
                @{entry.nominated_by_username}
              </Link>
            </>
          ) : null}
        </p>
      </div>

      <div className="flex shrink-0 flex-col items-center gap-0.5">
        <VoteButton
          direction="up"
          active={entry.my_vote === 1}
          label={`Upvote ${song.title}`}
          onClick={() => onVote(entry, 1)}
        />
        <span className="min-w-[2ch] text-center text-sm font-black tabular-nums">{entry.score}</span>
        <VoteButton
          direction="down"
          active={entry.my_vote === -1}
          label={`Downvote ${song.title}`}
          onClick={() => onVote(entry, -1)}
        />
      </div>
    </div>
  );
}

function VoteButton({
  direction,
  active,
  label,
  onClick,
}: {
  direction: "up" | "down";
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      className={`flex h-7 w-9 items-center justify-center transition-colors ${
        active ? (direction === "up" ? "text-blue" : "text-orange") : "text-muted hover:text-ink"
      }`}
    >
      <svg width="16" height="10" viewBox="0 0 16 10" aria-hidden className={direction === "down" ? "rotate-180" : ""}>
        <path d="M8 0 16 10H0Z" fill="currentColor" />
      </svg>
    </button>
  );
}
