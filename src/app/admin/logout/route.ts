import { COOKIE_NAME } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/admin", request.url));
  response.cookies.delete(COOKIE_NAME);
  return response;
}
