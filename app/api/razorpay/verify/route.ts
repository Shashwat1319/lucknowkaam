import { NextResponse } from "next/server";
import { validatePaymentVerification } from "razorpay/dist/utils/razorpay-utils";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, listing_id } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !listing_id) {
      return NextResponse.json({ error: "Missing verification fields" }, { status: 400 });
    }

    const isValid = validatePaymentVerification(
      { order_id: razorpay_order_id, payment_id: razorpay_payment_id },
      razorpay_signature,
      process.env.RAZORPAY_KEY_SECRET || ""
    );

    if (!isValid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from("paid_listings")
      .update({
        payment_status: "paid",
        razorpay_payment_id,
        razorpay_order_id,
      })
      .eq("id", listing_id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
