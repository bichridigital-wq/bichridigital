import { NextResponse } from "next/server";
import { pushApiError, PUSH_NO_STORE_HEADERS, readPushJson } from "../../../../lib/push/http";
import { updatePushPreferences } from "../../../../lib/push/service";
import { validatePreferenceUpdate } from "../../../../lib/push/validation";
import { derivePushRequestRateKey } from "../../../../lib/push/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function PATCH(request: Request) {
  try {
    const input = validatePreferenceUpdate(await readPushJson(request));
    await updatePushPreferences(
      input.installationId,
      input.expoPushToken,
      input.preferences,
      derivePushRequestRateKey(request),
    );
    return new NextResponse(null, { status: 204, headers: PUSH_NO_STORE_HEADERS });
  } catch (error) {
    return pushApiError(error);
  }
}
