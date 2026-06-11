import { NextRequest } from "next/server";
import { getAuthPayload } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { questionnaireSchema } from "@/lib/validation";
import { ok, fail, parseBody, serverError } from "@/lib/api/response";
import { generateBlueprint } from "@/lib/ai/store-builder";

function getDefaultBlueprintFromAnswers(answers: any[]) {
  const nicheAnswer = answers.find((a) => a.questionKey === "niche");
  const styleAnswer = answers.find((a) => a.questionKey === "brand_style");
  const niche = typeof nicheAnswer?.answerValue === "string" ? nicheAnswer.answerValue : "General";
  const style = typeof styleAnswer?.answerValue === "string" ? styleAnswer.answerValue : "modern";

  return {
    storeName: `${niche} Store`,
    logoConcept: { description: `Modern logo for ${niche} ecommerce store`, style, iconSuggestion: `A clean icon representing ${niche}` },
    brandColors: { primary: "#1a1a2e", secondary: "#16213e", accent: "#e94560", background: "#ffffff", text: "#1a1a2e" },
    fonts: { heading: "Inter", body: "Inter", accent: "Playfair Display" },
    brandVoice: `Professional and trustworthy, focused on ${niche}`,
    homepageSections: [
      { type: "hero", title: `Welcome to ${niche}`, description: "Premium products curated for you", elements: ["CTA button", "hero image"] },
      { type: "featured", title: "Featured Products", description: "Our top picks", elements: ["product grid"] },
      { type: "benefits", title: "Why Choose Us", description: "Quality guaranteed", elements: ["trust badges", "icons"] },
      { type: "reviews", title: "Customer Reviews", description: "Real feedback", elements: ["testimonial cards"] },
    ],
    pageSlugs: ["home", "shop", "about", "contact", "faq", "shipping-policy", "return-policy", "privacy-policy", "terms-of-service"],
    recommendedIntegrations: ["PayPal", "Google Analytics 4", "Klaviyo", "Meta Pixel"],
    productStrategy: { count: 15, priceRange: "$20-$80", categories: [niche] },
  };
}

export async function POST(request: NextRequest) {
  try {
    const payload = await getAuthPayload();
    if (!payload) return fail("Unauthorized", 401);

    const body = await parseBody(request);
    if (!body) return fail("Invalid body");

    const parsed = questionnaireSchema.safeParse(body);
    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message || "Validation failed");
    }

    const { storeProjectId, answers } = parsed.data;

    const project = await prisma.storeProject.findFirst({
      where: { id: storeProjectId, userId: payload.sub },
    });

    if (!project) return fail("Project not found", 404);

    await prisma.questionnaireAnswer.deleteMany({
      where: { storeProjectId },
    });

    await prisma.questionnaireAnswer.createMany({
      data: answers.map((a) => ({
        storeProjectId,
        questionKey: a.questionKey,
        questionText: a.questionText,
        answerValue: a.answerValue,
      })),
    });

    await prisma.storeProject.update({
      where: { id: storeProjectId },
      data: { status: "QUESTIONNAIRE_COMPLETE" },
    });

    const savedAnswers = await prisma.questionnaireAnswer.findMany({
      where: { storeProjectId },
    });

    let blueprint;
    try {
      blueprint = await generateBlueprint(
        savedAnswers.map((a) => ({
          questionKey: a.questionKey,
          questionText: a.questionText,
          answerValue: a.answerValue as string | number | boolean | string[],
        }))
      );
    } catch {
      blueprint = getDefaultBlueprintFromAnswers(savedAnswers);
    }

    await prisma.storeProject.update({
      where: { id: storeProjectId },
      data: {
        blueprintData: blueprint as any,
        status: "BLUEPRINT_GENERATED",
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: payload.sub,
        action: "QUESTIONNAIRE_COMPLETE",
        resource: "StoreProject",
        resourceId: storeProjectId,
        details: { answerCount: answers.length },
      },
    });

    return ok({ blueprint });
  } catch (error) {
    console.error("[Questionnaire/POST]", error);
    return serverError();
  }
}
