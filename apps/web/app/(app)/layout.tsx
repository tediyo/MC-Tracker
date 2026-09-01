import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/layout/sidebar";
import { BottomNav } from "@/components/layout/bottom-nav";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  let user = null;
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    user = data?.user ?? null;
  } catch (error) {
    console.error("Error retrieving user in AppLayout:", error);
  }

  if (!user) redirect("/login");

  return (
    <div className="flex min-h-screen bg-background font-sans antialiased">
      <Sidebar userEmail={user.email ?? ""} />
      <div className="relative flex flex-1 flex-col min-w-0">
        {/* Top-Right Corner: Theme Toggle ONLY */}
        <div className="absolute top-4 right-4 z-30 md:top-6 md:right-8">
          <ThemeToggle />
        </div>
        <main className="flex-1 p-4 pb-24 md:p-6 md:pb-6 lg:p-8 lg:pb-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
      <BottomNav userEmail={user.email ?? ""} />
    </div>
  );
}
