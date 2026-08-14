"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wallet, Sparkles, UserCheck } from "lucide-react";
import { NAV_ITEMS } from "@/lib/nav";
import { cn } from "@/lib/utils";

interface SidebarProps {
  userEmail?: string;
}

export function Sidebar({ userEmail }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-screen w-64 flex-col overflow-hidden border-r border-border/60 bg-card/95 backdrop-blur-md px-4 py-5 md:flex shrink-0 shadow-sm transition-all">
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute -left-20 -top-20 -z-10 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 -bottom-20 -z-10 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />

      {/* Brand Header */}
      <div className="mb-8 flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary via-primary/90 to-primary/70 text-primary-foreground shadow-md shadow-primary/20">
            <Wallet className="h-5 w-5" />
          </span>
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight text-foreground flex items-center gap-1.5">
              MC Tracker
              <Sparkles className="h-3.5 w-3.5 text-primary animate-pulse" />
            </span>
            <span className="text-[11px] font-medium text-muted-foreground tracking-wide">
              Financial Management
            </span>
          </div>
        </div>
        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
          v1.0
        </span>
      </div>

      {/* Section Label */}
      <div className="mb-2 px-3 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
        Main Menu
      </div>

      {/* Navigation Links */}
      <nav className="flex flex-1 flex-col gap-1.5">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200",
                active
                  ? "bg-primary/10 text-primary shadow-sm font-semibold"
                  : "text-muted-foreground hover:translate-x-1 hover:bg-accent/60 hover:text-foreground",
              )}
            >
              <span
                className={cn(
                  "absolute inset-y-2 left-0 w-1.5 rounded-r-full bg-primary transition-all duration-200",
                  active ? "scale-y-100 opacity-100" : "scale-y-0 opacity-0",
                )}
                aria-hidden
              />
              <span
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors",
                  active
                    ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                    : "bg-muted/60 group-hover:bg-background group-hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
              </span>
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Info Footer */}
      {userEmail && (
        <div className="mt-auto border-t border-border/50 pt-4 px-2">
          <Link
            href="/profile"
            className="flex items-center gap-3 rounded-xl bg-accent/40 p-2.5 border border-border/40 transition-colors hover:bg-accent/70"
            title="View profile"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/20 text-primary font-semibold text-xs">
              {userEmail.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="truncate text-xs font-semibold text-foreground">
                {userEmail}
              </span>
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <UserCheck className="h-3 w-3 text-emerald-500" /> Connected
              </span>
            </div>
          </Link>
        </div>
      )}
    </aside>
  );
}
