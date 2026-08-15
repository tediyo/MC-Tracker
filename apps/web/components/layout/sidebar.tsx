"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wallet, UserCheck } from "lucide-react";
import { NAV_ITEMS } from "@/lib/nav";
import { cn } from "@/lib/utils";

interface SidebarProps {
  userEmail?: string;
}

export function Sidebar({ userEmail }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-screen w-64 flex-col overflow-hidden border-r border-border bg-card/90 px-4 py-5 md:flex shrink-0 transition-colors">
      {/* Brand Header */}
      <div className="mb-8 flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <Wallet className="h-4 w-4" />
          </span>
          <div className="flex flex-col">
            <span className="text-sm font-semibold tracking-tight text-foreground">
              MC Tracker
            </span>
            <span className="text-[11px] font-medium text-muted-foreground">
              Financial Management
            </span>
          </div>
        </div>
        <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono font-medium text-muted-foreground">
          v1.0
        </span>
      </div>

      {/* Section Label */}
      <div className="mb-2 px-2 text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
        Menu
      </div>

      {/* Navigation Links */}
      <nav className="flex flex-1 flex-col gap-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-accent text-accent-foreground font-semibold"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
              )}
            >
              <Icon className={cn("h-4 w-4 shrink-0", active ? "text-primary" : "text-muted-foreground")} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Info Footer */}
      {userEmail && (
        <div className="mt-auto border-t border-border pt-3 px-1">
          <Link
            href="/profile"
            className="flex items-center gap-3 rounded-lg border border-border bg-card p-2 transition-colors hover:bg-accent"
            title="View profile"
          >
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs">
              {userEmail.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="truncate text-xs font-medium text-foreground">
                {userEmail}
              </span>
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <UserCheck className="h-3 w-3 text-emerald-500" /> Active session
              </span>
            </div>
          </Link>
        </div>
      )}
    </aside>
  );
}

