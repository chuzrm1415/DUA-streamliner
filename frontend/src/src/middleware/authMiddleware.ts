import { auth } from "@/auth/auth.config";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_ROUTES = ["/auth/login"];
const PROTECTED_PREFIX = "/protected";

export default auth(async function middleware(req: NextRequest & { auth: any }) {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  const isPublic = PUBLIC_ROUTES.some((r) => pathname.startsWith(r));
  const isProtected = pathname.startsWith(PROTECTED_PREFIX);

  // Redirect unauthenticated users trying to access protected routes
  if (isProtected && !session) {
    const loginUrl = new URL("/auth/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users away from login page
  if (isPublic && session) {
    return NextResponse.redirect(new URL("/protected/dashboard", req.url));
  }

  return NextResponse.next();
});

export const config = {
  // Match all routes except Next.js internals and static files
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public/).*)"],
};
