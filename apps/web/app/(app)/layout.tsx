import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { BottomNav } from "@/components/layout/bottom-nav";

/**
 * Defense-in-depth session check - middleware.ts is the primary gate for
 * these routes, this just guarantees `user` is non-null for everything
 * rendered below without every page having to re-check.
 */
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
      <div className="flex flex-1 flex-col min-w-0">
        <Topbar email={user.email ?? ""} />
        <main className="flex-1 p-4 pb-24 md:p-6 md:pb-6 lg:p-8 lg:pb-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
      <BottomNav userEmail={user.email ?? ""} />
    </div>
  );
}
