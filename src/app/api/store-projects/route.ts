import { NextRequest } from "next/server";
import { getAuthPayload } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { storeProjectSchema } from "@/lib/validation";
import { ok, fail, parseBody, serverError } from "@/lib/api/response";
import { requireAuth } from "@/lib/auth/guards";
import { ipRateLimit, rateLimitHeaders } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  try {
    const payload = await getAuthPayload();
    const user = await requireAuth(payload);

    const projects = await prisma.storeProject.findMany({
      where: { userId: user.id },
      include: {
        _count: { select: { selectedProducts: true, integrations: true } },
        optimizationScores: { select: { category: true, score: true } },
      },
      orderBy: { updatedAt: "desc" },
    });

    return ok({ projects });
  } catch (error) {
    console.error("[StoreProjects/GET]", error);
    return serverError();
  }
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const rl = ipRateLimit(ip, "store-create", { windowMs: 60000, maxRequests: 5 });

  if (!rl.allowed) return fail("Rate limited", 429);

  try {
    const payload = await getAuthPayload();
    const user = await requireAuth(payload);

    const body = await parseBody(request);
    if (!body) return fail("Invalid body");

    const parsed = storeProjectSchema.safeParse(body);
    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message || "Validation failed");
    }

    const subscription = await prisma.subscription.findUnique({
      where: { userId: user.id },
    });

    const projectCount = await prisma.storeProject.count({
      where: { userId: user.id },
    });

    const limits: Record<string, number> = {
      FREE: 1,
      STARTER: 2,
      PRO: 5,
      AGENCY: 999,
    };

    const plan = (subscription?.plan || "FREE") as string;
    if (projectCount >= (limits[plan] || 1)) {
      return fail(`You've reached the maximum number of stores for your ${plan} plan. Please upgrade.`, 403);
    }

    const project = await prisma.storeProject.create({
      data: {
        userId: user.id,
        name: parsed.data.name,
        platform: parsed.data.platform,
        storeType: parsed.data.storeType,
      },
    });

    return ok({ project }, 201);
  } catch (error) {
    console.error("[StoreProjects/POST]", error);
    return serverError();
  }
}
