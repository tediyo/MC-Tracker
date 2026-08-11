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
      variant="ghost"
      size="icon"
      onClick={cycleTheme}
      title={`${label} - click to change`}
      aria-label={`${label}. Click to switch theme.`}
    >
      <Icon className="h-4 w-4" />
    </Button>
  );
}
