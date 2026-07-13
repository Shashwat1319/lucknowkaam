import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const apiKey = process.env.API_SECRET_KEY;

  if (!apiKey || authHeader !== `Bearer ${apiKey}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ghPat = process.env.GH_PAT;
  if (!ghPat) {
    return NextResponse.json({ error: "GH_PAT not configured" }, { status: 500 });
  }

  const res = await fetch(
    "https://api.github.com/repos/Shashwat1319/lucknowkaam/actions/workflows/daily_jobs.yml/dispatches",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${ghPat}`,
        "Content-Type": "application/json",
        "User-Agent": "lucknowkaam-cron",
      },
      body: JSON.stringify({ ref: "main" }),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    return NextResponse.json({ error: `GitHub API error: ${res.status} ${text}` }, { status: 502 });
  }

  return NextResponse.json({ success: true });
}
