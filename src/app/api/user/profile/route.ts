import { NextRequest } from "next/server";
import { getAuthPayload } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ok, fail, parseBody, serverError } from "@/lib/api/response";
import bcrypt from "bcryptjs";

export async function PATCH(request: NextRequest) {
  try {
    const payload = await getAuthPayload();
    if (!payload) return fail("Unauthorized", 401);

    const body = await parseBody(request);
    if (!body) return fail("Invalid body");

    const { name, currentPassword, newPassword } = body;

    const updates: Record<string, any> = {};

    if (name !== undefined) {
      if (typeof name !== "string" || name.length < 1 || name.length > 100) {
        return fail("Name must be 1-100 characters");
      }
      updates.name = name.trim();
    }

    if (newPassword) {
      if (!currentPassword) return fail("Current password is required");
      if (typeof newPassword !== "string" || newPassword.length < 8) {
        return fail("New password must be at least 8 characters");
      }

      const user = await prisma.user.findUnique({
        where: { id: payload.sub },
        select: { passwordHash: true },
      });

      if (!user?.passwordHash) return fail("No password set for this account");

      const valid = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!valid) return fail("Current password is incorrect");

      updates.passwordHash = await bcrypt.hash(newPassword, 12);
    }

    if (Object.keys(updates).length === 0) {
      return fail("No valid updates provided");
    }

    const user = await prisma.user.update({
      where: { id: payload.sub },
      data: updates,
      select: { id: true, email: true, name: true, role: true, avatarUrl: true },
    });

    return ok({ user });
  } catch (error) {
    console.error("[User/Profile]", error);
    return serverError();
  }
}
