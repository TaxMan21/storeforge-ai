import { NextRequest } from "next/server";
import { getAuthPayload } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ok, fail, serverError } from "@/lib/api/response";

export async function GET(request: NextRequest) {
  try {
    const payload = await getAuthPayload();
    if (!payload) return fail("Unauthorized", 401);
    if (payload.role !== "ADMIN") return fail("Forbidden", 403);

    const url = new URL(request.url);
    const search = url.searchParams.get("search") || "";
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const where = search
      ? {
          OR: [
            { email: { contains: search, mode: "insensitive" as const } },
            { name: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          updatedAt: true,
          subscription: {
            select: {
              plan: true,
              status: true,
            },
          },
          _count: {
            select: {
              storeProjects: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    return ok({
      users,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("[Admin/Users]", error);
    return serverError();
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const payload = await getAuthPayload();
    if (!payload) return fail("Unauthorized", 401);
    if (payload.role !== "ADMIN") return fail("Forbidden", 403);

    const body = await request.json();
    const { userId, role } = body;

    if (!userId || !role) return fail("userId and role are required");

    if (!["USER", "ADMIN"].includes(role)) {
      return fail("Invalid role");
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: { id: true, email: true, name: true, role: true },
    });

    await prisma.auditLog.create({
      data: {
        userId: payload.sub,
        action: "ADMIN_UPDATE_USER",
        resource: "User",
        resourceId: userId,
        details: { newRole: role },
      },
    });

    return ok({ user });
  } catch (error) {
    console.error("[Admin/Users/PATCH]", error);
    return serverError();
  }
}
