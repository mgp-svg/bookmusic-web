import type { Metadata } from "next";
import { LegalPage, Section } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "What Book Music collects, why, who it is shared with, and how to get your account deleted.",
};

const UPDATED = "24 August 2026";

export default function PrivacyPage() {
  return (
    <LegalPage title={"Privacy\npolicy"} updated={UPDATED}>
      <p>
        Book Music is a community soundtrack for books, made by one person. This policy covers the
        iPhone app and this website, which share one account and one database.
      </p>

      <Section title="What we collect">
        <p>
          <strong>If you never sign in, we collect nothing about you.</strong> Browsing books,
          reading soundtracks, searching and scanning all work signed out, and none of it is tied to
          an identity.
        </p>
        <p>When you create an account, we store:</p>
        <ul>
          <li>
            <strong>Your email address</strong>, so you can sign in and recover your account. If you
            use Sign in with Apple and choose to hide your address, we only ever see Apple&apos;s
            private relay address.
          </li>
          <li>
            <strong>Your display name and username</strong>, which are public — they appear next to
            the songs you nominate.
          </li>
          <li>
            <strong>What you nominate and how you vote</strong>, which is the app. Nominations are
            public. Individual votes are not shown to other people; only the resulting score is.
          </li>
        </ul>
        <p>
          Passwords are handled by our authentication provider and stored only as a salted hash. We
          never see your password.
        </p>
      </Section>

      <Section title="Your camera">
        <p>
          The app asks for camera access for one reason: to read the ISBN barcode on the back of a
          book. The camera feed is processed on your device and never recorded, stored or uploaded.
          No photo ever leaves your phone. You can decline camera access and type or search ISBNs
          instead.
        </p>
      </Section>

      <Section title="What we don't do">
        <ul>
          <li>No advertising, and no advertising SDKs.</li>
          <li>No third-party analytics or tracking, in the app or on this site.</li>
          <li>No tracking you across other companies&apos; apps and sites.</li>
          <li>We do not sell your data, and we do not share it for anyone else&apos;s marketing.</li>
          <li>No location, contacts, photo library, health or financial data is collected.</li>
        </ul>
      </Section>

      <Section title="Who processes it">
        <p>These services handle data on our behalf, and only to make the app work:</p>
        <ul>
          <li>
            <strong>Supabase</strong> — database, accounts and authentication. This is where your
            account and your nominations and votes live.
          </li>
          <li>
            <strong>Vercel</strong> — hosting for this website, which processes request logs
            including IP addresses for security and reliability.
          </li>
          <li>
            <strong>Apple</strong> — Sign in with Apple, and the App Store.
          </li>
        </ul>
        <p>
          When you look up a book or search for a song, we query{" "}
          <strong>Open Library</strong>, <strong>Google Books</strong>, the{" "}
          <strong>Apple Music (iTunes Search)</strong> catalogue and, where enabled,{" "}
          <strong>Spotify</strong>. Those requests carry the search terms and the usual network
          metadata — never your identity or your account. Tapping a song hands you off to Apple
          Music or Spotify, where that company&apos;s own privacy policy takes over.
        </p>
      </Section>

      <Section title="Stored on your device">
        <p>
          The app and this site remember the books you recently opened so you can get back to them.
          That list lives on your device, not on our servers. Clearing your browser storage or
          deleting the app removes it.
        </p>
      </Section>

      <Section title="Deleting your account">
        <p>
          You can delete your account yourself, at any time, from inside the app: open the{" "}
          <strong>You</strong> tab and tap <strong>Delete account</strong>. It takes effect
          immediately, and it takes your email address, your display name, your username and your
          votes with it. If you&apos;d rather not do it in the app, email{" "}
          <a href="mailto:contact@mallorygray.io">contact@mallorygray.io</a> from the address on the
          account and we will delete it within 30 days.
        </p>
        <p>
          Songs you nominated stay on the book pages they belong to, detached from your name, so the
          soundtracks other readers voted on don&apos;t fall apart. If you would rather your
          nominations were removed too, say so in the same email and we will remove them.
        </p>
      </Section>

      <Section title="Children">
        <p>
          Book Music is not directed at children under 13, and we do not knowingly collect
          information from them. If you believe a child has created an account, email us and we will
          delete it.
        </p>
      </Section>

      <Section title="Your rights">
        <p>
          Depending on where you live, you may have the right to access, correct, export or delete
          the personal data we hold about you, and to object to our processing of it. Email us and
          we will act on it. We keep account data for as long as the account exists.
        </p>
      </Section>

      <Section title="Changes">
        <p>
          If this policy changes in a way that matters, the date at the top changes with it and the
          new version is posted here before it takes effect.
        </p>
      </Section>

      <Section title="Contact">
        <p>
          Book Music is operated by Mallory Gray. Questions about privacy, or a deletion request:{" "}
          <a href="mailto:contact@mallorygray.io">contact@mallorygray.io</a>.
        </p>
      </Section>
    </LegalPage>
  );
}
