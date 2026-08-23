import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProfileActivity, getProfileByUsername } from "@/lib/data";
import { ProfileBody } from "@/components/ProfileBody";

type Params = { params: Promise<{ username: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { username } = await params;
  const profile = await getProfileByUsername(username).catch(() => null);
  if (!profile) return { title: "Reader not found" };

  const name = profile.display_name || profile.username;
  return {
    title: `${name} — nominations`,
    description: `Songs ${name} put to the books they've read on Book Music.`,
    alternates: { canonical: `/u/${profile.username}` },
  };
}

export default async function PublicProfilePage({ params }: Params) {
  const { username } = await params;
  const profile = await getProfileByUsername(username);
  if (!profile) notFound();

  const activity = await getProfileActivity(profile.id);
  return <ProfileBody profile={profile} activity={activity} />;
}
