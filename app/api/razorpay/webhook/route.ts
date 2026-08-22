import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(request: Request) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  const signature = request.headers.get("x-razorpay-signature") || "";
  const text = await request.text();

  const expectedSig = await createHmacSha256(text, secret);
  if (signature !== expectedSig) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  try {
    const event = JSON.parse(text);

    if (event.event === "payment.captured") {
      const payment = event.payload.payment.entity;
      const orderId = payment.order_id;
      const paymentId = payment.id;

      try {
        const { data: listing } = await supabaseAdmin
          .from("paid_listings")
          .select("*")
          .eq("razorpay_order_id", orderId)
          .single();

        if (listing && listing.payment_status !== "paid") {
          await supabaseAdmin
            .from("paid_listings")
            .update({ payment_status: "paid", razorpay_payment_id: paymentId })
            .eq("id", listing.id);

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
            await supabaseAdmin
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
                expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
                views: 0,
              });
          }
        }
      } catch (e) {
        console.warn("webhook: paid_listings lookup failed", e);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("webhook: error", err);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}

async function createHmacSha256(data: string, key: string): Promise<string> {
  const encoder = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(key),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(data));
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
