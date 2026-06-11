import { type NextRequest, NextResponse } from "next/server";

export function ok(data: unknown, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function fail(message: string, status = 400) {
  return NextResponse.json({ success: false, error: message }, { status });
}

export function unauthorized(message = "Unauthorized") {
  return fail(message, 401);
}

export function forbidden(message = "Forbidden") {
  return fail(message, 403);
}

export function notFound(message = "Not found") {
  return fail(message, 404);
}

export function serverError(message = "Internal server error") {
  return fail(message, 500);
}

export async function parseBody(req: NextRequest) {
  try {
    const body = await req.json();
    return body;
  } catch {
    return null;
  }
}

export function getIP(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

export function getUserAgent(req: NextRequest): string {
  return req.headers.get("user-agent") || "unknown";
}
