import { requireAuthenticatedUser } from "../../../../../lib/account/auth";
import { accountApiError } from "../../../../../lib/account/http";
import { enforceAccountRateLimit, followUserProgram, unfollowUserProgram } from "../../../../../lib/account/service";
import { validateProgramId } from "../../../../../lib/account/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

type Context = { params: Promise<{ programId: string }> };

export async function PUT(request: Request, context: Context) {
  try {
    const user = await requireAuthenticatedUser(request);
    await enforceAccountRateLimit(user.id, "me_program_subscriptions_follow");
    const programId = validateProgramId((await context.params).programId);
    await followUserProgram(user.id, programId);
    return new Response(null, { status: 204, headers: { "Cache-Control": "private, no-store, max-age=0" } });
  } catch (error) { return accountApiError(error); }
}

export async function DELETE(request: Request, context: Context) {
  try {
    const user = await requireAuthenticatedUser(request);
    await enforceAccountRateLimit(user.id, "me_program_subscriptions_unfollow");
    const programId = validateProgramId((await context.params).programId);
    await unfollowUserProgram(user.id, programId);
    return new Response(null, { status: 204, headers: { "Cache-Control": "private, no-store, max-age=0" } });
  } catch (error) { return accountApiError(error); }
}
