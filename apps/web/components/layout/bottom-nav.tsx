"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { NAV_ITEMS } from "@/lib/nav";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/layout/theme-toggle";

interface BottomNavProps {
  userEmail?: string;
}

export function BottomNav({ userEmail }: BottomNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const initial = userEmail ? userEmail.charAt(0).toUpperCase() : "U";

  return (
    <div className="fixed bottom-3 left-0 right-0 z-40 flex items-center justify-center gap-2 px-4 md:hidden pointer-events-none">
      {/* Floating Pill Nav Container */}
      <div className="pointer-events-auto flex items-center justify-around gap-1 rounded-full border border-border bg-card/95 px-3 py-1.5 shadow-lg backdrop-blur-md">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              prefetch={true}
              onMouseEnter={() => router.prefetch(href)}
              onPointerDown={() => router.prefetch(href)}
              className={cn(
                "flex flex-col items-center justify-center rounded-full px-3 py-1 text-center transition-colors min-w-[54px]",
                active ? "text-primary font-semibold" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="text-[10px] tracking-tight mt-0.5">{label}</span>
            </Link>
          );
        })}
      </div>

      <div className="pointer-events-auto flex items-center gap-1.5 rounded-full border border-border bg-card/95 p-1 shadow-lg backdrop-blur-md">
        <ThemeToggle />
        <Link
          href="/profile"
          prefetch={true}
          onMouseEnter={() => router.prefetch("/profile")}
          onPointerDown={() => router.prefetch("/profile")}
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-card text-xs font-bold text-foreground transition-colors hover:bg-accent",
            pathname === "/profile" && "border-primary text-primary ring-1 ring-primary",
          )}
          title="Profile"
          aria-label="Profile"
        >
          {initial}
        </Link>
      </div>
    </div>
  );
}


