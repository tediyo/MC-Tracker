"use client";

import * as React from "react";
import { useTheme } from "@/components/providers/theme-provider";

export function AuthLogo({ className = "h-16 w-16" }: { className?: string }) {
  const { theme, mounted } = useTheme();
  const [src, setSrc] = React.useState("/MCT_Logo_light.jpg");

  React.useEffect(() => {
    if (!mounted) return;
    const isDark =
      theme === "dark" ||
      (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    setSrc(isDark ? "/MCT_Logo.png" : "/MCT_Logo_light.jpg");
  }, [theme, mounted]);

  return (
    <div className="flex justify-center">
      <img
        src={src}
        alt="MC Tracker Logo"
        className={`rounded-2xl object-contain shadow-md ring-1 ring-border/50 transition-all ${className}`}
        onError={() => {
          if (src === "/MCT_Logo_light.jpg") {
            setSrc("/MCT_Logo.png");
          }
        }}
      />
    </div>
  );
}
