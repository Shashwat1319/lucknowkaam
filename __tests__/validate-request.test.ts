/**
 * @jest-environment node
 */
import { validateJsonRequest } from "@/lib/validate-request";

function makeRequest(opts: { contentType?: string; contentLength?: number; method?: string }): Request {
  const headers: Record<string, string> = {};
  if (opts.contentType) headers["content-type"] = opts.contentType;
  if (opts.contentLength !== undefined) headers["content-length"] = String(opts.contentLength);
  return new Request("http://localhost/api/test", {
    method: opts.method || "POST",
    headers,
    body: "{}",
  });
}

describe("validateJsonRequest", () => {
  it("accepts valid JSON request", () => {
    const req = makeRequest({ contentType: "application/json", contentLength: 100 });
    const result = validateJsonRequest(req);
    expect(result.ok).toBe(true);
  });

  it("rejects non-JSON content type", () => {
    const req = makeRequest({ contentType: "text/plain", contentLength: 100 });
    const result = validateJsonRequest(req);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.response.status).toBe(415);
    }
  });

  it("rejects missing content type", () => {
    const req = makeRequest({ contentLength: 100 });
    const result = validateJsonRequest(req);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.response.status).toBe(415);
    }
  });

  it("rejects payload over 50KB default limit", () => {
    const req = makeRequest({ contentType: "application/json", contentLength: 60 * 1024 });
    const result = validateJsonRequest(req);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.response.status).toBe(413);
    }
  });

  it("accepts payload under default limit", () => {
    const req = makeRequest({ contentType: "application/json", contentLength: 49 * 1024 });
    const result = validateJsonRequest(req);
    expect(result.ok).toBe(true);
  });

  it("respects custom maxBodySize", () => {
    const req = makeRequest({ contentType: "application/json", contentLength: 1000 });
    const result = validateJsonRequest(req, { maxBodySize: 500 });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.response.status).toBe(413);
    }
  });

  it("accepts JSON with charset suffix", () => {
    const req = makeRequest({ contentType: "application/json; charset=utf-8", contentLength: 100 });
    const result = validateJsonRequest(req);
    expect(result.ok).toBe(true);
  });
});
