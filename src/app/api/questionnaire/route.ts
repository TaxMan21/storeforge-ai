import { NextRequest } from "next/server";
import { getAuthPayload } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { questionnaireSchema } from "@/lib/validation";
import { ok, fail, parseBody, serverError } from "@/lib/api/response";
import { generateBlueprint } from "@/lib/ai/store-builder";

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

    const blueprint = await generateBlueprint(
      savedAnswers.map((a) => ({
        questionKey: a.questionKey,
        questionText: a.questionText,
        answerValue: a.answerValue as string | number | boolean | string[],
      }))
    );

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
