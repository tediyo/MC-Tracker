"use client";

import * as React from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateProfile, type ProfileActionResult } from "@/lib/auth/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { SubmitButton } from "@/components/forms/submit-button";

const initialState: ProfileActionResult = { error: null, success: null };

export function UpdateProfileForm({
  currentName,
  currentEmail,
  onSuccess,
}: {
  currentName?: string;
  currentEmail: string;
  onSuccess?: () => void;
}) {
  const router = useRouter();
  const [state, formAction] = useActionState(updateProfile, initialState);

  React.useEffect(() => {
    if (state.success) {
      toast.success(state.success);
      onSuccess?.();
      router.refresh();
    }
  }, [state.success, onSuccess, router]);

  return (
    <form action={formAction} className="flex flex-col gap-4 pt-1">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name" className="text-xs font-semibold text-muted-foreground">
          Full Name
        </Label>
        <Input
          id="name"
          name="name"
          type="text"
          defaultValue={currentName || ""}
          placeholder="John Doe"
          className="h-10 rounded-xl border-border/80 bg-card text-xs font-medium"
          required
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email" className="text-xs font-semibold text-muted-foreground">
          Email Address
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          defaultValue={currentEmail}
          autoComplete="email"
          className="h-10 rounded-xl border-border/80 bg-card text-xs font-medium"
          required
        />
      </div>
      {state.error ? <p className="text-xs text-destructive">{state.error}</p> : null}
      
      <div className="flex justify-end pt-2">
        <SubmitButton size="sm" className="h-9 px-5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs shadow-sm">
          Save changes
        </SubmitButton>
      </div>
    </form>
  );
}

export const UpdateEmailForm = UpdateProfileForm;
