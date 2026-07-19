import { NextResponse } from "next/server";
import { createAdminClient } from "../../../../lib/supabase/admin";
import { PUSH_OWNER_COOKIE, createOwnerToken, hashOwnerToken, isAllowedPushOrigin, validatePushBody } from "../../../../lib/push-subscriptions";

export const runtime = "nodejs";
const MAX_BODY = 16 * 1024;

export async function POST(request: Request) {
  try {
    if (!isAllowedPushOrigin(request) || !request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) return NextResponse.json({ error: "Requête refusée." }, { status: 403 });
    const declared = Number(request.headers.get("content-length") ?? 0); if (declared > MAX_BODY) return NextResponse.json({ error: "Requête trop volumineuse." }, { status: 413 });
    const text = await request.text(); if (text.length > MAX_BODY) return NextResponse.json({ error: "Requête trop volumineuse." }, { status: 413 });
    const body = validatePushBody(JSON.parse(text));
    const token = createOwnerToken(); const ownerHash = hashOwnerToken(token);
    const supabase = createAdminClient();
    const { error } = await supabase.from("push_subscriptions").upsert({ endpoint: body.endpoint, p256dh: body.keys.p256dh, auth: body.keys.auth, owner_token_hash: ownerHash, user_agent: request.headers.get("user-agent")?.slice(0, 512) || null, notification_scope: body.scope, is_active: true, failure_count: 0, last_failure_at: null }, { onConflict: "endpoint" });
    if (error) throw new Error("database");
    const response = NextResponse.json({ success: true, scope: body.scope });
    response.cookies.set(PUSH_OWNER_COOKIE, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 365 });
    return response;
  } catch { return NextResponse.json({ error: "Souscription impossible." }, { status: 400 }); }
}
