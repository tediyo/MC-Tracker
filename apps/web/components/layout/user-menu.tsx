"use client";

import { LogOut } from "lucide-react";
import { logout } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";

export function UserMenu({ email }: { email: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="hidden text-sm text-muted-foreground sm:inline">{email}</span>
      <form action={logout}>
        <Button type="submit" variant="ghost" size="icon" title="Log out">
          <LogOut className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
