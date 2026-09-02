"use client";

import * as React from "react";
import Link from "next/link";
import {
  UserCheck,
  Palette,
  Pencil,
  ChevronRight,
  Shield,
  Calendar,
  Globe,
  HelpCircle,
  BookOpen,
  FileText,
  LogOut,
  PiggyBank,
  Receipt,
  Target,
} from "lucide-react";
import { useCalendarPreference } from "@/components/providers/calendar-provider";
import { useTheme } from "@/components/providers/theme-provider";
import { logout } from "@/lib/auth/actions";
import { UpdateEmailForm } from "@/components/profile/update-email-form";
import { ChangePasswordForm } from "@/components/profile/change-password-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SettingRowProps {
  icon: React.ElementType;
  title: string;
  subtitle?: string;
  isDestructive?: boolean;
  onPress?: () => void;
  href?: string;
  showDivider?: boolean;
  hasSwitch?: boolean;
  switchValue?: boolean;
  onSwitchChange?: (val: boolean) => void;
}

function SettingRow({
  icon: Icon,
  title,
  subtitle,
  isDestructive = false,
  onPress,
  href,
  showDivider = true,
  hasSwitch = false,
  switchValue = false,
  onSwitchChange,
}: SettingRowProps) {
  const content = (
    <div
      className={cn(
        "flex items-center justify-between py-3.5 px-4 cursor-pointer transition-colors hover:bg-accent/40",
        showDivider && "border-b border-border/50",
      )}
      onClick={hasSwitch ? () => onSwitchChange?.(!switchValue) : onPress}
    >
      <div className="flex items-center gap-3.5 flex-1 min-w-0">
        <Icon className={cn("h-5 w-5 shrink-0", isDestructive ? "text-rose-500" : "text-foreground")} />
        <div className="flex flex-col min-w-0 flex-1">
          <span className={cn("text-sm font-semibold truncate", isDestructive ? "text-rose-500" : "text-foreground")}>
            {title}
          </span>
          {subtitle ? (
            <span className="text-xs text-muted-foreground truncate mt-0.5">{subtitle}</span>
          ) : null}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 ml-3">
        {hasSwitch ? (
          <button
            type="button"
            role="switch"
            aria-checked={switchValue}
            onClick={(e) => {
              e.stopPropagation();
              onSwitchChange?.(!switchValue);
            }}
            className={cn(
              "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
              switchValue ? "bg-emerald-500" : "bg-muted-foreground/30",
            )}
          >
            <span
              className={cn(
                "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out",
                switchValue ? "translate-x-5" : "translate-x-0",
              )}
            />
          </button>
        ) : (
          !isDestructive && <ChevronRight className="h-4 w-4 text-muted-foreground" />
        )}
      </div>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}

export function MobileStyleProfile({
  email,
  memberSince,
}: {
  email: string;
  memberSince: string | null;
}) {
  const { calendarMode, setCalendarMode } = useCalendarPreference();
  const { theme, setTheme } = useTheme();

  const [activeModal, setActiveModal] = React.useState<string | null>(null);
  const [infoTitle, setInfoTitle] = React.useState("");
  const [infoText, setInfoText] = React.useState("");

  const isGregorian = calendarMode === "gregorian";
  const isDarkMode = theme === "dark";

  const initial = email ? email.charAt(0).toUpperCase() : "U";

  const openInfo = (title: string, text: string) => {
    setInfoTitle(title);
    setInfoText(text);
    setActiveModal("info");
  };

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-5 pb-16 animate-in fade-in duration-300">
      {/* 1. Header Profile Card */}
      <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border-2 border-emerald-500/40 bg-emerald-500/10 text-xl font-black text-emerald-600 dark:text-emerald-400">
          {initial}
        </div>

        <div className="flex flex-col min-w-0 flex-1 gap-1">
          <div className="flex items-center justify-between gap-2">
            <h1 className="text-lg font-bold tracking-tight text-foreground truncate">Your Profile</h1>
            <button
              onClick={() => setActiveModal("email")}
              className="p-1.5 rounded-lg text-emerald-500 hover:bg-emerald-500/10 transition-colors"
              title="Edit Email"
            >
              <Pencil className="h-4 w-4" />
            </button>
          </div>
          <p className="text-xs text-muted-foreground truncate">{email}</p>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 w-max mt-1">
            <UserCheck className="h-3 w-3" />
            <span>Active Session</span>
          </div>
        </div>
      </div>

      {/* 2. Main Feature Quick Links (Navigation Group Card) */}
      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        <SettingRow
          icon={PiggyBank}
          title="Incomes"
          subtitle="Manage income entries & categories"
          href="/income"
          showDivider={true}
        />
        <SettingRow
          icon={Receipt}
          title="Costs"
          subtitle="Track daily expenses & subcategories"
          href="/costs"
          showDivider={true}
        />
        <SettingRow
          icon={Target}
          title="Plans"
          subtitle="Set monthly budgets & savings goals"
          href="/plans"
          showDivider={false}
        />
      </div>

      {/* 3. Preferences & Toggles Section */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">
          Preferences & Toggles
        </span>
        <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          {/* Gregorian Calendar Toggle */}
          <SettingRow
            icon={Calendar}
            title="Gregorian Calendar"
            subtitle={
              isGregorian
                ? "On (Gregorian G.C. active)"
                : "Off (Ethiopian E.C. active by default)"
            }
            hasSwitch={true}
            switchValue={isGregorian}
            onSwitchChange={(val) => setCalendarMode(val ? "gregorian" : "ethiopian")}
            showDivider={true}
          />

          {/* Dark Theme Toggle */}
          <SettingRow
            icon={Palette}
            title="Dark Theme"
            subtitle={isDarkMode ? "On (Dark Mode active)" : "Off (Light Mode active)"}
            hasSwitch={true}
            switchValue={isDarkMode}
            onSwitchChange={(val) => setTheme(val ? "dark" : "light")}
            showDivider={true}
          />

          {/* Change Password Row */}
          <SettingRow
            icon={Shield}
            title="Change Password"
            subtitle="Update account password"
            onPress={() => setActiveModal("password")}
            showDivider={false}
          />
        </div>
      </div>

      {/* 4. General Section */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">
          General
        </span>
        <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          <SettingRow
            icon={Globe}
            title="Language"
            subtitle="English (US)"
            onPress={() => openInfo("Language", "Language preference is set to English (US).")}
            showDivider={true}
          />
          <SettingRow
            icon={HelpCircle}
            title="Help and Support"
            subtitle="Contact support or read FAQs"
            onPress={() =>
              openInfo(
                "Help & Support",
                "MC Tracker Support\n\nFor assistance or feedback, contact support@mctracker.com or reach out via your mobile dashboard.",
              )
            }
            showDivider={false}
          />
        </div>
      </div>

      {/* 5. Legal Section */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">
          Legal
        </span>
        <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          <SettingRow
            icon={BookOpen}
            title="Privacy Policy"
            onPress={() =>
              openInfo(
                "Privacy Policy",
                "Privacy Policy\n\nYour financial data is encrypted and tied exclusively to your authenticated user account. We do not share your private financial logs with third parties.",
              )
            }
            showDivider={true}
          />
          <SettingRow
            icon={FileText}
            title="Terms & Conditions"
            onPress={() =>
              openInfo(
                "Terms & Conditions",
                "Terms & Conditions\n\nMC Tracker is provided for personal financial management and metrics tracking.",
              )
            }
            showDivider={false}
          />
        </div>
      </div>

      {/* 6. Logout Group Card */}
      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden mt-2">
        <form action={logout}>
          <button
            type="submit"
            className="w-full flex items-center gap-3.5 py-3.5 px-4 text-left font-semibold text-sm text-rose-500 hover:bg-rose-500/10 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </form>
      </div>

      {/* Dialog Modals */}

      {/* Information Dialog */}
      <Dialog open={activeModal === "info"} onOpenChange={() => setActiveModal(null)}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">{infoTitle}</DialogTitle>
          </DialogHeader>
          <div className="py-2 text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
            {infoText}
          </div>
        </DialogContent>
      </Dialog>

      {/* Update Email Dialog */}
      <Dialog open={activeModal === "email"} onOpenChange={() => setActiveModal(null)}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Update Email Address</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <UpdateEmailForm currentEmail={email} />
          </div>
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={activeModal === "password"} onOpenChange={() => setActiveModal(null)}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Change Password</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <ChangePasswordForm />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
