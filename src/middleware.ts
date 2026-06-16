import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequestWithAuth } from "next-auth/middleware";

export default withAuth(
  function middleware(req: NextRequestWithAuth) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // ── Inject pathname so server layouts can read it ──
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-pathname", pathname);

    // ── Admin login: already authed as admin → redirect to panel ──
    if (pathname === "/admin/login" && token?.role === "ADMIN") {
      return NextResponse.redirect(new URL("/admin", req.url));
    }

    // ── Admin routes (/admin/* except /admin/login) ──
    if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
      if (!token) {
        return NextResponse.redirect(new URL("/admin/login", req.url));
      }
      if (token.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

    // ── Dashboard routes: require any auth ──
    if (pathname.startsWith("/dashboard") && !token) {
      return NextResponse.redirect(new URL("/auth", req.url));
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
  matcher: ["/admin/:path*", "/dashboard/:path*"],
};
