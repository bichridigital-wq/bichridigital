import { requireAuthenticatedUser } from "../../../../lib/account/auth";
import { accountApiError, accountJson } from "../../../../lib/account/http";
import { enforceAccountRateLimit, getUserProgramSubscriptions } from "../../../../lib/account/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const user = await requireAuthenticatedUser(request);
    await enforceAccountRateLimit(user.id, "me_program_subscriptions_list");
    return accountJson(await getUserProgramSubscriptions(user.id));
  } catch (error) { return accountApiError(error); }
}
