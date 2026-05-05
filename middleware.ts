import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken, COOKIE_NAME } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // /admin (login page) 자체는 통과
  if (path === "/admin" || path === "/admin/") {
    return NextResponse.next();
  }

  // /api/admin/login 은 인증 전에 호출되어야 하므로 통과
  if (path === "/api/admin/login") {
    return NextResponse.next();
  }

  // 나머지 admin/* 와 api/admin/* 는 token 검증
  const isAdminAPI = path.startsWith("/api/admin/");
  const token = request.cookies.get(COOKIE_NAME)?.value;
  const valid = token ? await verifyAdminToken(token) : false;

  if (!valid) {
    if (isAdminAPI) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
