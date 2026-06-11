import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { ok, fail, serverError } from "@/lib/api/response";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id: orderId, status } = body;

    if (!orderId || !status) {
      return fail("Missing orderId or status");
    }

    const subscription = await prisma.subscription.findFirst({
      where: { paypalSubscriptionId: orderId },
    });

    if (!subscription) {
      // Also try to find by paypalOrderId in billing history
      return ok({ received: true });
    }

    let newStatus: "ACTIVE" | "CANCELED" | "PAST_DUE" = "ACTIVE";
    if (status === "CANCELLED" || status === "canceled") newStatus = "CANCELED";
    if (status === "PAST_DUE" || status === "past_due") newStatus = "PAST_DUE";

    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { status: newStatus },
    });

    await prisma.auditLog.create({
      data: {
        action: "PAYPAL_WEBHOOK",
        resource: "Subscription",
        resourceId: subscription.id,
        details: { orderId, status },
      },
    });

    return ok({ processed: true });
  } catch (error) {
    console.error("[Webhook/PayPal]", error);
    return serverError();
  }
}
