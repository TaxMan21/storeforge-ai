import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAccessToken } from "@/lib/auth/tokens";

const PUBLIC_PATHS = [
  "/",
  "/login",
  "/signup",
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/refresh",
  "/api/health",
  "/api/webhook",
  "/api/public",
];

const STATIC_PATHS = ["/_next", "/favicon.ico", "/public", ".svg", ".png", ".ico"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (STATIC_PATHS.some((p) => pathname.startsWith(p) || pathname.endsWith(p))) {
    return addSecurityHeaders(NextResponse.next());
  }

  if (pathname.startsWith("/api/webhook")) {
    return addSecurityHeaders(NextResponse.next());
  }

  const isPublic = PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );

  if (!isPublic && !pathname.startsWith("/api/")) {
    const token = request.cookies.get("sf_access")?.value;
    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return addSecurityHeaders(NextResponse.redirect(loginUrl));
    }

    const payload = await verifyAccessToken(token);
    if (!payload) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return addSecurityHeaders(NextResponse.redirect(loginUrl));
    }
  }

  if (pathname.startsWith("/api/") && !isPublic && !pathname.startsWith("/api/webhook")) {
    const token = request.cookies.get("sf_access")?.value;
    if (!token) {
      return addSecurityHeaders(
        NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
      );
    }

    const payload = await verifyAccessToken(token);
    if (!payload) {
      return addSecurityHeaders(
        NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 })
      );
    }
  }

  if (pathname.startsWith("/api/") && !isPublic && !pathname.startsWith("/api/webhook")) {
    const origin = request.headers.get("origin");
    const host = request.headers.get("host");

    if (origin && host) {
      try {
        const originUrl = new URL(origin);
        if (originUrl.host !== host) {
          return addSecurityHeaders(
            NextResponse.json({ success: false, error: "CSRF validation failed" }, { status: 403 })
          );
        }
      } catch {
        return addSecurityHeaders(
          NextResponse.json({ success: false, error: "Invalid origin" }, { status: 403 })
        );
      }
    }
  }

  const response = NextResponse.next();
  return addSecurityHeaders(response);
}

function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), interest-cohort=()"
  );
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload"
  );
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.paypal.com https://www.paypal.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob: https:; connect-src 'self' https://api.paypal.com https://www.paypal.com https://graph.facebook.com https://www.google-analytics.com; frame-src https://www.paypal.com https://js.paypal.com;"
  );
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};
