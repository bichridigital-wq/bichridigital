import { NextResponse } from "next/server";
import { PushValidationError } from "./validation";
import { PushOwnershipError, PushRateLimitError } from "./errors";
export { readPushJson } from "./request";
import { PushHttpError } from "./request";
import { PushRateLimitConfigurationError } from "./security";

export const PUSH_NO_STORE_HEADERS = { "Cache-Control": "no-store" };

export function pushApiError(error: unknown) {
  if (error instanceof PushHttpError) {
    return NextResponse.json({ error: { code: error.code, message: error.message } }, { status: error.status, headers: PUSH_NO_STORE_HEADERS });
  }
  if (error instanceof PushValidationError) {
    return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: error.message } }, { status: 422, headers: PUSH_NO_STORE_HEADERS });
  }
  if (error instanceof PushRateLimitError) {
    return NextResponse.json({ error: { code: "RATE_LIMITED", message: "Trop de requêtes." } }, { status: 429, headers: PUSH_NO_STORE_HEADERS });
  }
  if (error instanceof PushRateLimitConfigurationError) {
    return NextResponse.json({ error: { code: "RATE_LIMIT_UNAVAILABLE", message: "Service temporairement indisponible." } }, { status: 503, headers: PUSH_NO_STORE_HEADERS });
  }
  if (error instanceof PushOwnershipError) {
    return NextResponse.json({ error: { code: "OWNERSHIP_MISMATCH", message: "Appareil non reconnu." } }, { status: 403, headers: PUSH_NO_STORE_HEADERS });
  }
  return NextResponse.json({ error: { code: "SERVICE_UNAVAILABLE", message: "Service de notifications indisponible." } }, { status: 503, headers: PUSH_NO_STORE_HEADERS });
}
