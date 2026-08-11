import { ThemeToggle } from "@/components/layout/theme-toggle";
import { UserMenu } from "@/components/layout/user-menu";

export function Topbar({ email }: { email: string }) {
  return (
    <header className="flex h-14 items-center justify-between border-b bg-card px-4 md:px-6">
      <span className="text-sm font-semibold md:hidden">MC Tracker</span>
      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle />
        <UserMenu email={email} />
      </div>
    </header>
  );
}
