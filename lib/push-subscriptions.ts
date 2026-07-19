import "server-only";

import { createHash, randomBytes } from "node:crypto";

export const PUSH_OWNER_COOKIE = "tv_news_push_owner";
export type PushScope = "all" | "breaking_only";
export type PushBody = { endpoint: string; keys: { p256dh: string; auth: string }; scope?: PushScope };
export const hashOwnerToken = (token: string) => createHash("sha256").update(token).digest("hex");
export const createOwnerToken = () => randomBytes(32).toString("base64url");

export function validatePushBody(value: unknown): PushBody {
  if (!value || typeof value !== "object") throw new Error("invalid");
  const body = value as Partial<PushBody>;
  if (typeof body.endpoint !== "string" || body.endpoint.length > 4096) throw new Error("invalid");
  const url = new URL(body.endpoint);
  if (url.protocol !== "https:") throw new Error("invalid");
  const p256dh = body.keys?.p256dh; const auth = body.keys?.auth;
  if (!p256dh || p256dh.length > 512 || !auth || auth.length > 512) throw new Error("invalid");
  const scope = body.scope ?? "all";
  if (scope !== "all" && scope !== "breaking_only") throw new Error("invalid");
  return { endpoint: url.toString(), keys: { p256dh, auth }, scope };
}

export function isAllowedPushOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const allowed = process.env.NODE_ENV === "production" ? "https://www.bichridigital.com" : "http://localhost:3000";
  return origin === allowed;
}
