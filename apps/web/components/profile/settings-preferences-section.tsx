"use client";

import * as React from "react";
import { Calendar, Sun, Moon, Laptop, CheckCircle2, Settings2, Radio, SunMoon } from "lucide-react";
import { useCalendarPreference } from "@/components/providers/calendar-provider";
import { useTheme } from "@/components/providers/theme-provider";
import { useLiveModePreference } from "@/components/providers/live-mode-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SettingsPreferencesSection() {
  const { calendarMode, setCalendarMode } = useCalendarPreference();
  const { theme, setTheme } = useTheme();
  const { isLiveMode, setIsLiveMode } = useLiveModePreference();

  return (
    <div className="flex flex-col gap-6 w-full mt-2">
      {/* Section Title */}
      <div className="flex items-center gap-2 pt-2 border-t border-border/40">
        <Settings2 className="h-5 w-5 text-emerald-500" />
        <h2 className="text-lg font-bold tracking-tight text-foreground">
          Preferences & Settings
        </h2>
      </div>

      {/* Calendar System Preference */}
      <Card className="viz-root border-border/60 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-emerald-500" />
            <CardTitle className="text-base">Calendar System Preference</CardTitle>
          </div>
          <CardDescription className="text-xs">
            Select your preferred primary calendar system. This choice controls date headers, period navigation, and reports throughout the app.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
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
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              )}
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed mb-3">
              Displays Ethiopian months (Nehase, Hamle, Sene, Pagume, etc.) as the primary date headers.
            </p>

            <div className="mt-auto pt-2 border-t border-border/40 flex items-center justify-between text-[11px] font-medium text-muted-foreground">
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
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold text-xs">
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
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              )}
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed mb-3">
              Displays standard Gregorian calendar months (January through December) as primary headers.
            </p>

            <div className="mt-auto pt-2 border-t border-border/40 flex items-center justify-between text-[11px] font-medium text-muted-foreground">
              <span>Example: <strong className="text-foreground">August 2026</strong></span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appearance & Theme Preference */}
      <Card className="viz-root border-border/60 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Sun className="h-4 w-4 text-emerald-500" />
            <CardTitle className="text-base">Appearance & Theme</CardTitle>
          </div>
          <CardDescription className="text-xs">
            Choose your preferred color theme mode for the application interface.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2.5">
          <Button
            variant={theme === "light" ? "default" : "outline"}
            onClick={() => setTheme("light")}
            className={cn(
              "gap-2 rounded-xl h-9 px-3.5 text-xs font-semibold",
              theme === "light" && "bg-emerald-500 hover:bg-emerald-600 text-white",
            )}
          >
            <Sun className="h-3.5 w-3.5" />
            <span>Light Mode</span>
          </Button>

          <Button
            variant={theme === "dark" ? "default" : "outline"}
            onClick={() => setTheme("dark")}
            className={cn(
              "gap-2 rounded-xl h-9 px-3.5 text-xs font-semibold",
              theme === "dark" && "bg-emerald-500 hover:bg-emerald-600 text-white",
            )}
          >
            <Moon className="h-3.5 w-3.5" />
            <span>Dark Mode</span>
          </Button>

          <Button
            variant={theme === "system" ? "default" : "outline"}
            onClick={() => setTheme("system")}
            className={cn(
              "gap-2 rounded-xl h-9 px-3.5 text-xs font-semibold",
              theme === "system" && "bg-emerald-500 hover:bg-emerald-600 text-white",
            )}
          >
            <Laptop className="h-3.5 w-3.5" />
            <span>System Preference</span>
          </Button>
        </CardContent>
      </Card>

      {/* Live Mode Floating Icon Preference */}
      <Card className="viz-root border-border/60 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Radio className="h-4 w-4 text-primary" />
              <CardTitle className="text-base">Live Mode Floating Icon</CardTitle>
            </div>
            <span
              className={cn(
                "rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                isLiveMode
                  ? "bg-primary/10 text-primary"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {isLiveMode ? "Active" : "Hidden (Default)"}
            </span>
          </div>
          <CardDescription className="text-xs">
            Enable a draggable floating action button on your computer screen for quick access to log expenses, income, and budget plans.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-3">
          <Button
            variant={isLiveMode ? "default" : "outline"}
            onClick={() => setIsLiveMode(true)}
            className={cn(
              "gap-2 rounded-xl h-9 px-4 text-xs font-semibold",
              isLiveMode && "bg-primary hover:bg-primary/90 text-primary-foreground"
            )}
          >
            <span>Live Mode ON</span>
          </Button>

          <Button
            variant={!isLiveMode ? "default" : "outline"}
            onClick={() => setIsLiveMode(false)}
            className={cn(
              "gap-2 rounded-xl h-9 px-4 text-xs font-semibold",
              !isLiveMode && "bg-muted-foreground/20 hover:bg-muted-foreground/30 text-foreground"
            )}
          >
            <span>Live Mode OFF (Hidden)</span>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
