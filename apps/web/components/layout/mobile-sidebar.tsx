"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Wallet, Sparkles, UserCheck } from "lucide-react";
import { NAV_ITEMS } from "@/lib/nav";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface MobileSidebarProps {
  userEmail?: string;
}

export function MobileSidebar({ userEmail }: MobileSidebarProps) {
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname();

  // Close sheet on route change
  React.useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden" aria-label="Toggle Menu">
          <Menu className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="fixed left-0 top-0 h-full w-[280px] max-w-[85vw] translate-x-0 translate-y-0 rounded-none border-r border-border/60 bg-card p-5 shadow-2xl flex flex-col justify-between">
        <div>
          <DialogHeader className="mb-6 text-left">
            <DialogTitle className="flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-sm">
                <Wallet className="h-4 w-4" />
              </span>
              <div className="flex flex-col">
                <span className="text-base font-bold tracking-tight flex items-center gap-1.5">
                  MC Tracker
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                </span>
                <span className="text-[11px] font-normal text-muted-foreground">
                  Financial Suite
                </span>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="mb-2 px-1 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
            Main Menu
          </div>

          <nav className="flex flex-col gap-1.5">
            {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || pathname.startsWith(`${href}/`);
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200",
                    active
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors",
                      active
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-muted/60",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <span>{label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {userEmail && (
          <div className="border-t border-border/50 pt-4">
            <div className="flex items-center gap-3 rounded-xl bg-accent/40 p-2.5 border border-border/40">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/20 text-primary font-semibold text-xs">
                {userEmail.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="truncate text-xs font-semibold text-foreground">
                  {userEmail}
                </span>
                <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <UserCheck className="h-3 w-3 text-emerald-500" /> Active Session
                </span>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
