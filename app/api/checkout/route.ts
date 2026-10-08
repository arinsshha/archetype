import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { db } from "@/lib/db";
export async function POST(req: Request) {
  const { id } = await req.json().catch(() => ({}));
  const r = typeof id === "string" ? await db.result.findUnique({ where: { id } }) : null;
  if (!r) return NextResponse.json({ error: "Result not found" }, { status: 404 });
  if (r.paid) return NextResponse.json({ error: "Already unlocked" }, { status: 409 });
  const rz = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID!, key_secret: process.env.RAZORPAY_KEY_SECRET! });
  const amount = Number(process.env.NEXT_PUBLIC_PRICE_RUPEES || 149) * 100;
  const order = await rz.orders.create({ amount, currency: "INR", receipt: r.id });
  await db.result.update({ where: { id: r.id }, data: { orderId: order.id } });
  return NextResponse.json({ orderId: order.id, amount, keyId: process.env.RAZORPAY_KEY_ID });
}
