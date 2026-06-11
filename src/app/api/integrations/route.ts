import { NextRequest } from "next/server";
import { getAuthPayload } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ok, fail, serverError } from "@/lib/api/response";
import { defaultIntegrations } from "@/lib/integrations-config";

export async function GET(request: NextRequest) {
  try {
    const payload = await getAuthPayload();
    if (!payload) return fail("Unauthorized", 401);

    const url = new URL(request.url);
    const storeProjectId = url.searchParams.get("storeProjectId");
    if (!storeProjectId) return fail("storeProjectId is required");

    const project = await prisma.storeProject.findFirst({
      where: { id: storeProjectId, userId: payload.sub },
    });
    if (!project) return fail("Project not found", 404);

    const installed = await prisma.integration.findMany({
      where: { storeProjectId },
    });

    const allIntegrations = defaultIntegrations.map((di) => {
      const existing = installed.find((i) => i.name === di.name);
      return {
        ...di,
        status: existing?.status || "RECOMMENDED",
        installed: !!existing,
        config: existing?.config || null,
      };
    });

    return ok({ integrations: allIntegrations });
  } catch (error) {
    console.error("[Integrations/GET]", error);
    return serverError();
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await getAuthPayload();
    if (!payload) return fail("Unauthorized", 401);

    const body = await request.json();
    const { storeProjectId, name, category, config } = body;

    if (!storeProjectId || !name || !category) {
      return fail("storeProjectId, name, and category are required");
    }

    const project = await prisma.storeProject.findFirst({
      where: { id: storeProjectId, userId: payload.sub },
    });
    if (!project) return fail("Project not found", 404);

    const integration = await prisma.integration.upsert({
      where: { storeProjectId_name: { storeProjectId, name } },
      create: {
        storeProjectId,
        name,
        category,
        config: config || undefined,
        status: "CONNECTED",
        installedAt: new Date(),
      },
      update: {
        status: "CONNECTED",
        config: config || undefined,
        installedAt: new Date(),
      },
    });

    return ok({ integration });
  } catch (error) {
    console.error("[Integrations/POST]", error);
    return serverError();
  }
}
