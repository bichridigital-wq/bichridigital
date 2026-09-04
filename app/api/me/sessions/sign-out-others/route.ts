import {
  requireAuthenticatedUser,
  requireBearerAccessToken,
  signOutOtherSessions,
} from "../../../../../lib/account/auth";
import { accountApiError, ACCOUNT_NO_STORE_HEADERS } from "../../../../../lib/account/http";
import { enforceAccountRateLimit } from "../../../../../lib/account/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(request: Request) {
  try {
    const accessToken = requireBearerAccessToken(request);
    const user = await requireAuthenticatedUser(request);
    await enforceAccountRateLimit(user.id, "me_update");
    await signOutOtherSessions(accessToken);
    return new Response(null, { status: 204, headers: ACCOUNT_NO_STORE_HEADERS });
  } catch (error) { return accountApiError(error); }
}
