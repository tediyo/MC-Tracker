"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface ActionResult {
  error: string | null;
}

/**
 * Auth mutations are the one deliberate exception to "the browser talks to
 * Supabase directly": routing them through Server Actions (using the
 * *server* Supabase client) lets the session cookie be set on the server
 * response before any redirect/render, avoiding an unauthenticated flash.
 * This does not reintroduce a NestJS proxy - it's still Next.js talking
 * directly to Supabase, just from the server side for this one concern.
 */

// Every action below takes `(_prevState, formData)` rather than just
// `(formData)` so it can be passed directly to React's `useActionState` in
// the client form components - `_prevState` is unused but required by that
// hook's action signature.

export async function login(_prevState: ActionResult, formData: FormData): Promise<ActionResult> {
  const supabase = await createClient();
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signup(_prevState: ActionResult, formData: FormData): Promise<ActionResult> {
  const supabase = await createClient();
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  });
  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function requestPasswordReset(_prevState: ActionResult, formData: FormData): Promise<ActionResult> {
  const supabase = await createClient();
  const email = String(formData.get("email") ?? "");

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=/reset-password`,
  });
  if (error) return { error: error.message };

  return { error: null };
}

export async function updatePassword(_prevState: ActionResult, formData: FormData): Promise<ActionResult> {
  const supabase = await createClient();
  const password = String(formData.get("password") ?? "");

  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: error.message };

  redirect("/dashboard");
}

export async function logout(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}

export interface ProfileActionResult {
  error: string | null;
  success: string | null;
}

/**
 * Unlike `login`/`signup`/`updatePassword`, the profile forms stay on
 * /profile after submitting - `success` carries the confirmation message
 * instead of a redirect ending the interaction.
 */
export async function updateEmail(
  _prevState: ProfileActionResult,
  formData: FormData,
): Promise<ProfileActionResult> {
  const supabase = await createClient();
  const email = String(formData.get("email") ?? "").trim();

  const { error } = await supabase.auth.updateUser(
    { email },
    { emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback` },
  );
  if (error) return { error: error.message, success: null };

  revalidatePath("/profile");
  return {
    error: null,
    success: `Confirmation link sent to ${email} - your email won't change until you click it.`,
  };
}

export async function changePassword(
  _prevState: ProfileActionResult,
  formData: FormData,
): Promise<ProfileActionResult> {
  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (newPassword !== confirmPassword) {
    return { error: "New passwords don't match.", success: null };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return { error: "Not signed in.", success: null };

  // updateUser() alone only requires a valid session, not proof of the
  // *current* password - re-verifying it here stops a hijacked session
  // from locking the real owner out by silently changing the password.
  const { error: reauthError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  });
  if (reauthError) return { error: "Current password is incorrect.", success: null };

  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) return { error: error.message, success: null };

  return { error: null, success: "Password updated." };
}
