import { NextResponse } from "next/server";
import {
  pushApiError,
  PUSH_NO_STORE_HEADERS,
  readPushJson,
} from "../../../../lib/push/http";
import {
  followProgramSubscription,
  unfollowProgramSubscription,
} from "../../../../lib/push/service";
import { derivePushRequestRateKey } from "../../../../lib/push/security";
import { validateProgramSubscription } from "../../../../lib/push/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(request: Request) {
  try {
    const input = validateProgramSubscription(await readPushJson(request));
    await followProgramSubscription(
      input.installationId,
      input.expoPushToken,
      input.programId,
      derivePushRequestRateKey(request),
    );
    return new NextResponse(null, {
      status: 204,
      headers: PUSH_NO_STORE_HEADERS,
    });
  } catch (error) {
    return pushApiError(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const input = validateProgramSubscription(await readPushJson(request));
    await unfollowProgramSubscription(
      input.installationId,
      input.expoPushToken,
      input.programId,
      derivePushRequestRateKey(request),
    );
    return new NextResponse(null, {
      status: 204,
      headers: PUSH_NO_STORE_HEADERS,
    });
  } catch (error) {
    return pushApiError(error);
  }
}
