import { NextRequest } from "next/server";
import { getAuthPayload } from "@/lib/auth";
import { requirePaidPlan, AuthError } from "@/lib/auth/guards";
import { prisma } from "@/lib/db";
import { researchProducts } from "@/lib/ai/product-research";
import { ok, fail, serverError } from "@/lib/api/response";

export async function POST(request: NextRequest) {
  try {
    const payload = await getAuthPayload();
    if (!payload) return fail("Unauthorized", 401);

    const { user } = await requirePaidPlan(payload);

    const body = await request.json();
    const { storeProjectId } = body;

    if (!storeProjectId) return fail("storeProjectId is required");

    const project = await prisma.storeProject.findFirst({
      where: { id: storeProjectId, userId: user.id },
      include: { questionnaireAnswers: true },
    });

    if (!project) return fail("Project not found", 404);

    const answers = project.questionnaireAnswers;
    const niche = answers.find((a) => a.questionKey === "niche")?.answerValue as string || "general";
    const ticketLevel = answers.find((a) => a.questionKey === "ticket_level")?.answerValue as string;
    const targetCountry = answers.find((a) => a.questionKey === "target_country")?.answerValue as string;
    const budget = answers.find((a) => a.questionKey === "budget")?.answerValue as number;
    const avoidProducts = answers.find((a) => a.questionKey === "avoid_products")?.answerValue as string[];

    let nicheRecord = await prisma.niche.findUnique({ where: { slug: niche.toLowerCase().replace(/\s+/g, "-") } });
    if (!nicheRecord) {
      nicheRecord = await prisma.niche.create({
        data: {
          name: niche,
          slug: niche.toLowerCase().replace(/\s+/g, "-"),
        },
      });
    }

    const products = await researchProducts(niche, {
      ticketLevel,
      targetCountry,
      budget,
      avoidProducts,
    });

    const created = await Promise.all(
      products.map((p) =>
        prisma.productCandidate.upsert({
          where: { 
            nicheId_name: { nicheId: nicheRecord.id, name: p.name }
          },
          create: {
            nicheId: nicheRecord.id,
            name: p.name,
            supplierUrl: p.supplierUrl,
            costPrice: p.costPrice,
            recommendedPrice: p.recommendedPrice,
            estimatedMargin: p.estimatedMargin,
            shippingTimeDays: p.shippingTimeDays,
            description: p.description,
            targetAudience: p.targetAudience,
            winningAngle: p.winningAngle,
            adHook: p.adHook,
            riskScore: p.riskScore,
            trendScore: p.trendScore,
            competitionScore: p.competitionScore,
            opportunityScore: p.opportunityScore,
            seoKeywords: p.seoKeywords,
            tiktokPotential: p.tiktokPotential,
          },
          update: {
            costPrice: p.costPrice,
            recommendedPrice: p.recommendedPrice,
            estimatedMargin: p.estimatedMargin,
            description: p.description,
            trendScore: p.trendScore,
            competitionScore: p.competitionScore,
            opportunityScore: p.opportunityScore,
          },
        })
      )
    );

    await prisma.storeProject.update({
      where: { id: storeProjectId },
      data: { status: "BUILDING" },
    });

    return ok({ products: created });
  } catch (error) {
    if (error instanceof AuthError) return fail(error.message, error.status);
    console.error("[Products/Research]", error);
    return serverError();
  }
}

export async function GET(request: NextRequest) {
  try {
    const payload = await getAuthPayload();
    if (!payload) return fail("Unauthorized", 401);

    const { user } = await requirePaidPlan(payload);

    const url = new URL(request.url);
    const nicheId = url.searchParams.get("nicheId");
    const storeProjectId = url.searchParams.get("storeProjectId");
    const limit = parseInt(url.searchParams.get("limit") || "20");

    const where: any = { isActive: true };

    if (nicheId) {
      where.nicheId = nicheId;
    } else if (storeProjectId) {
      const project = await prisma.storeProject.findFirst({
        where: { id: storeProjectId, userId: user.id },
        include: { questionnaireAnswers: true },
      });
      if (project) {
        const niche = project.questionnaireAnswers.find((a) => a.questionKey === "niche")?.answerValue as string;
        if (niche) {
          const slug = niche.toLowerCase().replace(/\s+/g, "-");
          const nicheRecord = await prisma.niche.findUnique({ where: { slug } });
          if (nicheRecord) where.nicheId = nicheRecord.id;
        }
      }
    }

    const products = await prisma.productCandidate.findMany({
      where,
      orderBy: { opportunityScore: "desc" },
      take: Math.min(limit, 100),
      include: { niche: true },
    });

    return ok({ products });
  } catch (error) {
    if (error instanceof AuthError) return fail(error.message, error.status);
    console.error("[Products/GET]", error);
    return serverError();
  }
}
