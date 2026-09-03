import { LayoutDashboard, TrendingUp, Receipt, Target, History, User, type LucideIcon } from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

/** Single source of truth for the app shell's sections */
export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/income", label: "Income", icon: TrendingUp },
  { href: "/costs", label: "Costs", icon: Receipt },
  { href: "/history", label: "History", icon: History },
  { href: "/plans", label: "Plans", icon: Target },
  { href: "/profile", label: "Profile", icon: User },
];
