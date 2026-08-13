import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function RootPage() {
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    redirect(data?.user ? "/dashboard" : "/login");
  } catch (error) {
    // If redirect throws Next.js navigation error, let it propagate
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
      throw error;
    }
    console.error("Error in RootPage auth check:", error);
    redirect("/login");
  }
}
