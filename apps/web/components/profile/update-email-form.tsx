"use client";

import { useActionState } from "react";
import { updateEmail, type ProfileActionResult } from "@/lib/auth/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { SubmitButton } from "@/components/forms/submit-button";

const initialState: ProfileActionResult = { error: null, success: null };

export function UpdateEmailForm({ currentEmail }: { currentEmail: string }) {
  const [state, formAction] = useActionState(updateEmail, initialState);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-semibold uppercase tracking-wider text-foreground">Edit profile</CardTitle>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="current-email">Current email</Label>
            <Input id="current-email" value={currentEmail} disabled />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">New email</Label>
            <Input id="email" name="email" type="email" autoComplete="email" required />
          </div>
          {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
          {state.success ? <p className="text-sm text-success">{state.success}</p> : null}
        </CardContent>
        <CardFooter>
          <SubmitButton>Update email</SubmitButton>
        </CardFooter>
      </form>
    </Card>
  );
}
