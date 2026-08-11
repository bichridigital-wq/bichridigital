import { NextResponse } from "next/server";
import { AccountError } from "./errors";

export const ACCOUNT_NO_STORE_HEADERS = {
  "Cache-Control": "private, no-store, max-age=0",
  "CDN-Cache-Control": "no-store",
  "Vercel-CDN-Cache-Control": "no-store",
};

export function accountJson(data: unknown, init: ResponseInit = {}) {
  return NextResponse.json(data, {
    ...init,
    headers: { ...ACCOUNT_NO_STORE_HEADERS, ...init.headers },
  });
}

export function accountApiError(error: unknown) {
  if (error instanceof AccountError) {
    return accountJson({ error: { code: error.code, message: error.message } }, { status: error.status });
  }
  return accountJson(
    { error: { code: "internal_error", message: "Service temporairement indisponible." } },
    { status: 500 },
  );
}
