import { NextResponse } from "next/server";

const DEFAULT_MAX_BODY = 50 * 1024; // 50KB

export function validateJsonRequest(
  request: Request,
  opts?: { maxBodySize?: number }
): { ok: true } | { ok: false; response: NextResponse } {
  const maxBody = opts?.maxBodySize ?? DEFAULT_MAX_BODY;

  const contentType = request.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Content-Type must be application/json" },
        { status: 415 }
      ),
    };
  }

  const contentLength = parseInt(request.headers.get("content-length") || "0", 10);
  if (contentLength > maxBody) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Payload too large" },
        { status: 413 }
      ),
    };
  }

  return { ok: true };
}
