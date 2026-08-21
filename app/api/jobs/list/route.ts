import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { checkRateLimit } from "@/lib/rate-limit";

export async function GET(request: Request) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const { allowed } = checkRateLimit(ip);
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const location = searchParams.get("location");
  const type = searchParams.get("type");
  const rawPage = parseInt(searchParams.get("page") || "1");
  const page = Math.max(isNaN(rawPage) ? 1 : rawPage, 1);
  const rawLimit = parseInt(searchParams.get("limit") || "20");
  const limit = Math.min(Math.max(isNaN(rawLimit) ? 20 : rawLimit, 1), 50);
  const offset = (page - 1) * limit;

  let query = supabase
    .from("jobs")
    .select("*", { count: "exact" })
    .eq("is_active", true)
    .order("is_featured", { ascending: false })
    .order("posted_at", { ascending: false });

  if (category) query = query.eq("category", category);
  if (location) query = query.eq("location_area", location);
  if (type) query = query.eq("job_type", type);

  const { data, count, error } = await query.range(offset, offset + limit - 1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    jobs: data,
    total: count,
    page,
    limit,
    totalPages: count ? Math.ceil(count / limit) : 0,
  });
}
