import { requireAuthenticatedUser } from "../../../../../lib/account/auth";
import { accountApiError, ACCOUNT_NO_STORE_HEADERS } from "../../../../../lib/account/http";
import { enforceAccountRateLimit, remoteUnlinkAccountDevice } from "../../../../../lib/account/service";
import { validateAccountDeviceId } from "../../../../../lib/account/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

type Context = { params: Promise<{ deviceId: string }> };

export async function DELETE(request: Request, context: Context) {
  try {
    const user = await requireAuthenticatedUser(request);
    await enforceAccountRateLimit(user.id, "account_unlink_device");
    const deviceId = validateAccountDeviceId((await context.params).deviceId);
    await remoteUnlinkAccountDevice(user.id, deviceId);
    return new Response(null, { status: 204, headers: ACCOUNT_NO_STORE_HEADERS });
  } catch (error) { return accountApiError(error); }
}
