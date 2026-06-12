import { NextRequest } from "next/server";
import { getAuthPayload } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ok, fail, serverError } from "@/lib/api/response";
import { runAgent } from "@/lib/ai/agents";
import { getPlanLimits } from "@/lib/subscription-limits";

export async function POST(request: NextRequest) {
  try {
    const payload = await getAuthPayload();
    if (!payload) return fail("Unauthorized", 401);

    const body = await request.json();
    const { storeProjectId, agentType, prompt } = body;

    if (!storeProjectId || !agentType || !prompt) {
      return fail("storeProjectId, agentType, and prompt are required");
    }

    const validAgents = [
      "store_strategy", "product_research", "branding", "web_design",
      "seo", "conversion", "marketing", "integration_setup", "compliance", "launch_checklist",
    ];

    if (!validAgents.includes(agentType)) {
      return fail("Invalid agent type");
    }

    const project = await prisma.storeProject.findFirst({
      where: { id: storeProjectId, userId: payload.sub },
      include: {
        questionnaireAnswers: true,
        selectedProducts: { include: { productCandidate: true } },
      },
    });

    if (!project) return fail("Project not found", 404);

    const subscription = await prisma.subscription.findUnique({
      where: { userId: payload.sub },
    });

    const plan = subscription?.plan || "FREE";
    const limits = getPlanLimits(plan);

    if (!limits.aiAgentsAccess.includes(agentType)) {
      return fail(`Your ${plan} plan does not include the ${agentType} agent. Please upgrade to access this agent.`, 403);
    }

    const usageToday = await prisma.aIUsageLog.count({
      where: {
        userId: payload.sub,
        createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      },
    });

    if (usageToday >= limits.aiGenerationsPerDay) {
      return fail(`AI usage limit reached for today (${limits.aiGenerationsPerDay} for ${plan} plan). Please upgrade or try again tomorrow.`, 403);
    }

    const context = {
      storeProject: {
        name: project.name,
        platform: project.platform,
        status: project.status,
        blueprintData: project.blueprintData,
      },
      questionnaireAnswers: project.questionnaireAnswers.map((a) => ({
        key: a.questionKey,
        value: a.answerValue,
      })),
      selectedProducts: project.selectedProducts.map((p) => ({
        name: p.customName || p.productCandidate?.name,
        price: p.sellingPrice,
      })),
    };

    const startTime = Date.now();
    let result;
    try {
      result = await runAgent(agentType as any, prompt, context);
    } catch {
      result = {
        content: `AI generation is temporarily unavailable. Your request for "${agentType}" has been noted. Please try again in a few minutes.`,
        tokens: 0,
        model: "unavailable",
      };
    }
    const duration = Date.now() - startTime;

    await prisma.aIUsageLog.create({
      data: {
        userId: payload.sub,
        agentType,
        tokens: result.tokens,
        model: result.model,
        duration,
        success: true,
      },
    });

    await prisma.aIRecommendation.create({
      data: {
        storeProjectId,
        agentType,
        assetType: "HOMEPAGE_COPY",
        content: { response: result.content, tokens: result.tokens },
      },
    });

    return ok({
      response: result.content,
      tokens: result.tokens,
      model: result.model,
      duration,
      usage: { current: usageToday + 1, limit: limits.aiGenerationsPerDay },
    });
  } catch (error) {
    console.error("[AI/Generate]", error);
    return serverError();
  }
}
