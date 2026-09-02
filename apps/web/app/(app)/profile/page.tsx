import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { fetchUserProfile } from "@/lib/data/users";
import { MobileStyleProfile } from "@/components/profile/mobile-style-profile";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const profile = await fetchUserProfile(supabase, user.id);
  const email = user.email ?? "";

  return <MobileStyleProfile email={email} memberSince={profile?.created_at ?? null} />;
}
