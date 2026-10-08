import { NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";
// Marks a result paid ONLY if Razorpay's signature checks out against our secret.
export async function POST(req: Request) {
  const b = await req.json().catch(() => ({}));
  const r = typeof b.id === "string" ? await db.result.findUnique({ where: { id: b.id } }) : null;
  if (!r || !r.orderId || r.orderId !== b.razorpay_order_id) return NextResponse.json({ ok: false }, { status: 400 });
  const expected = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!).update(`${r.orderId}|${b.razorpay_payment_id}`).digest("hex");
  const got = String(b.razorpay_signature || "");
  const ok = got.length === expected.length && crypto.timingSafeEqual(Buffer.from(got), Buffer.from(expected));
  if (!ok) return NextResponse.json({ ok: false }, { status: 400 });
  await db.result.update({ where: { id: r.id }, data: { paid: true, paymentId: b.razorpay_payment_id } });
  return NextResponse.json({ ok: true });
}
