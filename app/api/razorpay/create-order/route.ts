import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { supabaseAdmin } from "@/lib/supabase";
import { checkRateLimit } from "@/lib/rate-limit";

const JOB_LISTING_PRICE_PAISE = 29900;

function getRazorpay() {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  if (!key_id || !key_secret) {
    throw new Error("Razorpay key not configured on server");
  }
  return new Razorpay({ key_id, key_secret });
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const { allowed } = checkRateLimit(ip);
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    const { listing_id } = await request.json();
    if (!listing_id) {
      return NextResponse.json({ error: "listing_id required" }, { status: 400 });
    }

    const { data: listing } = await supabaseAdmin
      .from("paid_listings")
      .select("*")
      .eq("id", listing_id)
      .single();

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }
    if (listing.payment_status === "paid") {
      return NextResponse.json({ error: "Already paid" }, { status: 400 });
    }

    const order = await getRazorpay().orders.create({
      amount: JOB_LISTING_PRICE_PAISE,
      currency: "INR",
      receipt: `listing_${listing_id}`,
      notes: {
        listing_id,
        company: listing.company_name,
      },
    });

    const { error: updateError } = await supabaseAdmin
      .from("paid_listings")
      .update({ razorpay_order_id: order.id })
      .eq("id", listing_id);

    if (updateError) {
      console.error("create-order: could not store razorpay_order_id", updateError);
    }

    const pubKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    if (!pubKey) {
      return NextResponse.json({ error: "Payment not configured" }, { status: 500 });
    }

    return NextResponse.json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: pubKey,
    });
  } catch (err) {
    console.error("create-order: error", err);
    const msg =
      err instanceof Error && err.message === "Razorpay key not configured on server"
        ? "Payment not configured: RAZORPAY_KEY_ID/RAZORPAY_KEY_SECRET missing on server"
        : "Order creation failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
