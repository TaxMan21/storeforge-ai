import { NextRequest } from "next/server";
import { getAuthPayload } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ok, fail, serverError } from "@/lib/api/response";

export async function GET(request: NextRequest) {
  try {
    const payload = await getAuthPayload();
    if (!payload) return fail("Unauthorized", 401);

    const subscription = await prisma.subscription.findUnique({
      where: { userId: payload.sub },
      include: { billingHistory: { orderBy: { createdAt: "desc" }, take: 12 } },
    });

    return ok({ subscription: subscription || { plan: "FREE", status: "ACTIVE" } });
  } catch (error) {
    console.error("[Billing/GET]", error);
    return serverError();
  }
}
