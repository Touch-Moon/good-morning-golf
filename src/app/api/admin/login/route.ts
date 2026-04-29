import { NextRequest } from "next/server";
import { signAdminToken, COOKIE_NAME } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const { username, password } = await request.json();

  if (
    username !== process.env.ADMIN_USERNAME ||
    password !== process.env.ADMIN_PASSWORD
  ) {
    return Response.json({ error: "아이디 또는 비밀번호가 틀렸습니다." }, { status: 401 });
  }

  const token = await signAdminToken();

  const response = Response.json({ ok: true });
  const headers = new Headers(response.headers);
  headers.append(
    "Set-Cookie",
    `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${7 * 24 * 3600}`
  );

  return new Response(response.body, { status: 200, headers });
}
