import { requireAuthenticatedUser } from "../../../../lib/account/auth";
import { accountApiError, accountJson } from "../../../../lib/account/http";
import { enforceAccountRateLimit, getAccountDevices } from "../../../../lib/account/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const user = await requireAuthenticatedUser(request);
    await enforceAccountRateLimit(user.id, "me_get");
    return accountJson(await getAccountDevices(user.id));
  } catch (error) { return accountApiError(error); }
}
