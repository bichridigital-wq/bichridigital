import { requireAuthenticatedUser } from "../../../../../lib/account/auth";
import { accountApiError, accountJson } from "../../../../../lib/account/http";
import { enforceAccountRateLimit, reconcileUserProgramSubscriptions } from "../../../../../lib/account/service";
import { readAccountJson, validateReconcileInput } from "../../../../../lib/account/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(request: Request) {
  try {
    const user = await requireAuthenticatedUser(request);
    await enforceAccountRateLimit(user.id, "me_program_subscriptions_reconcile");
    const input = validateReconcileInput(await readAccountJson(request));
    return accountJson(await reconcileUserProgramSubscriptions(user.id, input));
  } catch (error) {
    return accountApiError(error);
  }
}
