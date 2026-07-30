import { NextResponse } from "next/server";
import { getPublicUpcomingSchedule } from "../../../../lib/schedule/service";
import type { PublicScheduleEvent } from "../../../../types/schedule";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const CACHE_CONTROL = "no-store, max-age=0";

type ScheduleApiResponse = {
  data: PublicScheduleEvent[] | null;
  source: "schedule";
  error?: string;
};

export async function GET() {
  try {
    const data = await getPublicUpcomingSchedule();
    return NextResponse.json<ScheduleApiResponse>(
      { data, source: "schedule" },
      { status: 200, headers: { "Cache-Control": CACHE_CONTROL } },
    );
  } catch {
    return NextResponse.json<ScheduleApiResponse>(
      {
        data: null,
        source: "schedule",
        error: "L’agenda est temporairement indisponible.",
      },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}
