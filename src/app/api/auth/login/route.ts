import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { loginSchema } from "@/lib/validation";
import { signAccessToken, signRefreshToken } from "@/lib/auth/tokens";
import { cookieOptions } from "@/lib/auth/session";
import { ok, fail, parseBody, getIP, getUserAgent, serverError } from "@/lib/api/response";
import { authRateLimit } from "@/lib/rate-limit";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  const ip = getIP(request);
  const rl = authRateLimit(ip);

  if (!rl.allowed) {
    return fail("Too many login attempts. Try again in 15 minutes.", 429);
  }

  const body = await parseBody(request);
  if (!body) return fail("Invalid request body");

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message || "Validation failed");
  }

  const { email, password } = parsed.data;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true, role: true, passwordHash: true, emailVerified: true },
    });

    if (!user || !user.passwordHash) {
      return fail("Invalid email or password", 401);
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return fail("Invalid email or password", 401);
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: user.emailVerified || new Date() },
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

    await prisma.session.create({
      data: {
        userId: user.id,
        ipAddress: ip,
        userAgent: getUserAgent(request),
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "LOGIN",
        resource: "User",
        resourceId: user.id,
        ipAddress: ip,
        userAgent: getUserAgent(request),
      },
    });

    const response = ok({
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });

    const accessCookie = `sf_access=${accessToken}; ${Object.entries(cookieOptions(900)).map(([k, v]) => `${k}=${v}`).join("; ")}`;
    const refreshCookie = `sf_refresh=${refreshToken}; ${Object.entries(cookieOptions(604800)).map(([k, v]) => `${k}=${v}`).join("; ")}`;
    response.headers.append("Set-Cookie", accessCookie);
    response.headers.append("Set-Cookie", refreshCookie);

    return response;
  } catch (error) {
    console.error("[Login]", error);
    return serverError();
  }
}
