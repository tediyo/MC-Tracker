"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { NAV_ITEMS } from "@/lib/nav";
import { cn } from "@/lib/utils";

interface BottomNavProps {
  userEmail?: string;
}

export function BottomNav({ userEmail }: BottomNavProps) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="fixed bottom-3 left-0 right-0 z-40 flex items-center justify-center px-3 md:hidden pointer-events-none">
      {/* Floating Compact Pill Nav Container - Perfectly sized for small mobile screens */}
      <div className="pointer-events-auto flex w-full max-w-[360px] items-center justify-around rounded-full border border-border bg-card/95 px-2 py-1.5 shadow-xl backdrop-blur-md">
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
                "flex flex-col items-center justify-center rounded-full px-2 py-1 text-center transition-colors flex-1 max-w-[64px]",
                active ? "text-primary font-bold" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className={cn("h-4 w-4", active ? "text-emerald-500" : "text-muted-foreground")} />
              <span className="text-[10px] tracking-tight mt-0.5 whitespace-nowrap">{label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
