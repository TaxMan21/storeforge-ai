import { NextRequest } from "next/server";
import { getAuthPayload } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { productSelectionSchema } from "@/lib/validation";
import { ok, fail, parseBody, serverError } from "@/lib/api/response";

export async function POST(request: NextRequest) {
  try {
    const payload = await getAuthPayload();
    if (!payload) return fail("Unauthorized", 401);

    const body = await parseBody(request);
    if (!body) return fail("Invalid body");

    const parsed = productSelectionSchema.safeParse(body);
    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message || "Validation failed");
    }

    const { storeProjectId, productCandidateId, sellingPrice, customName, customDescription, isFeatured } = parsed.data;

    const project = await prisma.storeProject.findFirst({
      where: { id: storeProjectId, userId: payload.sub },
    });

    if (!project) return fail("Project not found", 404);

    let costPrice = 0;
    if (productCandidateId) {
      const candidate = await prisma.productCandidate.findUnique({
        where: { id: productCandidateId },
      });
      if (!candidate) return fail("Product candidate not found", 404);
      costPrice = candidate.costPrice;
    }

    const selected = await prisma.selectedProduct.create({
      data: {
        storeProjectId,
        productCandidateId: productCandidateId || null,
        sellingPrice,
        costPrice,
        customName,
        customDescription,
        isFeatured,
        status: "SELECTED",
      },
      include: { productCandidate: true },
    });

    return ok({ product: selected }, 201);
  } catch (error) {
    console.error("[Products/Select]", error);
    return serverError();
  }
}

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

    const products = await prisma.selectedProduct.findMany({
      where: { storeProjectId },
      include: { productCandidate: true },
      orderBy: { sortOrder: "asc" },
    });

    return ok({ products });
  } catch (error) {
    console.error("[Products/Selected/GET]", error);
    return serverError();
  }
}
