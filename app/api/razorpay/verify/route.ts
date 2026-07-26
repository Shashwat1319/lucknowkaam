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

    const { data: listing, error: fetchError } = await supabaseAdmin
      .from("paid_listings")
      .select("*")
      .eq("id", listing_id)
      .single();

    if (fetchError || !listing) {
      console.error("Verify: listing not found", fetchError);
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
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

    const { error: insertError } = await supabaseAdmin
      .from("jobs")
      .insert({
        title_hindi: listing.job_title,
        title_english: listing.job_title,
        slug: `${listing.job_title?.toLowerCase().replace(/\s+/g, "-") || "job"}-${listing.location_area?.toLowerCase().replace(/\s+/g, "-") || "india"}-${Date.now()}`,
        description_hindi: listing.job_description || "",
        company_name: listing.company_name || "Unknown",
        location_area: listing.location_area || "India",
        category: listing.category || "computer",
        contact_number: listing.contact_phone || "",
        source: "paid-listing",
        is_active: true,
        posted_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        views: 0,
      });

    if (insertError) {
      console.error("Verify: job insert failed", insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Verify: unexpected error", err);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
