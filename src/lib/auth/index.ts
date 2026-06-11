import { verifyAccessToken, type TokenPayload } from "./tokens";
import { cookies } from "next/headers";

export async function getAuthPayload(): Promise<TokenPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("sf_access")?.value;
    if (!token) return null;
    return await verifyAccessToken(token);
  } catch {
    return null;
  }
}
