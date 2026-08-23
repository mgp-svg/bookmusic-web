import type { MusicSearchResult } from "@/lib/types";

/** Apple's iTunes Search API: no key required, returns artwork and a music.apple.com link.
 *  Port of Services/Music/AppleMusicSearchService.swift. */
export async function searchTracks(query: string): Promise<MusicSearchResult[]> {
  const url = new URL("https://itunes.apple.com/search");
  url.searchParams.set("term", query);
  url.searchParams.set("media", "music");
  url.searchParams.set("entity", "song");
  url.searchParams.set("limit", "25");

  const res = await fetch(url, { next: { revalidate: 60 * 60 } });
  if (!res.ok) throw new Error(`iTunes Search ${res.status}`);
  const data = (await res.json()) as {
    results: {
      trackId?: number;
      trackName?: string;
      artistName?: string;
      collectionName?: string;
      artworkUrl100?: string;
      trackViewUrl?: string;
    }[];
  };

  return data.results.flatMap((r) => {
    if (!r.trackId || !r.trackName || !r.artistName) return [];
    return [
      {
        id: `apple:${r.trackId}`,
        title: r.trackName,
        artist: r.artistName,
        album: r.collectionName ?? null,
        artwork_url: r.artworkUrl100?.replace("100x100", "600x600") ?? null,
        spotify_id: null,
        spotify_url: null,
        apple_music_id: String(r.trackId),
        apple_music_url: r.trackViewUrl ?? null,
      },
    ];
  });
}
