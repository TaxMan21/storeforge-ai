import { NextRequest } from "next/server";
import { getAuthPayload } from "@/lib/auth";
import { requirePaidPlan, AuthError } from "@/lib/auth/guards";
import { prisma } from "@/lib/db";
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
      include: {
        questionnaireAnswers: true,
        selectedProducts: true,
        storePages: true,
        integrations: true,
        optimizationScores: true,
      },
    });

    if (!project) return fail("Project not found", 404);

    const scores = calculateScores(project);

    await Promise.all(
      Object.entries(scores).map(([category, data]) =>
        prisma.optimizationScore.upsert({
          where: {
            storeProjectId_category: {
              storeProjectId,
              category: category as any,
            },
          },
          create: {
            storeProjectId,
            category: category as any,
            score: data.score,
            maxScore: data.maxScore,
            breakdown: data.breakdown,
            recommendations: data.recommendations,
          },
          update: {
            score: data.score,
            maxScore: data.maxScore,
            breakdown: data.breakdown,
            recommendations: data.recommendations,
            calculatedAt: new Date(),
          },
        })
      )
    );

    const updatedScores = await prisma.optimizationScore.findMany({
      where: { storeProjectId },
    });

    const overallScore = updatedScores.reduce((sum, s) => sum + s.score, 0) /
      updatedScores.reduce((sum, s) => sum + s.maxScore, 0) * 100;

    return ok({
      scores: updatedScores,
      overallScore: Math.round(overallScore),
    });
  } catch (error) {
    if (error instanceof AuthError) return fail(error.message, error.status);
    console.error("[Optimization/POST]", error);
    return serverError();
  }
}

export async function GET(request: NextRequest) {
  try {
    const payload = await getAuthPayload();
    if (!payload) return fail("Unauthorized", 401);

    const { user } = await requirePaidPlan(payload);

    const url = new URL(request.url);
    const storeProjectId = url.searchParams.get("storeProjectId");
    if (!storeProjectId) return fail("storeProjectId is required");

    const scores = await prisma.optimizationScore.findMany({
      where: { storeProjectId },
      orderBy: { calculatedAt: "desc" },
    });

    const overallScore = scores.length > 0
      ? scores.reduce((sum, s) => sum + s.score, 0) /
        scores.reduce((sum, s) => sum + s.maxScore, 0) * 100
      : 0;

    return ok({ scores, overallScore: Math.round(overallScore) });
  } catch (error) {
    if (error instanceof AuthError) return fail(error.message, error.status);
    console.error("[Optimization/GET]", error);
    return serverError();
  }
}

function calculateScores(project: any) {
  const hasQuestionnaire = project.questionnaireAnswers.length >= 5;
  const hasBlueprint = !!project.blueprintData;
  const productCount = project.selectedProducts.length;
  const pageCount = project.storePages.length;
  const integrationCount = project.integrations.length;

  return {
    STORE_READINESS: {
      score: Math.min(100,
        (hasQuestionnaire ? 25 : 0) +
        (hasBlueprint ? 25 : 0) +
        (productCount > 0 ? 25 : 0) +
        (pageCount > 3 ? 25 : 0)
      ),
      maxScore: 100,
      breakdown: { questionnaire: hasQuestionnaire, blueprint: hasBlueprint, products: productCount, pages: pageCount },
      recommendations: [
        ...(!hasQuestionnaire ? ["Complete the store questionnaire"] : []),
        ...(!hasBlueprint ? ["Generate your store blueprint"] : []),
        ...(productCount === 0 ? ["Select products for your store"] : []),
        ...(pageCount < 4 ? ["Create essential store pages"] : []),
      ],
    },
    PRODUCT_OPPORTUNITY: {
      score: Math.min(100, productCount * 10),
      maxScore: 100,
      breakdown: { selectedProducts: productCount },
      recommendations: productCount < 10 ? ["Select more products to increase opportunity score"] : ["Great product selection!"],
    },
    SEO: {
      score: Math.min(100, pageCount * 12),
      maxScore: 100,
      breakdown: { pages: pageCount },
      recommendations: pageCount < 5 ? ["Add more content pages for better SEO"] : ["SEO foundation looks good"],
    },
    CONVERSION: {
      score: Math.min(100, (productCount > 0 ? 40 : 0) + (integrationCount * 10)),
      maxScore: 100,
      breakdown: { products: productCount, integrations: integrationCount },
      recommendations: [
        ...(productCount === 0 ? ["Add products to optimize conversions"] : []),
        ...(integrationCount < 3 ? ["Install more conversion tools"] : []),
      ],
    },
    SPEED: { score: 75, maxScore: 100, breakdown: {}, recommendations: ["Test page load speed after launch"] },
    TRUST: {
      score: Math.min(100, pageCount * 15 + integrationCount * 5),
      maxScore: 100,
      breakdown: { pages: pageCount, integrations: integrationCount },
      recommendations: ["Add trust badges, reviews, and security seals"],
    },
    MARKETING: {
      score: Math.min(100, integrationCount * 15),
      maxScore: 100,
      breakdown: { integrations: integrationCount },
      recommendations: integrationCount < 4 ? ["Set up marketing integrations"] : ["Marketing foundation is strong"],
    },
  };
}
