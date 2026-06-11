import { NextRequest } from "next/server";
import { getAuthPayload } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ok, fail, serverError } from "@/lib/api/response";
import { pageUpdateSchema } from "@/lib/validation";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await getAuthPayload();
    if (!payload) return fail("Unauthorized", 401);

    const { id } = await params;

    const page = await prisma.storePage.findFirst({
      where: { id, storeProject: { userId: payload.sub } },
    });

    if (!page) return fail("Page not found", 404);

    return ok({ page });
  } catch (error) {
    console.error("[Pages/[id]/GET]", error);
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

    const { id } = await params;
    const body = await request.json();

    const page = await prisma.storePage.findFirst({
      where: { id, storeProject: { userId: payload.sub } },
    });

    if (!page) return fail("Page not found", 404);

    const updated = await prisma.storePage.update({
      where: { id },
      data: {
        title: body.title ?? undefined,
        content: body.content ?? undefined,
        seoTitle: body.seoTitle ?? undefined,
        seoDescription: body.seoDescription ?? undefined,
        isPublished: body.isPublished ?? undefined,
      },
    });

    return ok({ page: updated });
  } catch (error) {
    console.error("[Pages/[id]/PATCH]", error);
    return serverError();
  }
}
