import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { z } from "zod";

const bodySchema = z.object({
  query: z.string().min(1),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const id = nanoid(8);
  return NextResponse.json({ id });
}

