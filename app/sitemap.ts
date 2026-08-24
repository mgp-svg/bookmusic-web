import type { MetadataRoute } from "next";
import { createPublicClient } from "@/lib/supabase/public";

export const revalidate = 3600;

const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

/** Book pages are the reason this exists on the web: every soundtrack is an indexable page. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = ["", "/search", "/support", "/privacy"].map((path) => ({
    url: `${site}${path}`,
    changeFrequency: path === "" ? "daily" : path === "/search" ? "weekly" : "yearly",
    priority: path === "" ? 1 : path === "/search" ? 0.6 : 0.3,
  }));

  // Built at deploy time: a Supabase blip (or a missing env var on a fresh project)
  // must not fail the whole build over a file that can degrade to static routes.
  let data: { id: string; created_at: string | null }[] = [];
  try {
    const supabase = createPublicClient();
    const result = await supabase
      .from("books_with_stats")
      .select("id, created_at, song_count")
      .gt("song_count", 0)
      .order("vote_count", { ascending: false })
      .limit(5000);
    data = (result.data ?? []) as typeof data;
  } catch {
    return staticRoutes;
  }

  const books: MetadataRoute.Sitemap = data.map((book) => ({
    url: `${site}/book/${book.id}`,
    lastModified: book.created_at ? new Date(book.created_at as string) : undefined,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...books];
}
