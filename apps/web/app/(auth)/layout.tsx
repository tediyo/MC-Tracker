import { ThemeToggle } from "@/components/layout/theme-toggle";
import { AuthLogo } from "@/components/auth/auth-logo";

export const dynamic = "force-dynamic";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-muted/40 px-4 py-8">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <AuthLogo className="h-14 w-14 mb-3" />
          <h1 className="text-2xl font-bold tracking-tight">MC Tracker</h1>
        </div>
        {children}
      </div>
    </div>
  );
}
