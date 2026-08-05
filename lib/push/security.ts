import { createHash, createHmac, randomBytes } from "node:crypto";

const DEVELOPMENT_RATE_LIMIT_SECRET = randomBytes(32);

export class PushRateLimitConfigurationError extends Error {}

export function hashPushSecret(value: string) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

export function derivePushRequestRateKey(request: Request) {
  const platformAddress = request.headers.get("x-vercel-forwarded-for");
  const forwarded = platformAddress ?? (
    process.env.NODE_ENV === "production"
      ? null
      : request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip")
  );
  if (!forwarded) {
    throw new PushRateLimitConfigurationError("Trusted network address unavailable.");
  }
  const address = forwarded.split(",", 1)[0].trim().slice(0, 128) || "unavailable";
  const configuredSecret = process.env.PUSH_RATE_LIMIT_SECRET;
  if (process.env.NODE_ENV === "production" && (!configuredSecret || configuredSecret.length < 32)) {
    throw new PushRateLimitConfigurationError("Push rate-limit secret unavailable.");
  }
  const secret = configuredSecret && configuredSecret.length >= 32
    ? configuredSecret
    : DEVELOPMENT_RATE_LIMIT_SECRET;
  return createHmac("sha256", secret).update(`network:${address}`, "utf8").digest("hex");
}

export function maskPushToken(token: string | null | undefined) {
  if (!token) return "absent";
  return `••••${token.slice(-4)}`;
}

export function tokenLastFour(token: string) {
  return token.slice(-4);
}

export function safePushError(error: unknown) {
  if (error instanceof Error) {
    return error.name || "Error";
  }
  return "UnknownError";
}
