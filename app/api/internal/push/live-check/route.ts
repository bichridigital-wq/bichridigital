import { checkLiveStartAutomation } from "@/lib/push/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || request.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return Response.json({ ok: false }, { status: 401 });
  }

  try {
    const result = await checkLiveStartAutomation();
    return Response.json({ ok: true, ...result });
  } catch {
    return Response.json({ ok: false, outcome: "internal_error" }, { status: 500 });
  }
}
