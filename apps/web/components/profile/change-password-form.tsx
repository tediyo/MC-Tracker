"use client";

import * as React from "react";
import { useActionState } from "react";
import { toast } from "sonner";
import { changePassword, type ProfileActionResult } from "@/lib/auth/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { SubmitButton } from "@/components/forms/submit-button";

const initialState: ProfileActionResult = { error: null, success: null };

export function ChangePasswordForm({ onSuccess }: { onSuccess?: () => void }) {
  const [state, formAction] = useActionState(changePassword, initialState);

  React.useEffect(() => {
    if (state.success) {
      toast.success(state.success);
      onSuccess?.();
    }
  }, [state.success, onSuccess]);

  return (
    <form action={formAction} className="flex flex-col gap-4 pt-1">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="currentPassword" className="text-xs font-semibold text-muted-foreground">
          Current password
        </Label>
        <Input id="currentPassword" name="currentPassword" type="password" autoComplete="current-password" className="h-10 rounded-xl border-border/80 bg-card text-xs font-medium" required />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="newPassword" className="text-xs font-semibold text-muted-foreground">
          New password
        </Label>
        <Input id="newPassword" name="newPassword" type="password" autoComplete="new-password" minLength={8} className="h-10 rounded-xl border-border/80 bg-card text-xs font-medium" required />
        <p className="text-[11px] text-muted-foreground">At least 8 characters.</p>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="confirmPassword" className="text-xs font-semibold text-muted-foreground">
          Confirm new password
        </Label>
        <Input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" minLength={8} className="h-10 rounded-xl border-border/80 bg-card text-xs font-medium" required />
      </div>
      {state.error ? <p className="text-xs text-destructive">{state.error}</p> : null}
      
      <div className="flex justify-end pt-2">
        <SubmitButton size="sm" className="h-9 px-5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs shadow-sm">
          Update password
        </SubmitButton>
      </div>
    </form>
  );
}
