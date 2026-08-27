"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, User } from "lucide-react";
import { logout } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";

export function UserMenu({ email }: { email: string }) {
  const router = useRouter();
  const initial = email ? email.charAt(0).toUpperCase() : "U";

  return (
    <div className="hidden items-center gap-2 md:flex">
      <Link
        href="/profile"
        prefetch={true}
        onMouseEnter={() => router.prefetch("/profile")}
        onPointerDown={() => router.prefetch("/profile")}
        className="flex items-center gap-2 rounded-full border border-border bg-card px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        title="View profile"
      >
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
          {initial}
        </span>
        <span className="max-w-[150px] truncate text-xs font-medium text-foreground">
          {email}
        </span>
      </Link>
      <form action={logout}>
        <Button
          type="submit"
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full text-muted-foreground hover:bg-accent hover:text-destructive transition-colors"
          title="Log out"
        >
          <LogOut className="h-3.5 w-3.5" />
        </Button>
      </form>
    </div>
  );
}

