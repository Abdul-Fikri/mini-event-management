import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import { getSupabaseEnv } from "@/lib/supabase/env";
const PUBLIC_PATHS = ["/login", "/register", "/contoh-event", "/join"];
const AUTH_ONLY_PATHS = ["/login", "/register"];
function isPublicPath(pathname) { return PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`)); }
function redirectTo(request, supabaseResponse, pathname) {
  const url = request.nextUrl.clone(); url.pathname = pathname; url.search = "";
  const redirect = NextResponse.redirect(url);
  supabaseResponse.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
  ["cache-control", "expires", "pragma"].forEach((name) => { const value = supabaseResponse.headers.get(name); if (value) redirect.headers.set(name, value); });
  return redirect;
}
export async function updateSession(request) {
  let supabaseResponse = NextResponse.next({ request });
  const { url, key } = getSupabaseEnv();
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() { return request.cookies.getAll(); },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options));
        if (headers) Object.entries(headers).forEach(([name, value]) => supabaseResponse.headers.set(name, value));
      },
    },
  });
  // Jangan menaruh kode lain di antara createServerClient dan getClaims().
  const { data } = await supabase.auth.getClaims();
  const isLoggedIn = Boolean(data?.claims);
  const { pathname } = request.nextUrl;
  if (!isLoggedIn && !isPublicPath(pathname)) return redirectTo(request, supabaseResponse, "/login");
  if (isLoggedIn && AUTH_ONLY_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`))) return redirectTo(request, supabaseResponse, "/dashboard");
  return supabaseResponse;
}
