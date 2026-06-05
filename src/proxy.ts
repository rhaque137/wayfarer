import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Lightweight proxy: just pass through
// Session refresh happens on the client via AuthProvider
export function proxy(_req: NextRequest) {
  const { pathname } = _req.nextUrl;
  const redirects: Record<string, string> = {
    "/": "/login",
    "/signin": "/login",
    "/sign-in": "/login",
    "/app": "/try",
    "/dashboard": "/trips",
    "/onboarding": "/login",
    "/itinerary": "/try",
  };

  const target = redirects[pathname];
  if (target) {
    const url = _req.nextUrl.clone();
    url.pathname = target;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
