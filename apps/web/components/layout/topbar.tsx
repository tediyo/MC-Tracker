import { PageHeading } from "@/components/layout/page-heading";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { UserMenu } from "@/components/layout/user-menu";
import { MobileSidebar } from "@/components/layout/mobile-sidebar";

export function Topbar({ email }: { email: string }) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border/50 bg-card/80 backdrop-blur-md px-4 md:px-6 transition-colors">
      <div className="flex items-center gap-3">
        <MobileSidebar userEmail={email} />
        <PageHeading />
      </div>
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <UserMenu email={email} />
      </div>
    </header>
  );
}
