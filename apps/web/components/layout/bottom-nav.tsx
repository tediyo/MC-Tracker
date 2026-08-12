"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus } from "lucide-react";
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

      {/* Floating Circular Action Button (Matching the Image) */}
      <Link
        href="/costs"
        className="pointer-events-auto flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 transition-transform active:scale-95 hover:bg-emerald-700"
        title="Add Expense"
        aria-label="Add Expense"
      >
        <span className="flex items-center justify-center font-bold text-xs">
          <Plus className="h-5 w-5 stroke-[2.5]" />
        </span>
      </Link>
    </div>
  );
}
