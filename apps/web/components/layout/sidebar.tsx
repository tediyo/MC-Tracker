"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wallet } from "lucide-react";
import { NAV_ITEMS } from "@/lib/nav";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-screen w-56 flex-col overflow-hidden border-r bg-gradient-to-b from-card to-card/95 px-3 py-4 md:flex">
      {/* Ambient glow - purely decorative, sits behind everything via -z-10; low
          opacity so it reads as depth rather than a visible shape in either theme.
          Sidebar is pinned to the viewport (sticky + h-screen) rather than
          stretched to the page's full scroll height, so `bottom-0` here lands
          at the bottom of the screen instead of off the bottom of a tall page. */}
      <div className="pointer-events-none absolute -left-16 bottom-0 -z-10 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />

      <div className="mb-6 flex items-center gap-2 px-2">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-sm">
          <Wallet className="h-4 w-4" />
        </span>
        <span className="text-lg font-bold tracking-tight">MC Tracker</span>
      </div>

      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "group relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:translate-x-0.5 hover:bg-secondary/70 hover:text-foreground",
              )}
            >
              <span
                className={cn(
                  "absolute inset-y-1.5 left-0 w-1 rounded-full bg-primary transition-transform duration-200",
                  active ? "scale-y-100" : "scale-y-0",
                )}
                aria-hidden
              />
              <span
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-md transition-colors",
                  active ? "bg-primary/15" : "group-hover:bg-background/80",
                )}
              >
                <Icon className="h-4 w-4" />
              </span>
              <span className={cn(active && "font-semibold")}>{label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
