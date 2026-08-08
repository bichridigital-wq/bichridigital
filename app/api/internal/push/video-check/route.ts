import { hasValidCronAuthorization } from "@/lib/push/cron-auth";
import { checkVideoPublishedAutomation } from "@/lib/push/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  if (!hasValidCronAuthorization(request)) {
    return Response.json({ ok: false, outcome: "unauthorized" }, { status: 401 });
  }

  try {
    const result = await checkVideoPublishedAutomation();
    return Response.json({ ok: true, ...result });
  } catch {
    return Response.json({ ok: false, outcome: "error" }, { status: 500 });
  }
}
