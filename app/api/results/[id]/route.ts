import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { buildReport } from "@/lib/score";
export const dynamic = "force-dynamic";
export async function GET(_: Request, { params }: { params: { id: string } }) {
  const r = await db.result.findUnique({ where: { id: params.id } });
  if (!r) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(buildReport(JSON.parse(r.sums), r.paid));
}
