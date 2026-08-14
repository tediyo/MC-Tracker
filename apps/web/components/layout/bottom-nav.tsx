"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/lib/nav";
import { cn } from "@/lib/utils";

interface BottomNavProps {
  userEmail?: string;
}

export function BottomNav({ userEmail }: BottomNavProps) {
  const pathname = usePathname();
  const initial = userEmail ? userEmail.charAt(0).toUpperCase() : "U";

  return (
    <div className="fixed bottom-4 left-0 right-0 z-40 flex items-center justify-center gap-2.5 px-4 md:hidden pointer-events-none">
      {/* Floating Pill Nav Container */}
      <div className="pointer-events-auto flex items-center justify-around gap-1 rounded-full border border-border/60 bg-card/90 px-3 py-2 shadow-xl shadow-black/10 backdrop-blur-xl">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "group flex flex-col items-center justify-center rounded-full px-3 py-1 text-center transition-all duration-200 min-w-[58px]",
                active
                  ? "text-foreground font-bold"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <span
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full transition-transform duration-200",
                  active ? "scale-110 text-primary font-bold" : "group-hover:scale-105",
                )}
              >
                <Icon className={cn("h-4 w-4", active ? "stroke-[2.5]" : "stroke-[1.75]")} />
              </span>
              <span className={cn("text-[10px] tracking-tight mt-0.5", active ? "font-bold text-foreground" : "font-medium")}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>

      {/* Floating Profile Shortcut - same gradient-initial avatar used by the
          identity chips in the sidebar/topbar, just promoted to a FAB since
          mobile has no other persistent profile entry point (see Topbar,
          which hides UserMenu below md). */}
      <Link
        href="/profile"
        className={cn(
          "pointer-events-auto flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary via-primary/90 to-primary/70 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/30 transition-transform active:scale-95",
          pathname === "/profile" && "ring-2 ring-primary ring-offset-2 ring-offset-background",
        )}
        title="Profile"
        aria-label="Profile"
      >
        {initial}
      </Link>
    </div>
  );
}
