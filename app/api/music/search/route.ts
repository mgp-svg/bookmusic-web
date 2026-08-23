import { NextResponse } from "next/server";
import { searchTracks } from "@/lib/music/itunes";

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q")?.trim();
  if (!query || query.length < 2) return NextResponse.json([]);

  try {
    return NextResponse.json(await searchTracks(query));
  } catch {
    return NextResponse.json({ error: "Music search is unavailable right now." }, { status: 502 });
  }
}
