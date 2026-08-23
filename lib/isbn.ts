/** Port of BookMusic/Sources/Support/ISBN.swift. */

/** Normalizes a typed/scanned string into ISBN-13 if valid, else null.
 *  Accepts ISBN-10 (converted) and ISBN-13 / EAN-13 in the 978/979 range. */
export function normalizeISBN(raw: string): string | null {
  const cleaned = raw.toUpperCase().replace(/[^0-9X]/g, "");
  if (cleaned.length === 13) {
    if (!/^97[89]/.test(cleaned) || !isValid13(cleaned)) return null;
    return cleaned;
  }
  if (cleaned.length === 10) {
    if (!isValid10(cleaned)) return null;
    return convert10to13(cleaned);
  }
  return null;
}

export function isValid13(s: string): boolean {
  if (!/^\d{13}$/.test(s)) return false;
  const sum = [...s].reduce((acc, c, i) => acc + Number(c) * (i % 2 === 0 ? 1 : 3), 0);
  return sum % 10 === 0;
}

export function isValid10(s: string): boolean {
  if (!/^\d{9}[\dX]$/.test(s)) return false;
  const sum = [...s].reduce((acc, c, i) => acc + (c === "X" ? 10 : Number(c)) * (10 - i), 0);
  return sum % 11 === 0;
}

export function convert10to13(s: string): string {
  const core = "978" + s.slice(0, 9);
  const sum = [...core].reduce((acc, c, i) => acc + Number(c) * (i % 2 === 0 ? 1 : 3), 0);
  return core + String((10 - (sum % 10)) % 10);
}
