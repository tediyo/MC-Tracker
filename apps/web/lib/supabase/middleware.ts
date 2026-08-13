import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@mc-tracker/shared-types";

const PROTECTED_PREFIXES = ["/dashboard", "/income", "/costs", "/plans"];
const AUTH_PAGES = ["/login", "/signup"];

/**
 * Refreshes the Supabase session cookie on every request and applies route
 * protection. Called from the root middleware.ts. Returning the exact
 * `supabaseResponse` object (not a fresh `NextResponse.next()`) is required
 * by @supabase/ssr - creating a new response drops the refreshed cookies.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    console.error("Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
    return supabaseResponse;
  }

  try {
    const supabase = createServerClient<Database>(
      url,
      anonKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
            supabaseResponse = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options));
          },
        },
      },
    );

    // IMPORTANT: do not remove this - it revalidates the auth token against
    // Supabase Auth and refreshes it if needed. Do not run any logic between
    // createServerClient and this call.
    const { data: { user } } = await supabase.auth.getUser();

    const { pathname } = request.nextUrl;
    const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
    const isAuthPage = AUTH_PAGES.some((prefix) => pathname.startsWith(prefix));

    if (!user && isProtected) {
      const redirectUrl = new URL("/login", request.url);
      redirectUrl.searchParams.set("redirectTo", pathname);
      return NextResponse.redirect(redirectUrl);
    }

    if (user && isAuthPage) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return supabaseResponse;
  } catch (error) {
    console.error("Error in updateSession middleware:", error);
    return supabaseResponse;
  }
}
