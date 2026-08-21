import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { supabaseAdmin } from "@/lib/supabase";

const JOB_LISTING_PRICE_PAISE = 29900;

let validatePaymentVerification: ((params: { order_id: string; payment_id: string }, signature: string, secret: string) => boolean) | null = null;

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const mod = require("razorpay/dist/utils/razorpay-utils");
  validatePaymentVerification = mod.validatePaymentVerification;
} catch {
  console.error("verify: razorpay-utils import failed");
}

function getRazorpay() {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  if (!key_id || !key_secret) {
    throw new Error("Razorpay key not configured on server");
  }
  return new Razorpay({ key_id, key_secret });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, listing_id } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !listing_id) {
      return NextResponse.json({ error: "Missing verification fields" }, { status: 400 });
    }

    if (!validatePaymentVerification) {
      return NextResponse.json({ error: "Verification not available" }, { status: 500 });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      return NextResponse.json({ error: "Payment not configured" }, { status: 500 });
    }

    const isValid = validatePaymentVerification(
      { order_id: razorpay_order_id, payment_id: razorpay_payment_id },
      razorpay_signature,
      secret
    );

    if (!isValid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const { data: listing, error: fetchError } = await supabaseAdmin
      .from("paid_listings")
      .select("*")
      .eq("id", listing_id)
      .single();

    if (fetchError || !listing) {
      console.error("Verify: listing not found", fetchError);
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    if (listing.payment_status === "paid") {
      return NextResponse.json({ error: "Already processed" }, { status: 400 });
    }

    if (listing.razorpay_order_id && listing.razorpay_order_id !== razorpay_order_id) {
      return NextResponse.json({ error: "Order does not match listing" }, { status: 400 });
    }

    let orderAmount = JOB_LISTING_PRICE_PAISE;
    let orderCurrency = "INR";
    let orderListingId = listing_id;
    try {
      const order = await getRazorpay().orders.fetch(razorpay_order_id);
      orderAmount = Number(order.amount);
      orderCurrency = order.currency;
      orderListingId = String(order.notes?.listing_id || listing_id);
    } catch (e) {
      console.error("Verify: could not fetch order", e);
    }

    if (orderAmount !== JOB_LISTING_PRICE_PAISE || orderCurrency !== "INR") {
      return NextResponse.json({ error: "Invalid order amount" }, { status: 400 });
    }

    if (orderListingId !== listing_id) {
      return NextResponse.json({ error: "Order does not belong to this listing" }, { status: 400 });
    }

    const { error: updateError } = await supabaseAdmin
      .from("paid_listings")
      .update({
        payment_status: "paid",
        razorpay_payment_id,
        razorpay_order_id,
      })
      .eq("id", listing_id);

    if (updateError) {
      console.error("Verify: update failed", updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    const city = listing.location_area || "India";
    const jobCategory = listing.category || "computer";

    const { data: existing } = await supabaseAdmin
      .from("jobs")
      .select("id")
      .eq("company_name", listing.company_name || "Unknown")
      .eq("title_hindi", listing.job_title)
      .eq("location_area", city)
      .maybeSingle();

    if (!existing) {
      const { error: insertError } = await supabaseAdmin
        .from("jobs")
        .insert({
          title_hindi: listing.job_title,
          title_english: listing.job_title,
          slug: `${listing.job_title?.toLowerCase().replace(/\s+/g, "-") || "job"}-${city.toLowerCase().replace(/\s+/g, "-") || "india"}-${Date.now()}`,
          description_hindi: listing.job_description || "",
          company_name: listing.company_name || "Unknown",
          location_area: city,
          category: jobCategory,
          salary_text_hindi: listing.salary || "",
          contact_number: listing.whatsapp_number || listing.contact_phone || "",
          source: "paid-listing",
          is_active: true,
          is_featured: true,
          posted_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          views: 0,
        });

      if (insertError) {
        console.error("Verify: job insert failed", insertError);
        return NextResponse.json({ error: insertError.message }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Verify: unexpected error", err);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}