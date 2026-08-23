import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile, getProfileActivity } from "@/lib/data";
import { signOutAction } from "@/app/actions";
import { ProfileBody } from "@/components/ProfileBody";

export const metadata: Metadata = { title: "Your profile", robots: { index: false } };

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signin?next=/profile");

  const [profile, activity] = await Promise.all([getProfile(user.id), getProfileActivity(user.id)]);

  if (!profile) {
    // The sign-up trigger seeds this row; if it's missing, something went wrong server-side.
    return (
      <div className="mx-auto max-w-md px-5 pt-12">
        <h1 className="display text-3xl">Profile missing</h1>
        <p className="mt-4 text-sm text-muted">
          Your account exists but has no profile row yet. Sign out and back in — if it persists, the sign-up
          trigger needs a look.
        </p>
        <form action={signOutAction} className="mt-6">
          <button type="submit" className="btn-secondary">
            Sign out
          </button>
        </form>
      </div>
    );
  }

  return (
    <ProfileBody profile={profile} activity={activity}>
      <form action={signOutAction}>
        <button type="submit" className="btn-secondary">
          Sign out
        </button>
      </form>
    </ProfileBody>
  );
}
