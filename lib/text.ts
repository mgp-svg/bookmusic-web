/** Book descriptions from Open Library are contributor-written Markdown, often with a
 *  source footer after a horizontal rule. We render them as plain prose, so flatten both.
 *  Applied on the way in (new lookups) and on the way out (rows cached before this existed). */
export function plainProse(raw: string): string | null {
  const body = raw
    .split(/\n\s*-{3,}\s*\n/)[0]
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]+)\]\[[^\]]*\]/g, "$1")
    .replace(/(\*\*|__)(.*?)\1/g, "$2")
    .replace(/(?<![\w*])[*_](?=\S)([^*_]+?)(?<=\S)[*_](?![\w*])/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  return body || null;
}
