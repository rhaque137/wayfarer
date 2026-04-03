import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST() {
  return NextResponse.json({
    error: "PDF export wiring is scaffolded; hook this route to @react-pdf/renderer with trip fetch + template.",
  }, { status: 501 });
}

