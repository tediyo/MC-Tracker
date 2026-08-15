import { LogOut } from "lucide-react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { fetchUserProfile } from "@/lib/data/users";
import { logout } from "@/lib/auth/actions";
import { ProfileHeader } from "@/components/profile/profile-header";
import { UpdateEmailForm } from "@/components/profile/update-email-form";
import { ChangePasswordForm } from "@/components/profile/change-password-form";
import { SubmitButton } from "@/components/forms/submit-button";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const profile = await fetchUserProfile(supabase, user.id);
  const email = user.email ?? "";

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <h1 className="text-2xl font-bold tracking-tight">Profile</h1>

      <ProfileHeader email={email} memberSince={profile?.created_at ?? null} />
      <UpdateEmailForm currentEmail={email} />
      <ChangePasswordForm />

      <div className="pt-2 flex justify-start">
        <form action={logout}>
          <SubmitButton
            variant="outline"
            className="text-destructive border-destructive/20 hover:bg-destructive/10 hover:border-destructive/40 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </SubmitButton>
        </form>
      </div>
    </div>
  );
}
