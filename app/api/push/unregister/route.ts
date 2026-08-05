import { NextResponse } from "next/server";
import { pushApiError, PUSH_NO_STORE_HEADERS, readPushJson } from "../../../../lib/push/http";
import { unregisterPushInstallation } from "../../../../lib/push/service";
import { validateOwnership } from "../../../../lib/push/validation";
import { derivePushRequestRateKey } from "../../../../lib/push/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function DELETE(request: Request) {
  try {
    const input = validateOwnership(await readPushJson(request));
    await unregisterPushInstallation(
      input.installationId,
      input.expoPushToken,
      derivePushRequestRateKey(request),
    );
    return new NextResponse(null, { status: 204, headers: PUSH_NO_STORE_HEADERS });
  } catch (error) {
    return pushApiError(error);
  }
}
