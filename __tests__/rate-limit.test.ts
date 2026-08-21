import { checkRateLimit } from "@/lib/rate-limit";

describe("checkRateLimit", () => {
  it("allows first request", () => {
    const result = checkRateLimit("test-ip-1");
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBeGreaterThan(0);
  });

  it("tracks multiple requests from same IP", () => {
    const ip = "test-ip-2";
    const r1 = checkRateLimit(ip);
    expect(r1.allowed).toBe(true);

    const r2 = checkRateLimit(ip);
    expect(r2.allowed).toBe(true);
    expect(r2.remaining).toBeLessThan(r1.remaining);
  });

  it("returns resetAt in the future", () => {
    const result = checkRateLimit("test-ip-3");
    expect(result.resetAt).toBeGreaterThan(Date.now());
  });

  it("allows different IPs independently", () => {
    const r1 = checkRateLimit("test-ip-a");
    const r2 = checkRateLimit("test-ip-b");
    expect(r1.allowed).toBe(true);
    expect(r2.allowed).toBe(true);
  });
});
