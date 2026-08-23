"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { normalizeISBN } from "@/lib/isbn";
import { Eyebrow } from "./primitives";

/** Exact-match entry for someone holding the book: the 13 digits under the barcode.
 *  Validated client-side so a typo doesn't cost a round trip, then handed to
 *  /isbn/<isbn>, which resolves it server-side. */
export function ISBNJump() {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const isbn = normalizeISBN(value);
    if (!isbn) {
      setError("That doesn't look like a valid ISBN — check for a typo.");
      return;
    }
    setError(null);
    router.push(`/isbn/${isbn}`);
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      <Eyebrow muted as="p">
        Or type the ISBN — the 13 digits under the barcode
      </Eyebrow>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          inputMode="numeric"
          autoComplete="off"
          placeholder="978…"
          aria-label="ISBN"
          className="field font-mono sm:flex-1"
        />
        <button type="submit" className="btn-secondary sm:w-40">
          Open
        </button>
      </div>
      {error ? <p className="text-sm font-bold text-orange">{error}</p> : null}
    </form>
  );
}
