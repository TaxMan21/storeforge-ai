import { prisma } from "@/lib/db";
import { type TokenPayload } from "./tokens";

export async function requireAuth(payload: TokenPayload | null) {
  if (!payload) throw new AuthError("Unauthorized", 401);
  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: { id: true, email: true, name: true, role: true, avatarUrl: true },
  });
  if (!user) throw new AuthError("Unauthorized", 401);
  return user;
}

export async function requireAdmin(payload: TokenPayload | null) {
  const user = await requireAuth(payload);
  if (user.role !== "ADMIN") throw new AuthError("Forbidden", 403);
  return user;
}

export async function requirePaidPlan(payload: TokenPayload | null) {
  const user = await requireAuth(payload);
  const subscription = await prisma.subscription.findUnique({
    where: { userId: user.id },
    select: { plan: true, status: true },
  });

  const plan = subscription?.plan || "FREE";
  const status = subscription?.status || "ACTIVE";

  if (plan === "FREE" || status !== "ACTIVE") {
    throw new AuthError("Paid plan required to access this feature. Please upgrade your subscription.", 403);
  }

  return { user, subscription: { plan, status } };
}

export class AuthError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}
