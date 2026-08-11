import { requireAuthenticatedUser } from "../../../lib/account/auth";
import { accountApiError, accountJson } from "../../../lib/account/http";
import { enforceAccountRateLimit, getMe, patchMe } from "../../../lib/account/service";
import { readAccountJson, validateProfileUpdate } from "../../../lib/account/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const user = await requireAuthenticatedUser(request);
    await enforceAccountRateLimit(user.id, "me_get");
    return accountJson(await getMe(user));
  } catch (error) { return accountApiError(error); }
}

export async function PATCH(request: Request) {
  try {
    const user = await requireAuthenticatedUser(request);
    await enforceAccountRateLimit(user.id, "me_update");
    const profile = await patchMe(user, validateProfileUpdate(await readAccountJson(request)));
    return accountJson({ profile });
  } catch (error) { return accountApiError(error); }
}
