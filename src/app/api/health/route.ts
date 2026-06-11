import { NextRequest } from "next/server";
import { ok, fail, serverError } from "@/lib/api/response";
import { getAuthPayload } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  return ok({
    status: "healthy",
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || "0.1.0",
  });
}
