import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const status = { ok: true, timestamp: new Date().toISOString(), services: {} as Record<string, string> };

  try {
    const { count } = await supabase
      .from("jobs")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true);
    status.services.supabase = `connected (${count} active jobs)`;
  } catch (e) {
    status.ok = false;
    status.services.supabase = `error: ${e instanceof Error ? e.message : "unknown"}`;
  }

  const response = NextResponse.json(status, { status: status.ok ? 200 : 503 });
  response.headers.set("Cache-Control", "no-store");
  return response;
}
