import { NextRequest } from "next/server";
import { getAuthPayload } from "@/lib/auth";
import { requirePaidPlan, AuthError } from "@/lib/auth/guards";
import { prisma } from "@/lib/db";
import { ok, fail, serverError } from "@/lib/api/response";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await getAuthPayload();
    if (!payload) return fail("Unauthorized", 401);

    const { user } = await requirePaidPlan(payload);

    const { id } = await params;

    const project = await prisma.storeProject.findFirst({
      where: { id, userId: user.id },
      include: {
        questionnaireAnswers: true,
        selectedProducts: {
          include: { productCandidate: true },
          orderBy: { sortOrder: "asc" },
        },
        storePages: { orderBy: { sortOrder: "asc" } },
        integrations: true,
        aiRecommendations: { orderBy: { createdAt: "desc" }, take: 20 },
        optimizationScores: true,
        marketingAssets: { orderBy: { createdAt: "desc" }, take: 20 },
      },
    });

    if (!project) return fail("Project not found", 404);

    return ok({ project });
  } catch (error) {
    if (error instanceof AuthError) return fail(error.message, error.status);
    console.error("[StoreProjects/[id]]", error);
    return serverError();
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await getAuthPayload();
    if (!payload) return fail("Unauthorized", 401);

    const { user } = await requirePaidPlan(payload);

    const { id } = await params;
    const body = await request.json();

    const project = await prisma.storeProject.findFirst({
      where: { id, userId: user.id },
    });

    if (!project) return fail("Project not found", 404);

    const updated = await prisma.storeProject.update({
      where: { id },
      data: {
        name: body.name ?? undefined,
        platform: body.platform ?? undefined,
        status: body.status ?? undefined,
        blueprintData: body.blueprintData ?? undefined,
        settings: body.settings ?? undefined,
        customDomain: body.customDomain ?? undefined,
        liveUrl: body.liveUrl ?? undefined,
      },
    });

    return ok({ project: updated });
  } catch (error) {
    if (error instanceof AuthError) return fail(error.message, error.status);
    console.error("[StoreProjects/[id]/PATCH]", error);
    return serverError();
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await getAuthPayload();
    if (!payload) return fail("Unauthorized", 401);

    const { user } = await requirePaidPlan(payload);

    const { id } = await params;

    const project = await prisma.storeProject.findFirst({
      where: { id, userId: user.id },
    });

    if (!project) return fail("Project not found", 404);

    await prisma.storeProject.delete({ where: { id } });

    return ok({ message: "Project deleted" });
  } catch (error) {
    if (error instanceof AuthError) return fail(error.message, error.status);
    console.error("[StoreProjects/[id]/DELETE]", error);
    return serverError();
  }
}
