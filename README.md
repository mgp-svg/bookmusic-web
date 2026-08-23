# Book Music — web

The web version of Book Music: every book has a soundtrack. Next.js (App Router) on the
**same Supabase project as the iOS app**, so an account, a vote and a nomination mean the same
thing in both places.

Scanning is deliberately **app-only** — a browser on a laptop isn't pointing a camera at a book.
On the web you find a title by searching, or paste the ISBN for an exact match.

## Run it

```bash
cp .env.example .env.local   # fill in the Supabase URL + anon key (same project as iOS)
npm install
npm run dev                  # http://localhost:3000
```

## What the web adds over the app

- **Every soundtrack is a URL.** `/book/<id>` is server-rendered with real metadata and a
  generated share card (`opengraph-image.tsx`), and `sitemap.ts` lists every book that has
  tracks. This is the growth surface the App Store listing can't be.
- **`/isbn/<isbn>` resolves and redirects**, so a QR code on a shelf-talker, a link in a
  newsletter, or the iOS scanner handing off a barcode all land on the right soundtrack.
- **No install.** Someone in a bookshop can use it from a link.

## Architecture

```
app/
  page.tsx                    Home — hero, search CTA, local "recently opened", trending
  isbn/[isbn]/                Resolve an ISBN server-side, redirect to the book
  book/[id]/                  Server-rendered soundtrack + generated OG share card
  search/                     Cached books first, then Open Library + Google Books; ISBN entry
  signin/, profile/, u/[username]/
  actions.ts                  Every mutation: vote, nominate, auth
  api/music/search/           iTunes Search proxy (keeps the request off the client's origin)
lib/
  data.ts                     All reads + the ISBN/search-hit resolver (mirrors BookResolver.swift)
  supabase/                   Browser, server (cookie-bound) and public (cookie-less) clients
  metadata/                   Open Library → Google Books composite
  music/itunes.ts, isbn.ts, deeplink.ts, recents.ts, text.ts
components/                   Soundtrack (optimistic voting), AddTrackDialog, ISBNJump, covers, primitives
proxy.ts                      Refreshes the Supabase session on every request
```

- **The database is the only authority.** The browser gets the anon key; RLS plus the
  `SECURITY DEFINER` RPCs (`get_soundtrack`, `cast_vote`, `nominate_song`, `cache_book`,
  `get_profile_activity`) enforce every rule. Nothing here trusts a client-supplied user id.
- **Voting is optimistic** — the row re-sorts instantly, then reconciles with the server's score
  and reverts on failure. Same behaviour as `BookPageViewModel` on iOS.
- **Anonymous users can browse everything.** Voting and nominating bounce to
  `/signin?next=…` and come back.
- **No audio is stored or streamed.** Tapping a song opens Apple Music or Spotify — a direct
  link when we have an id, a search deep link otherwise.
- `GOOGLE_BOOKS_API_KEY` is server-only. Open Library misses many recent US editions, so the
  fallback matters in practice; the key never reaches the browser.

Book covers and song artwork come from provider hosts we don't control, so they're plain `<img>`
rather than `next/image` with a remote-host allowlist to maintain.

## Deploying

1. Push this directory to a repo and import it in Vercel (root directory `web/`).
2. Environment variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
   `GOOGLE_BOOKS_API_KEY`, and `NEXT_PUBLIC_SITE_URL` set to the live origin
   (this one value drives canonical URLs, the sitemap, OG tags and auth email links).
3. Add the domain in Vercel, then in **Supabase → Authentication → URL Configuration** add the
   site URL and `https://<domain>/auth/callback` as a redirect URL, or confirmation emails will
   bounce people to localhost.

## Keeping the two clients in step

The iOS app and this share a schema, an ISBN normalizer, an edition-matching strategy and a
visual system. When you change one, check its twin:

| Web | iOS |
|---|---|
| `app/globals.css` | `Sources/Design/Theme.swift` |
| `lib/isbn.ts` | `Sources/Support/ISBN.swift` |
| `lib/data.ts` (resolver) | `Sources/Services/BookResolver.swift` |
| `lib/metadata/*` | `Sources/Services/OpenLibrary`, `GoogleBooks` |
| `lib/deeplink.ts` | `MusicDeepLink` in `Services/Protocols/MusicSearchService.swift` |

## Not done yet

- Sign in with Apple on the web (needs a Services ID and a separate redirect; the app uses the
  native flow). Email + password works today and shares accounts with iOS.
- Rate limiting / abuse reporting on nominations — same gap as the app.
- Spotify links are search deep links unless a nomination came in with a Spotify id.
