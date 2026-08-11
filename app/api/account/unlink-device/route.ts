import { requireAuthenticatedUser } from "../../../../lib/account/auth";
import { accountApiError, accountJson } from "../../../../lib/account/http";
import { enforceAccountRateLimit, unlinkDevice } from "../../../../lib/account/service";
import { readAccountJson, validateDeviceProof } from "../../../../lib/account/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(request: Request) {
  try {
    const user = await requireAuthenticatedUser(request);
    await enforceAccountRateLimit(user.id, "account_unlink_device");
    const input = validateDeviceProof(await readAccountJson(request));
    return accountJson(await unlinkDevice(user.id, input));
  } catch (error) { return accountApiError(error); }
}
