import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { supabaseAdmin } from "@/lib/supabase";
import { checkRateLimit } from "@/lib/rate-limit";

function getRazorpay() {
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || "",
    key_secret: process.env.RAZORPAY_KEY_SECRET || "",
  });
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
      amount: 29900,
      currency: "INR",
      receipt: `listing_${listing_id}`,
      notes: {
        listing_id,
        company: listing.company_name,
      },
    });

    await supabaseAdmin
      .from("paid_listings")
      .update({ razorpay_order_id: order.id })
      .eq("id", listing_id);

    return NextResponse.json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID,
    });
  } catch {
    return NextResponse.json({ error: "Order creation failed" }, { status: 500 });
  }
}
