import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      company_name,
      contact_phone,
      job_title,
      job_description,
      location_area,
      category,
    } = body;

    if (!company_name || !contact_phone || !job_title || !location_area || !category) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin.from("paid_listings").insert({
      company_name,
      contact_email: body.contact_email || "",
      contact_phone,
      job_title,
      job_description: job_description || "",
      payment_status: "pending",
      amount: 299,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
