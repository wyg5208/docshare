import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
    // Support new publishable key with fallback to legacy anon key
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      "placeholder-key",
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Skip auth checks for API routes (they handle their own auth)
  if (request.nextUrl.pathname.startsWith("/api")) {
    return supabaseResponse;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Email verification gate - block unverified users from any non-auth route
  if (user && user.email_confirmed_at === null) {
    const allowedForUnverified = [
      "/verify-email",
      "/login",
      "/register",
      "/forgot-password",
      "/api/auth/callback",
    ];
    const isAllowed = allowedForUnverified.some(
      (p) =>
        request.nextUrl.pathname === p ||
        request.nextUrl.pathname.startsWith(p + "/")
    );
    if (!isAllowed) {
      const url = request.nextUrl.clone();
      url.pathname = "/verify-email";
      return NextResponse.redirect(url);
    }
  }

  // Protected routes - redirect to login if not authenticated
  const protectedPaths = ["/admin", "/bookmarks", "/settings"];
  const isProtected = protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  // Check user active status and validity period for protected routes
  let cachedProfile: { is_active: boolean; valid_from: string | null; valid_until: string | null; role: string } | null = null;
  if (isProtected && user) {
    const { data: userProfile } = await supabase
      .from("profiles")
      .select("is_active, valid_from, valid_until, role")
      .eq("id", user.id)
      .single();

    cachedProfile = userProfile;

    if (userProfile) {
      // Check if user is manually disabled
      if (!userProfile.is_active) {
        const url = request.nextUrl.clone();
        url.pathname = "/login";
        url.searchParams.set("inactive", "true");
        // Sign out the user
        await supabase.auth.signOut();
        return NextResponse.redirect(url);
      }

      // Check validity period (only if user is active)
      const now = new Date();
      const validFrom = userProfile.valid_from ? new Date(userProfile.valid_from) : null;
      const validUntil = userProfile.valid_until ? new Date(userProfile.valid_until) : null;

      const isExpired =
        (validFrom && now < validFrom) || (validUntil && now > validUntil);

      if (isExpired) {
        const url = request.nextUrl.clone();
        url.pathname = "/login";
        url.searchParams.set("expired", "true");
        await supabase.auth.signOut();
        return NextResponse.redirect(url);
      }
    }
  }

  // Admin routes - check role (reuse cached profile if available)
  if (request.nextUrl.pathname.startsWith("/admin") && user) {
    const profile = cachedProfile || (await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()).data;

    if (!profile || profile.role !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  }

  // Auth routes - redirect to home if already logged in
  const authPaths = ["/login", "/register"];
  const isAuthPath = authPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  if (isAuthPath && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
