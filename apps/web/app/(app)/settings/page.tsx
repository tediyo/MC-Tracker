"use client";

import * as React from "react";
import { Calendar, Sun, Moon, Laptop, CheckCircle2, Shield, Settings2 } from "lucide-react";
import { useCalendarPreference } from "@/components/providers/calendar-provider";
import { useTheme } from "@/components/providers/theme-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const { calendarMode, setCalendarMode } = useCalendarPreference();
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col gap-1 border-b border-border/50 pb-4">
        <div className="flex items-center gap-2">
          <Settings2 className="h-6 w-6 text-emerald-500" />
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Settings & Preferences
          </h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Configure your calendar system, theme appearance, and display options across MC Tracker.
        </p>
      </div>

      {/* Card 1: Calendar System Preference */}
      <Card className="viz-root border-border/60 shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-emerald-500" />
            <CardTitle className="text-lg">Calendar System Preference</CardTitle>
          </div>
          <CardDescription>
            Select your preferred primary calendar system. This choice controls date headers, period navigation, and reports throughout the app.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Option: Ethiopian Calendar */}
          <div
            onClick={() => setCalendarMode("ethiopian")}
            className={cn(
              "relative flex flex-col justify-between rounded-xl border p-4 cursor-pointer transition-all duration-200",
              calendarMode === "ethiopian"
                ? "border-emerald-500 bg-emerald-500/5 ring-2 ring-emerald-500/20 shadow-md"
                : "border-border/60 bg-card hover:bg-accent/50 hover:border-border",
            )}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                  ETH
                </span>
                <div>
                  <h3 className="text-sm font-bold text-foreground">Ethiopian Calendar</h3>
                  <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                    ዓመተ ምሕረት (E.C.)
                  </span>
                </div>
              </div>
              {calendarMode === "ethiopian" && (
                <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
              )}
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed mb-4">
              Displays Ethiopian months (Nehase, Hamle, Sene, Pagume, etc.) as the primary date headers with 13-month calendar navigation.
            </p>

            <div className="mt-auto pt-3 border-t border-border/40 flex items-center justify-between text-[11px] font-medium text-muted-foreground">
              <span>Example: <strong className="text-foreground">Nehase 2018 E.C.</strong></span>
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-emerald-600 dark:text-emerald-400 text-[10px] font-semibold">
                Default
              </span>
            </div>
          </div>

          {/* Option: Gregorian Calendar */}
          <div
            onClick={() => setCalendarMode("gregorian")}
            className={cn(
              "relative flex flex-col justify-between rounded-xl border p-4 cursor-pointer transition-all duration-200",
              calendarMode === "gregorian"
                ? "border-emerald-500 bg-emerald-500/5 ring-2 ring-emerald-500/20 shadow-md"
                : "border-border/60 bg-card hover:bg-accent/50 hover:border-border",
            )}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold text-xs">
                  GREG
                </span>
                <div>
                  <h3 className="text-sm font-bold text-foreground">Gregorian Calendar</h3>
                  <span className="text-[11px] font-medium text-muted-foreground">
                    Standard (G.C.)
                  </span>
                </div>
              </div>
              {calendarMode === "gregorian" && (
                <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
              )}
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed mb-4">
              Displays standard Gregorian calendar months (January through December) as primary headers.
            </p>

            <div className="mt-auto pt-3 border-t border-border/40 flex items-center justify-between text-[11px] font-medium text-muted-foreground">
              <span>Example: <strong className="text-foreground">August 2026</strong></span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card 2: Appearance & Theme Preference */}
      <Card className="viz-root border-border/60 shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sun className="h-5 w-5 text-emerald-500" />
            <CardTitle className="text-lg">Appearance & Theme</CardTitle>
          </div>
          <CardDescription>
            Choose your preferred color theme mode for the web application interface.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button
            variant={theme === "light" ? "default" : "outline"}
            onClick={() => setTheme("light")}
            className={cn(
              "gap-2 rounded-xl h-10 px-4 text-xs font-semibold",
              theme === "light" && "bg-emerald-500 hover:bg-emerald-600 text-white",
            )}
          >
            <Sun className="h-4 w-4" />
            <span>Light Mode</span>
          </Button>

          <Button
            variant={theme === "dark" ? "default" : "outline"}
            onClick={() => setTheme("dark")}
            className={cn(
              "gap-2 rounded-xl h-10 px-4 text-xs font-semibold",
              theme === "dark" && "bg-emerald-500 hover:bg-emerald-600 text-white",
            )}
          >
            <Moon className="h-4 w-4" />
            <span>Dark Mode</span>
          </Button>

          <Button
            variant={theme === "system" ? "default" : "outline"}
            onClick={() => setTheme("system")}
            className={cn(
              "gap-2 rounded-xl h-10 px-4 text-xs font-semibold",
              theme === "system" && "bg-emerald-500 hover:bg-emerald-600 text-white",
            )}
          >
            <Laptop className="h-4 w-4" />
            <span>System Preference</span>
          </Button>
        </CardContent>
      </Card>

      {/* Card 3: Privacy & Security Overview */}
      <Card className="viz-root border-border/60 shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-emerald-500" />
            <CardTitle className="text-lg">Data & Privacy</CardTitle>
          </div>
          <CardDescription>
            Financial metrics and balances can be toggled on or off at any time using the Hide Balances button on the Dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-border/50 bg-accent/30 p-3.5 text-xs text-muted-foreground flex items-center gap-3">
            <Shield className="h-5 w-5 text-emerald-500 shrink-0" />
            <span>
              All financial entries, budgets, and plans are private and tied exclusively to your authenticated user account.
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
