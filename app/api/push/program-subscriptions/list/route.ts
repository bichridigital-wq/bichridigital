import { NextResponse } from "next/server";
import {
  pushApiError,
  PUSH_NO_STORE_HEADERS,
  readPushJson,
} from "../../../../../lib/push/http";
import { listProgramSubscriptions } from "../../../../../lib/push/service";
import { derivePushRequestRateKey } from "../../../../../lib/push/security";
import { validateOwnership } from "../../../../../lib/push/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(request: Request) {
  try {
    const input = validateOwnership(await readPushJson(request));
    const data = await listProgramSubscriptions(
      input.installationId,
      input.expoPushToken,
      derivePushRequestRateKey(request),
    );
    return NextResponse.json(data, {
      status: 200,
      headers: PUSH_NO_STORE_HEADERS,
    });
  } catch (error) {
    return pushApiError(error);
  }
}
