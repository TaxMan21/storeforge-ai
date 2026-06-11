import { NextRequest } from "next/server";
import { getAuthPayload } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ok, fail, serverError } from "@/lib/api/response";

export async function GET(request: NextRequest) {
  try {
    const payload = await getAuthPayload();
    if (!payload) return fail("Unauthorized", 401);

    const notifications = await prisma.notification.findMany({
      where: { userId: payload.sub },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const unreadCount = await prisma.notification.count({
      where: { userId: payload.sub, isRead: false },
    });

    return ok({ notifications, unreadCount });
  } catch (error) {
    console.error("[Notifications/GET]", error);
    return serverError();
  }
}
