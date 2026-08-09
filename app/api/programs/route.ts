import { NextResponse } from "next/server";
import { getActiveProgramsPublic } from "../../../lib/programs/service";
import type { PublicBroadcastProgram } from "../../../types/program";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const CACHE_CONTROL = "public, s-maxage=300, stale-while-revalidate=600";

type ProgramsApiResponse = {
  data: PublicBroadcastProgram[] | null;
  source: "programs";
  error?: string;
};

export async function GET() {
  try {
    const data = await getActiveProgramsPublic();
    return NextResponse.json<ProgramsApiResponse>(
      { data, source: "programs" },
      { status: 200, headers: { "Cache-Control": CACHE_CONTROL } },
    );
  } catch {
    return NextResponse.json<ProgramsApiResponse>(
      {
        data: null,
        source: "programs",
        error: "Le catalogue est temporairement indisponible.",
      },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}
