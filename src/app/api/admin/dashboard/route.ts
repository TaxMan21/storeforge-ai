import { NextRequest } from "next/server";
import { getAuthPayload } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ok, fail, serverError } from "@/lib/api/response";
import { requireAdmin } from "@/lib/auth/guards";

export async function GET(request: NextRequest) {
  try {
    const payload = await getAuthPayload();
    const admin = await requireAdmin(payload);

    const [
      userCount,
      projectCount,
      activeSubscriptions,
      aiUsageToday,
      recentErrors,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.storeProject.count(),
      prisma.subscription.findMany({
        where: { status: "ACTIVE", plan: { not: "FREE" } },
        select: { plan: true },
      }),
      prisma.aIUsageLog.count({
        where: {
          createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
        },
      }),
      prisma.auditLog.findMany({
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
    ]);

    return ok({
      stats: {
        totalUsers: userCount,
        totalProjects: projectCount,
        activePaidSubscriptions: activeSubscriptions.length,
        aiUsageToday,
        planBreakdown: activeSubscriptions.reduce(
          (acc, s) => ({ ...acc, [s.plan]: (acc[s.plan] || 0) + 1 }),
          {} as Record<string, number>
        ),
      },
      recentActivity: recentErrors,
    });
  } catch (error) {
    console.error("[Admin/Dashboard]", error);
    return serverError();
  }
}
