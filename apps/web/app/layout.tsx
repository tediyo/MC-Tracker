import type { Metadata } from "next";
import { Providers } from "@/components/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "MC Tracker",
  description: "Monthly Cost & Income Tracker",
};

/**
 * Runs before paint (and before hydration) to set `data-theme` from the
 * stored preference, so the page never flashes the wrong theme. Must read
 * the same key that ThemeProvider writes - see components/providers/theme-provider.tsx.
 * Absence of a stored value (or "system") leaves the attribute unset, letting
 * globals.css's `prefers-color-scheme` fallback apply.
 */
const NO_FLASH_THEME_SCRIPT = `(function(){try{var t=localStorage.getItem("mc-tracker-theme")||"light";document.documentElement.setAttribute("data-theme",t)}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: NO_FLASH_THEME_SCRIPT }} />
      </head>
      <body className="min-h-screen font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
