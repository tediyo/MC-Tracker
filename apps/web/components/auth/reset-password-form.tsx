"use client";

import { useActionState, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { updatePassword, type ActionResult } from "@/lib/auth/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { SubmitButton } from "@/components/forms/submit-button";

const initialState: ActionResult = { error: null };

export function ResetPasswordForm() {
  const [state, formAction] = useActionState(updatePassword, initialState);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base text-foreground">Choose a new password</CardTitle>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="password">New password</Label>
            <div className="relative flex items-center">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                minLength={8}
                className="pr-10"
                required
              />
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowPassword((prev) => !prev);
                }}
                className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-r-md flex items-center justify-center cursor-pointer z-10"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 pointer-events-none" aria-hidden="true" />
                ) : (
                  <Eye className="h-4 w-4 pointer-events-none" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
          {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
        </CardContent>
        <CardFooter className="flex justify-center">
          <SubmitButton className="w-44 rounded-xl font-semibold shadow-sm">Update password</SubmitButton>
        </CardFooter>
      </form>
    </Card>
  );
}
