import { LayoutDashboard, PiggyBank, Receipt, Target, Settings, type LucideIcon } from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

/** Single source of truth for the app shell's sections - the sidebar's link
 * list and the topbar's page label (components/layout/page-heading.tsx)
 * both read from this so they can't drift out of sync. */
export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/income", label: "Income", icon: PiggyBank },
  { href: "/costs", label: "Costs", icon: Receipt },
  { href: "/plans", label: "Plans", icon: Target },
  { href: "/settings", label: "Settings", icon: Settings },
];
