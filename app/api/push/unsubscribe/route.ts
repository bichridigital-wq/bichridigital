import { NextResponse } from "next/server";
import { createAdminClient } from "../../../../lib/supabase/admin";
import { PUSH_OWNER_COOKIE, hashOwnerToken, isAllowedPushOrigin } from "../../../../lib/push-subscriptions";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    if (!isAllowedPushOrigin(request) || !request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) return NextResponse.json({ error: "Requête refusée." }, { status: 403 });
    const token = request.headers.get("cookie")?.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${PUSH_OWNER_COOKIE}=`))?.slice(PUSH_OWNER_COOKIE.length + 1);
    if (!token || token.length > 256) return NextResponse.json({ error: "Désabonnement impossible." }, { status: 403 });
    const text = await request.text(); if (text.length > 8192) return NextResponse.json({ error: "Requête trop volumineuse." }, { status: 413 });
    const parsed = JSON.parse(text) as { endpoint?: unknown };
    if (typeof parsed.endpoint !== "string" || parsed.endpoint.length > 4096 || new URL(parsed.endpoint).protocol !== "https:") throw new Error("invalid");
    const { error } = await createAdminClient().from("push_subscriptions").update({ is_active: false }).eq("endpoint", parsed.endpoint).eq("owner_token_hash", hashOwnerToken(decodeURIComponent(token)));
    if (error) throw new Error("database");
    const response = NextResponse.json({ success: true });
    response.cookies.delete(PUSH_OWNER_COOKIE);
    return response;
  } catch { return NextResponse.json({ error: "Désabonnement impossible." }, { status: 400 }); }
}
