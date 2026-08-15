"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme, type ThemeMode } from "@/components/providers/theme-provider";

const NEXT_THEME: Record<ThemeMode, ThemeMode> = {
  light: "dark",
  dark: "system",
  system: "light",
};

const THEME_META: Record<ThemeMode, { icon: typeof Sun; label: string }> = {
  light: { icon: Sun, label: "Light theme" },
  dark: { icon: Moon, label: "Dark theme" },
  system: { icon: Monitor, label: "System theme" },
};

/** Cycles light -> dark -> system on click; icon reflects the active choice. */
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const { icon: Icon, label } = THEME_META[theme];

  function cycleTheme() {
    setTheme(NEXT_THEME[theme]);
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      onClick={cycleTheme}
      className="h-10 w-10 rounded-xl border border-border bg-card text-foreground shadow-sm hover:bg-accent hover:text-accent-foreground transition-colors flex items-center justify-center"
      title={`${label} - click to change`}
      aria-label={`${label}. Click to switch theme.`}
    >
      <Icon className="h-4.5 w-4.5" />
    </Button>
  );
}
