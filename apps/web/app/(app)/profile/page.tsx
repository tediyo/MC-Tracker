import { LogOut } from "lucide-react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { fetchUserProfile } from "@/lib/data/users";
import { logout } from "@/lib/auth/actions";
import { ProfileHeader } from "@/components/profile/profile-header";
import { UpdateEmailForm } from "@/components/profile/update-email-form";
import { ChangePasswordForm } from "@/components/profile/change-password-form";
import { SettingsPreferencesSection } from "@/components/profile/settings-preferences-section";
import { SubmitButton } from "@/components/forms/submit-button";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const profile = await fetchUserProfile(supabase, user.id);
  const email = user.email ?? "";

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        Profile & Settings
      </h1>

      {/* Profile Banner */}
      <ProfileHeader email={email} memberSince={profile?.created_at ?? null} />

      {/* Integrated Preferences & Settings Section */}
      <SettingsPreferencesSection />

      {/* Account Security & Password Section */}
      <div className="flex flex-col gap-4 pt-2 border-t border-border/40">
        <h2 className="text-lg font-bold tracking-tight text-foreground">
          Account & Security
        </h2>
        <UpdateEmailForm currentEmail={email} />
        <ChangePasswordForm />
      </div>

      {/* Sign Out Action */}
      <div className="pt-4 border-t border-border/40 flex justify-start">
        <form action={logout}>
          <SubmitButton
            variant="outline"
            className="text-destructive border-destructive/20 hover:bg-destructive/10 hover:border-destructive/40 transition-colors gap-2"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </SubmitButton>
        </form>
      </div>
    </div>
  );
}
