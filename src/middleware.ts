import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequestWithAuth } from "next-auth/middleware";

const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);
const MAX_API_BODY_BYTES = 2 * 1024 * 1024;

function trustedOrigins(req: NextRequestWithAuth) {
  const origins = new Set([req.nextUrl.origin]);
  for (const value of [process.env.NEXTAUTH_URL, process.env.NEXT_PUBLIC_APP_URL]) {
    if (!value) continue;
    try { origins.add(new URL(value).origin); } catch { /* invalid configuration is ignored */ }
  }
  return origins;
}

export default withAuth(
  function middleware(req: NextRequestWithAuth) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    if (pathname.startsWith("/api/") && MUTATING_METHODS.has(req.method)) {
      const contentLength = Number(req.headers.get("content-length") || "0");
      if (Number.isFinite(contentLength) && contentLength > MAX_API_BODY_BYTES) {
        return NextResponse.json({ error: "Request body is too large" }, { status: 413 });
      }

      const fetchSite = req.headers.get("sec-fetch-site");
      const origin = req.headers.get("origin");
      if (fetchSite === "cross-site" || (origin && !trustedOrigins(req).has(origin))) {
        return NextResponse.json({ error: "Cross-site request blocked" }, { status: 403 });
      }
    }

    // ── Inject pathname so server layouts can read it ──
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-pathname", pathname);

    // ── Admin login: already authed as admin → redirect to panel ──
    if (pathname === "/admin/login" && token?.role === "ADMIN") {
      return NextResponse.redirect(new URL("/admin", req.url));
    }

    // ── Admin routes (/admin/* except /admin/login) ──
    if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
      if (!token || token.active === false) {
        return NextResponse.redirect(new URL("/admin/login", req.url));
      }
      if (token.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

    // ── Dashboard routes: require any auth ──
    if (pathname.startsWith("/dashboard") && (!token || token.active === false)) {
      const loginUrl = new URL("/auth", req.url);
      loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname + req.nextUrl.search);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  },
  {
    callbacks: { authorized: () => true },
  }
);

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*", "/api/:path*"],
};
