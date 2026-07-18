import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { generateSlug } from "@/lib/utils";
import { checkRateLimit } from "@/lib/rate-limit";

const MAX_PAYLOAD_SIZE = 50 * 1024; // 50KB

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
    const apiKey = request.headers.get("x-api-key");

    if (!apiKey || apiKey !== process.env.API_SECRET_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      title_hindi,
      title_english,
      description_hindi,
      company_name,
      location_area,
      category,
      salary_min,
      salary_max,
      salary_text_hindi,
      qualification,
      experience,
      contact_number,
      job_type,
      source = "api",
      apply_link,
      slug: custom_slug,
    } = body;

    if (!title_hindi || !company_name || !location_area || !category) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if ([title_hindi, company_name, location_area, category].some(v => v.length > 500)) {
      return NextResponse.json({ error: "Field too long" }, { status: 400 });
    }
    if (description_hindi && description_hindi.length > 5000) {
      return NextResponse.json({ error: "Description too long" }, { status: 400 });
    }

    const slug = custom_slug || (generateSlug(title_hindi) + "-" + location_area.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now());

    const { data, error } = await supabaseAdmin
      .from("jobs")
      .insert({
        title_hindi,
        title_english: title_english || title_hindi,
        slug,
        description_hindi: description_hindi || "",
        company_name,
        location_area,
        category,
        salary_min: salary_min || null,
        salary_max: salary_max || null,
        salary_text_hindi: salary_text_hindi || "",
        qualification: qualification || "",
        experience: experience || "",
        contact_number: contact_number || "",
        apply_link: apply_link || "",
        job_type: job_type || "full-time",
        source,
        is_active: true,
        posted_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        views: 0,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, job: data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
