import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { ok, fail, getIP, getUserAgent, serverError } from "@/lib/api/response";
import { cookieOptions } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  try {
    const refreshToken = request.cookies.get("sf_refresh")?.value;

    if (refreshToken) {
      const stored = await prisma.refreshToken.findUnique({
        where: { token: refreshToken },
      });
      if (stored) {
        await prisma.refreshToken.delete({ where: { id: stored.id } });
      }

      await prisma.auditLog.create({
        data: {
          action: "LOGOUT",
          resource: "User",
          ipAddress: getIP(request),
          userAgent: getUserAgent(request),
        },
      });
    }

    const response = ok({ message: "Logged out" });

    const expiredCookie = (name: string) =>
      `${name}=; ${Object.entries({ ...cookieOptions(0), maxAge: 0 }).map(([k, v]) => `${k}=${v}`).join("; ")}`;

    response.headers.append("Set-Cookie", expiredCookie("sf_access"));
    response.headers.append("Set-Cookie", expiredCookie("sf_refresh"));

    return response;
  } catch (error) {
    console.error("[Logout]", error);
    return serverError();
  }
}
