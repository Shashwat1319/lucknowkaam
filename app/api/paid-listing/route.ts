import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { checkRateLimit } from "@/lib/rate-limit";

const MAX_PAYLOAD_SIZE = 50 * 1024;

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const { allowed, resetAt } = checkRateLimit(ip);
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": String(Math.ceil((resetAt - Date.now()) / 1000)) } }
    );
  }

  try {
    const contentLength = parseInt(request.headers.get("content-length") || "0");
    if (contentLength > MAX_PAYLOAD_SIZE) {
      return NextResponse.json({ error: "Payload too large" }, { status: 413 });
    }

    const body = await request.json();

    const {
      company_name,
      contact_phone,
      job_title,
      job_description,
    } = body;

    if (!company_name || !contact_phone || !job_title) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const cleanedPhone = contact_phone.replace(/[\s\-\(\)]/g, "").replace(/^(\+?91|0)/, "");
    if (!/^[6-9]\d{9}$/.test(cleanedPhone)) {
      return NextResponse.json({ error: "Invalid phone number — 10 digits starting with 6-9 required" }, { status: 400 });
    }

    const { data: listing, error } = await supabaseAdmin
      .from("paid_listings")
      .insert({
        company_name,
        contact_phone: cleanedPhone,
        job_title,
        job_description: job_description || "",
        payment_status: "pending",
        amount: 299,
      })
      .select()
      .single();

    if (error || !listing) {
      return NextResponse.json({ error: error?.message || "Failed to create listing" }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: listing.id }, { status: 201 });
  } catch (err) {
    console.error("paid-listing: error", err);
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
