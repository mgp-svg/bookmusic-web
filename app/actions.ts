"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { resolveHit } from "@/lib/data";
import type { BookSearchHit, MusicSearchResult, SoundtrackEntry } from "@/lib/types";

/** Mutations. Every one goes through a SECURITY DEFINER RPC, so identity is the
 *  server's `auth.uid()` and never something the client asserts. */

/** Postgres error codes the RPCs raise deliberately. */
const NOT_SIGNED_IN = "42501";
const DUPLICATE = "23505";

export type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string; needsAuth?: boolean };

/** Sets the caller's vote (1 / -1 / 0). Returns the new aggregate score. */
export async function voteAction(bookSongID: string, value: -1 | 0 | 1): Promise<ActionResult<number>> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("cast_vote", { p_book_song_id: bookSongID, p_value: value });

  if (error) {
    if (error.code === NOT_SIGNED_IN) return { ok: false, error: "Sign in to vote.", needsAuth: true };
    return { ok: false, error: "Vote didn't go through. Try again." };
  }
  return { ok: true, data: data as number };
}

/** Creates the song if needed and nominates it, auto-upvoted. */
export async function nominateAction(
  bookID: string,
  track: MusicSearchResult,
): Promise<ActionResult<SoundtrackEntry>> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("nominate_song", {
    p_book_id: bookID,
    p_title: track.title,
    p_artist: track.artist,
    p_album: track.album,
    p_artwork_url: track.artwork_url,
    p_spotify_id: track.spotify_id,
    p_spotify_url: track.spotify_url,
    p_apple_music_id: track.apple_music_id,
    p_apple_music_url: track.apple_music_url,
  });

  if (error) {
    if (error.code === NOT_SIGNED_IN) return { ok: false, error: "Sign in to add a track.", needsAuth: true };
    if (error.code === DUPLICATE || error.message.includes("duplicate key")) {
      return { ok: false, error: "That song is already on this soundtrack — go give it a vote." };
    }
    return { ok: false, error: "Couldn't add that track. Try again." };
  }

  const entry = (data as SoundtrackEntry[])?.[0];
  if (!entry) return { ok: false, error: "Couldn't add that track. Try again." };

  revalidatePath(`/book/${bookID}`);
  return { ok: true, data: entry };
}

/** Search-result → canonical book, then straight to its page. */
export async function openSearchHit(hit: BookSearchHit) {
  const book = await resolveHit(hit);
  redirect(`/book/${book.id}`);
}

// MARK: Auth

export async function signInAction(_prev: unknown, formData: FormData): Promise<{ error?: string; notice?: string }> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: String(formData.get("email") ?? "").trim(),
    password: String(formData.get("password") ?? ""),
  });
  if (error) return { error: error.message };
  redirect(String(formData.get("next") || "/profile"));
}

/** Where Supabase should send people after they click the confirmation link.
 *  Production pins this via NEXT_PUBLIC_SITE_URL; preview deployments and local dev have
 *  no such value, so fall back to the request's own origin rather than shipping someone
 *  a link to localhost. Trusting the Host header is safe here precisely because Supabase
 *  only honours redirects that are on its allow list. */
async function callbackURL(): Promise<string> {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  if (configured) return `${configured}/auth/callback`;

  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}/auth/callback`;
}

export async function signUpAction(_prev: unknown, formData: FormData): Promise<{ error?: string; notice?: string }> {
  const supabase = await createClient();
  const email = String(formData.get("email") ?? "").trim();
  const username = String(formData.get("username") ?? "")
    .trim()
    .toLowerCase();

  if (!/^[a-z0-9_]{3,30}$/.test(username)) {
    return { error: "Usernames are 3–30 characters: lowercase letters, numbers and underscores." };
  }

  // `username` lands in raw_user_meta_data; the DB trigger uses it to seed the profile row.
  const { data, error } = await supabase.auth.signUp({
    email,
    password: String(formData.get("password") ?? ""),
    options: {
      data: { username },
      emailRedirectTo: await callbackURL(),
    },
  });

  if (error) return { error: error.message };
  if (!data.session) return { notice: `Check ${email} for a confirmation link, then sign in.` };
  redirect(String(formData.get("next") || "/profile"));
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
