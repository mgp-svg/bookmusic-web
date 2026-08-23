import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AuthForm } from "@/components/AuthForm";
import { AccentMark, Eyebrow } from "@/components/primitives";

export const metadata: Metadata = { title: "Sign in", robots: { index: false } };

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const raw = (await searchParams).next;
  // Only ever bounce back to a path on this site.
  const next = raw?.startsWith("/") && !raw.startsWith("//") ? raw : "/profile";

  if (user) redirect(next);

  return (
    <div className="mx-auto max-w-md px-5 pt-8 pb-10">
      <Eyebrow>Account</Eyebrow>
      <h1 className="display mt-4 text-[clamp(2rem,8vw,3rem)]">Sign in to vote</h1>
      <AccentMark className="mt-5" />
      <p className="mt-5 text-sm leading-relaxed text-muted">
        Reading and browsing need no account. Voting and adding tracks do — one vote per person, per song.
        If you already use the Book Music app, sign in with the same email.
      </p>
      <div className="mt-9">
        <AuthForm next={next} />
      </div>
    </div>
  );
}
