import { createHmac } from "crypto";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { fulfillPurchase } from "@/lib/payments";

/**
 * Paystack Webhook Handler
 * This is the ultimate source of truth for payments.
 * It ensures students get their courses even if they close the browser early.
 */
export async function POST(req: Request) {
  try {
    const body = await req.text();
    const secret = process.env.PAYSTACK_SECRET_KEY;

    if (!secret) {
      console.error("[PAYSTACK_WEBHOOK] Secret key not found in env");
      return new Response("Configuration error", { status: 500 });
    }

    // 1. Verify Paystack Signature
    const hash = createHmac("sha512", secret)
      .update(body)
      .digest("hex");

    const headerList = await headers();
    const signature = headerList.get("x-paystack-signature");

    if (hash !== signature) {
      console.error("[PAYSTACK_WEBHOOK] Invalid signature");
      return new Response("Invalid signature", { status: 401 });
    }

    const event = JSON.parse(body);

    // 2. Handle successful charge
    if (event.event === "charge.success") {
      const { reference, metadata } = event.data;
      
      // Extract IDs from the metadata we sent in the PaymentButton
      const courseId = metadata?.courseId;
      const userId = metadata?.userId;

      if (!courseId || !userId) {
        console.error("[PAYSTACK_WEBHOOK] Missing metadata in event", event.data);
        return NextResponse.json({ error: "Missing metadata" }, { status: 400 });
      }

      console.log(`[PAYSTACK_WEBHOOK] Fulfilling purchase for User: ${userId}, Course: ${courseId}`);
      
      await fulfillPurchase(userId, courseId, reference);
    }

    // Always respond with 200 to acknowledge receipt
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[PAYSTACK_WEBHOOK] Global Error:", error);
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}
