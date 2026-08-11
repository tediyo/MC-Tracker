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

  return <span className="text-sm font-semibold">{active?.label ?? "MC Tracker"}</span>;
}
