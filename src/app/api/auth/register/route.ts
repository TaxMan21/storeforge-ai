import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { registerSchema } from "@/lib/validation";
import { signAccessToken, signRefreshToken } from "@/lib/auth/tokens";
import { cookieOptions, getAccessCookieName, getRefreshCookieName } from "@/lib/auth/session";
import { ok, fail, parseBody, getIP, getUserAgent, serverError } from "@/lib/api/response";
import { authRateLimit, rateLimitHeaders } from "@/lib/rate-limit";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  const ip = getIP(request);
  const rl = authRateLimit(ip);

  if (!rl.allowed) {
    return fail("Too many requests. Try again later.", 429);
  }

  const body = await parseBody(request);
  if (!body) return fail("Invalid request body");

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message || "Validation failed");
  }

  const { name, email, password } = parsed.data;

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return fail("An account with this email already exists", 409);
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        subscription: {
          create: { plan: "FREE", status: "ACTIVE" },
        },
      },
      select: { id: true, email: true, name: true, role: true },
    });

    const accessToken = await signAccessToken(user.id, user.email, user.role);
    const refreshToken = await signRefreshToken(user.id);

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "REGISTER",
        resource: "User",
        resourceId: user.id,
        ipAddress: ip,
        userAgent: getUserAgent(request),
      },
    });

    const response = ok({ user }, 201);
    response.headers.append(
      "Set-Cookie",
      `sf_access=${accessToken}; ${Object.entries(cookieOptions(900)).map(([k, v]) => `${k}=${v}`).join("; ")}`
    );
    response.headers.append(
      "Set-Cookie",
      `sf_refresh=${refreshToken}; ${Object.entries(cookieOptions(604800)).map(([k, v]) => `${k}=${v}`).join("; ")}`
    );

    return response;
  } catch (error) {
    console.error("[Register]", error);
    return serverError();
  }
}
