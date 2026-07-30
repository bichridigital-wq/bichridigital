import { NextResponse } from "next/server";
import { getPublicUpcomingSchedule } from "../../../../lib/schedule/service";
import type { PublicScheduleEvent } from "../../../../types/schedule";

export const runtime = "nodejs";

const CACHE_CONTROL = "public, s-maxage=60, stale-while-revalidate=120";

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
