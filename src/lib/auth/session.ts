import { cookies } from "next/headers";
import { verifyAccessToken, type TokenPayload } from "./tokens";
import { prisma } from "@/lib/db";

const ACCESS_COOKIE = "sf_access";
const REFRESH_COOKIE = "sf_refresh";

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  role: "USER" | "ADMIN";
  avatarUrl: string | null;
}

export async function getSessionUser(): Promise<AuthUser | null> {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get(ACCESS_COOKIE)?.value;
    if (!accessToken) return null;

    const payload = await verifyAccessToken(accessToken);
    if (!payload) return null;

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, name: true, role: true, avatarUrl: true },
    });
    if (!user) return null;

    return user;
  } catch {
    return null;
  }
}

export function getAccessCookieName() {
  return ACCESS_COOKIE;
}

export function getRefreshCookieName() {
  return REFRESH_COOKIE;
}

export function cookieOptions(maxAge: number) {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}
