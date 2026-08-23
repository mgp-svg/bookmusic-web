import type { Song } from "@/lib/types";

/** Book Music never stores or streams audio — tapping a song hands off to a music service.
 *  Direct link when we have an id, search deep link otherwise.
 *  Port of MusicDeepLink in Services/Protocols/MusicSearchService.swift. */

export type MusicService = "apple" | "spotify";

export const serviceName: Record<MusicService, string> = {
  apple: "Apple Music",
  spotify: "Spotify",
};

export function musicURL(song: Song, service: MusicService): string {
  const q = encodeURIComponent(`${song.title} ${song.artist}`);
  if (service === "apple") {
    return song.apple_music_url ?? `https://music.apple.com/search?term=${q}`;
  }
  return song.spotify_url ?? (song.spotify_id ? `https://open.spotify.com/track/${song.spotify_id}` : `https://open.spotify.com/search/${q}`);
}

/** True when we have a direct track link (not just a search fallback). */
export function hasDirectLink(song: Song, service: MusicService): boolean {
  return service === "apple" ? !!song.apple_music_url : !!(song.spotify_url || song.spotify_id);
}

/** Short catalog-style identifier, e.g. "BM—4F2A1C". Liner-note flavour, nothing more. */
export function catalogNumber(id: string): string {
  return "BM—" + id.replace(/-/g, "").slice(0, 6).toUpperCase();
}
