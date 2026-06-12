import { NextRequest } from "next/server";
import { getAuthPayload } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ok, fail, serverError } from "@/lib/api/response";

export async function GET(_request: NextRequest) {
  try {
    const payload = await getAuthPayload();
    if (!payload) return fail("Unauthorized", 401);

    const subscription = await prisma.subscription.findUnique({
      where: { userId: payload.sub },
    });

    const projectCount = await prisma.storeProject.count({
      where: { userId: payload.sub },
    });

    const projects = await prisma.storeProject.findMany({
      where: { userId: payload.sub },
      select: { id: true },
    });

    const projectIds = projects.map((p) => p.id);

    const productCount = projectIds.length > 0
      ? await prisma.selectedProduct.count({
          where: { storeProjectId: { in: projectIds } },
        })
      : 0;

    const pageCount = projectIds.length > 0
      ? await prisma.storePage.count({
          where: { storeProjectId: { in: projectIds } },
        })
      : 0;

    const integrationCount = projectIds.length > 0
      ? await prisma.integration.count({
          where: { storeProjectId: { in: projectIds } },
        })
      : 0;

    const aiUsageToday = await prisma.aIUsageLog.count({
      where: {
        userId: payload.sub,
        createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      },
    });

    return ok({
      stores: projectCount,
      products: productCount,
      pages: pageCount,
      integrations: integrationCount,
      aiGens: aiUsageToday,
    });
  } catch (error) {
    console.error("[Billing/Usage]", error);
    return serverError();
  }
}
