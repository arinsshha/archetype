import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { valid, sumsFrom, teaser } from "@/lib/score";
export async function POST(req: Request) {
  const { answers } = await req.json().catch(() => ({}));
  if (!valid(answers)) return NextResponse.json({ error: "Invalid answers" }, { status: 400 });
  const sums = sumsFrom(answers);
  try {
    const r = await db.result.create({ data: { sums: JSON.stringify(sums) } });
    return NextResponse.json({ id: r.id, ...teaser(sums) });
  } catch (e) {
    console.error("save failed:", e);
    return NextResponse.json({ error: "Database error: " + (e instanceof Error ? e.message.split("\n").pop() : "unknown") }, { status: 500 });
  }
}
