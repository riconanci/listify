import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SESSION_SECRET = new TextEncoder().encode(
  process.env.SESSION_SECRET || "listify-dev-secret-change-in-production"
);
const COOKIE_NAME = "listify-session";

// Routes that require authentication
const PROTECTED_ROUTES = [
  "/jobs/manage",
  "/post",
  "/inbox",
  "/profile",
  "/onboarding",
  "/notifications",
  "/saved",
];

// Routes only for unauthenticated users (handled in-page, not middleware)

async function getSessionFromRequest(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, SESSION_SECRET);
    return payload as { userId: string; role: string };
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await getSessionFromRequest(request);

  // Protected routes — redirect to signin if not logged in
  const isProtected = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtected && !session) {
    const url = request.nextUrl.clone();
    url.pathname = "/signin";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // Auth routes — no middleware redirect. Pages handle their own
  // logged-in checks via /api/auth/me (which verifies user exists in DB).
  // This prevents stale cookies from blocking access to signin/signup.

  // Scout-only routes — redirect talent away from post/manage
  const SCOUT_ONLY = ["/post", "/jobs/manage"];
  const isScoutOnly = SCOUT_ONLY.some((route) => pathname.startsWith(route));

  if (isScoutOnly && session && session.role !== "employer") {
    const url = request.nextUrl.clone();
    url.pathname = "/jobs";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/jobs/manage/:path*",
    "/post/:path*",
    "/inbox/:path*",
    "/profile/:path*",
    "/onboarding/:path*",
    "/notifications/:path*",
    "/saved/:path*",
  ],
};
