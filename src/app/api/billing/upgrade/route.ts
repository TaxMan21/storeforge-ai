import { NextRequest } from "next/server";
import { getAuthPayload } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { subscriptionSchema } from "@/lib/validation";
import { ok, fail, parseBody, serverError } from "@/lib/api/response";

export async function POST(request: NextRequest) {
  try {
    const payload = await getAuthPayload();
    if (!payload) return fail("Unauthorized", 401);

    const body = await parseBody(request);
    if (!body) return fail("Invalid body");

    const parsed = subscriptionSchema.safeParse(body);
    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message || "Invalid plan");
    }

    const { plan } = parsed.data;

    const subscription = await prisma.subscription.findUnique({
      where: { userId: payload.sub },
    });

    if (!subscription) return fail("Subscription not found");

    const updated = await prisma.subscription.update({
      where: { userId: payload.sub },
      data: {
        plan: plan as any,
        status: "ACTIVE",
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: payload.sub,
        action: "SUBSCRIPTION_CHANGE",
        resource: "Subscription",
        resourceId: updated.id,
        details: { previousPlan: subscription.plan, newPlan: plan },
      },
    });

    return ok({ subscription: updated });
  } catch (error) {
    console.error("[Billing/Upgrade]", error);
    return serverError();
  }
}
