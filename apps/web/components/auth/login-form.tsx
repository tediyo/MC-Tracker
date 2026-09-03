"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { login, type ActionResult } from "@/lib/auth/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { SubmitButton } from "@/components/forms/submit-button";

const initialState: ActionResult = { error: null };

export function LoginForm() {
  const [state, formAction] = useActionState(login, initialState);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Card>
      <CardHeader>
        {/* <CardTitle className="text-base text-foreground">Log in</CardTitle> */}
      </CardHeader>
      <form action={formAction}>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" autoComplete="email" required />
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link href="/forgot-password" className="text-xs text-muted-foreground hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative flex items-center">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
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
        <CardFooter className="flex flex-col items-center gap-3">
          <SubmitButton className="w-36 rounded-xl font-semibold shadow-sm">Log in</SubmitButton>
          <p className="text-center text-sm text-muted-foreground">
            No account?{" "}
            <Link href="/signup" className="text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
