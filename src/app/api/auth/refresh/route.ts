import { NextRequest } from "next/server";
import { verifyRefreshToken, signAccessToken, signRefreshToken } from "@/lib/auth/tokens";
import { prisma } from "@/lib/db";
import { cookieOptions } from "@/lib/auth/session";
import { ok, fail, serverError } from "@/lib/api/response";

export async function POST(request: NextRequest) {
  try {
    const refreshToken = request.cookies.get("sf_refresh")?.value;
    if (!refreshToken) {
      return fail("No refresh token", 401);
    }

    const payload = await verifyRefreshToken(refreshToken);
    if (!payload || !payload.sub) {
      return fail("Invalid refresh token", 401);
    }

    const stored = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    });

    if (!stored || stored.expiresAt < new Date()) {
      return fail("Refresh token expired", 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, name: true, role: true },
    });

    if (!user) {
      return fail("User not found", 401);
    }

    await prisma.refreshToken.delete({ where: { id: stored.id } });

    const newAccess = await signAccessToken(user.id, user.email, user.role);
    const newRefresh = await signRefreshToken(user.id);

    await prisma.refreshToken.create({
      data: {
        token: newRefresh,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    const response = ok({ user });
    response.headers.append(
      "Set-Cookie",
      `sf_access=${newAccess}; ${Object.entries(cookieOptions(900)).map(([k, v]) => `${k}=${v}`).join("; ")}`
    );
    response.headers.append(
      "Set-Cookie",
      `sf_refresh=${newRefresh}; ${Object.entries(cookieOptions(604800)).map(([k, v]) => `${k}=${v}`).join("; ")}`
    );

    return response;
  } catch (error) {
    console.error("[Refresh]", error);
    return serverError();
  }
}
