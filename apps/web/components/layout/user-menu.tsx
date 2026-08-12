"use client";

import { LogOut } from "lucide-react";
import { logout } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";

export function UserMenu({ email }: { email: string }) {
  const initial = email ? email.charAt(0).toUpperCase() : "U";

  return (
    <div className="flex items-center gap-2.5">
      <div className="flex items-center gap-2 rounded-full bg-accent/50 p-1 pr-3 border border-border/40 shadow-sm">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/70 text-xs font-bold text-primary-foreground shadow-sm">
          {initial}
        </span>
        <span className="hidden text-xs font-medium text-foreground sm:inline max-w-[160px] truncate">
          {email}
        </span>
      </div>
      <form action={logout}>
        <Button
          type="submit"
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          title="Log out"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
