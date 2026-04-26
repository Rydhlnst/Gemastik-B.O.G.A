import { NextRequest, NextResponse } from "next/server";

import { auth, type AppRole } from "@/lib/auth";

const ROLE_PREFIXES: Array<{ prefix: string; role: AppRole }> = [
  { prefix: "/goverment", role: "admin" },
  { prefix: "/vendor", role: "vendor" },
  { prefix: "/supplier", role: "sppg" },
  { prefix: "/logistik", role: "logistik" },
  { prefix: "/sekolah", role: "sekolah" },
];

function roleForPath(pathname: string): AppRole | null {
  const match = ROLE_PREFIXES.find(({ prefix }) => pathname.startsWith(prefix));
  return match?.role ?? null;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/auth")) {
    return NextResponse.next();
  }

  const requiredRole = roleForPath(pathname);
  if (!requiredRole) {
    return NextResponse.next();
  }

  if (process.env.NODE_ENV === "development") {
    const isAuthed = request.cookies.get("boga_is_auth")?.value === "true";
    const cookieRole = request.cookies.get("boga_user_role")?.value ?? "";

    if (!isAuthed) {
      const url = request.nextUrl.clone();
      url.pathname = "/auth/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }

    if (cookieRole !== requiredRole) {
      const url = request.nextUrl.clone();
      url.pathname = "/auth/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  }

  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  const appRole = (session.user as { appRole?: string }).appRole;
  if (appRole !== requiredRole) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/goverment/:path*", "/vendor/:path*", "/supplier/:path*", "/logistik/:path*", "/sekolah/:path*"],
};
