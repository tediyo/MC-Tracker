"use client";

import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/lib/nav";

/**
 * Fills the topbar's left side with the current section's name, from the
 * same NAV_ITEMS the sidebar renders. Matters most on narrow viewports,
 * where Sidebar is hidden entirely (`hidden ... md:flex`) and this is the
 * only on-screen indication of which page you're on; on desktop it doubles
 * as a persistent header now that the bar isn't otherwise empty.
 */
export function PageHeading() {
  const pathname = usePathname();
  const active = NAV_ITEMS.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));
  const Icon = active?.icon;

  return (
    <div className="flex items-center gap-2">
      {Icon && (
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </span>
      )}
      <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
        <span className="text-sm font-bold tracking-tight text-foreground">
          {active?.label ?? "MC Tracker"}
        </span>
      </div>
    </div>
  );
}
