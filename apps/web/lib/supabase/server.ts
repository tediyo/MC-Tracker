import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@mc-tracker/shared-types";

/**
 * Server Supabase client - for Server Components, Server Actions, and
 * Route Handlers. Backed by `next/headers` cookies so the session survives
 * SSR. `setAll` is wrapped in try/catch because Server Components can call
 * `cookies().set()` but the write is a no-op there (the middleware is what
 * actually refreshes the session on every request) - this only matters
 * when called from a Server Action or Route Handler, where the write does
 * take effect.
 */
export async function createClient() {
  const cookieStore = await cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key";

  return createServerClient<Database>(
    url,
    anonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // Called from a Server Component - safe to ignore since
            // middleware.ts refreshes the session on every request anyway.
          }
        },
      },
    },
  );
}
