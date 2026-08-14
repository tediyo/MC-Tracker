import { LogOut } from "lucide-react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { fetchUserProfile } from "@/lib/data/users";
import { logout } from "@/lib/auth/actions";
import { ProfileHeader } from "@/components/profile/profile-header";
import { UpdateEmailForm } from "@/components/profile/update-email-form";
import { ChangePasswordForm } from "@/components/profile/change-password-form";
import { Card, CardContent } from "@/components/ui/card";
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

      <Card>
        <CardContent className="flex flex-wrap items-center justify-between gap-4 pt-6">
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-foreground">Log out</span>
            <span className="text-sm text-muted-foreground">Sign out of MC Tracker on this device.</span>
          </div>
          <form action={logout}>
            <SubmitButton
              variant="outline"
              className="text-muted-foreground hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut className="h-4 w-4" />
              Log out
            </SubmitButton>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
