import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, Section } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Support",
  description:
    "Help with Book Music: scanning, missing books, adding songs, accounts and deletion, and how to reach a human.",
};

export default function SupportPage() {
  return (
    <LegalPage title={"Support"}>
      <p>
        Book Music is made by one person. If something is broken, wrong or missing, email{" "}
        <a href="mailto:contact@mallorygray.io">contact@mallorygray.io</a> and you&apos;ll get a real
        reply, usually within a couple of days.
      </p>

      <Section title="Scanning a book">
        <p>
          Point the camera at the barcode on the <em>back</em> of the book — the one starting 978 or
          979. Good light and a steady hand help; so does backing off a few centimetres if the
          barcode fills the frame.
        </p>
        <p>
          If the barcode is damaged, wrapped in a library sticker or simply won&apos;t catch, tap
          <strong> Type ISBN</strong> and enter the digits under the barcode, or search by title
          instead. Scanning is on the phone only — on the web, search or paste the ISBN.
        </p>
      </Section>

      <Section title="A book won't come up">
        <p>
          Book details come from Open Library and Google Books. Between them they cover most of
          what&apos;s in print, but new releases and small-press editions sometimes aren&apos;t
          listed yet, and a scan can only find what those catalogues know about.
        </p>
        <p>
          Try searching the title and author instead of scanning — that often finds a different
          edition of the same book, which is fine: every edition of a book shares one soundtrack.
          Still nothing? Send us the title and ISBN and we&apos;ll look into it.
        </p>
      </Section>

      <Section title="Adding songs and voting">
        <p>
          Open a book and tap <strong>Add a song</strong>, then search for the track. Adding it
          counts as your upvote. Use the arrows on any song to push it up or down the soundtrack —
          the order updates as votes come in.
        </p>
        <p>
          You need an account to vote or nominate, so that each person gets one vote per song.
          Browsing never requires one.
        </p>
      </Section>

      <Section title="Playing music">
        <p>
          Book Music doesn&apos;t host or stream audio. Tapping a song opens it in Apple Music or
          Spotify, where the artists get paid. If a song opens to a search rather than the track
          itself, that&apos;s because we didn&apos;t have an exact catalogue match to hand off.
        </p>
      </Section>

      <Section title="Accounts">
        <p>
          Sign in with Apple, or with an email address and password. Forgot your password? Use the
          reset link on the sign-in screen and follow the email.
        </p>
        <p>
          To delete your account, email <a href="mailto:contact@mallorygray.io">contact@mallorygray.io</a>{" "}
          from the address on the account and we&apos;ll delete it within 30 days. See the{" "}
          <Link href="/privacy">privacy policy</Link> for exactly what is removed.
        </p>
      </Section>

      <Section title="Reporting something">
        <p>
          If a nomination, username or display name is abusive, spam, or otherwise doesn&apos;t
          belong, email <a href="mailto:contact@mallorygray.io">contact@mallorygray.io</a> with a
          link to the book page and what you saw. Reports are reviewed within 24 hours, and content
          that breaks the rules is removed.
        </p>
      </Section>

      <Section title="Contact">
        <p>
          <a href="mailto:contact@mallorygray.io">contact@mallorygray.io</a> — bugs, missing books,
          takedown requests, privacy questions, or just to tell us which song belongs in which book.
        </p>
      </Section>
    </LegalPage>
  );
}
