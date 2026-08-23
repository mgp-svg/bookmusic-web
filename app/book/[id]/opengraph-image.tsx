import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { createPublicClient } from "@/lib/supabase/public";

export const alt = "A book and its community soundtrack on Book Music";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Satori ships no fonts of its own, so the share card carries its own Inter cut —
 *  without these the whole thing renders in a generic single-weight fallback and the
 *  brand's heavy display type disappears. */
const fontFile = (weight: 400 | 700 | 900) =>
  readFile(join(process.cwd(), "assets", `Inter-${weight}.woff`));

/** Share card in the app's own language: bone paper, hard rules, oversized caps. */
export default async function OpenGraphImage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createPublicClient();

  const [{ data }, regular, bold, black] = await Promise.all([
    supabase
      .from("books_with_stats")
      .select("canonical_title, author, cover_url, song_count")
      .eq("id", id)
      .maybeSingle(),
    fontFile(400),
    fontFile(700),
    fontFile(900),
  ]);

  const title = ((data?.canonical_title as string) ?? "Book Music").slice(0, 70);
  const author = (data?.author as string) ?? "";
  const cover = data?.cover_url as string | null;
  const songs = (data?.song_count as number) ?? 0;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#F4F1EA",
          color: "#121212",
          padding: 64,
          fontFamily: "Inter",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "space-between" }}>
          <div style={{ display: "flex", fontSize: 22, fontWeight: 700, letterSpacing: 3 }}>BOOK MUSIC</div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                display: "flex",
                fontSize: title.length > 38 ? 60 : 84,
                fontWeight: 900,
                lineHeight: 1,
                letterSpacing: -3,
                textTransform: "uppercase",
              }}
            >
              {title}
            </div>
            <div style={{ display: "flex", marginTop: 22, fontSize: 30, fontWeight: 400 }}>{author}</div>
            <div style={{ display: "flex", marginTop: 26 }}>
              <div style={{ width: 88, height: 24, background: "#79B7E8" }} />
              <div style={{ width: 24, height: 24, background: "#EE8A3A", marginLeft: 12 }} />
            </div>
          </div>

          <div style={{ display: "flex", fontSize: 22, fontWeight: 700, letterSpacing: 2 }}>
            {songs > 0
              ? `${songs} ${songs === 1 ? "TRACK" : "TRACKS"} — VOTED BY READERS`
              : "NO TRACKS YET — ADD THE FIRST"}
          </div>
        </div>

        {cover ? (
          <img src={cover} alt="" width={330} height={495} style={{ objectFit: "cover", marginLeft: 56 }} />
        ) : null}
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Inter", data: regular, weight: 400, style: "normal" },
        { name: "Inter", data: bold, weight: 700, style: "normal" },
        { name: "Inter", data: black, weight: 900, style: "normal" },
      ],
    },
  );
}
