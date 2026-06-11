import { NextRequest } from "next/server";
import { getAuthPayload } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ok, fail, serverError } from "@/lib/api/response";

export async function GET(request: NextRequest) {
  try {
    const payload = await getAuthPayload();
    if (!payload) {
      return fail("Not authenticated", 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatarUrl: true,
        createdAt: true,
        subscription: {
          select: { plan: true, status: true, currentPeriodEnd: true },
        },
      },
    });

    if (!user) {
      return fail("User not found", 404);
    }

    return ok({ user });
  } catch (error) {
    console.error("[Auth/Me]", error);
    return serverError();
  }
}
