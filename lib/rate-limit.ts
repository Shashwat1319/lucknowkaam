const WINDOW_MS = 60_000;
const MAX_REQUESTS = 30;
const CLEANUP_INTERVAL = 300_000;

const ipRequestCounts = new Map<string, { count: number; resetAt: number }>();
let lastCleanup = Date.now();

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  for (const [ip, record] of Array.from(ipRequestCounts)) {
    if (now > record.resetAt) {
      ipRequestCounts.delete(ip);
    }
  }
}

export function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetAt: number } {
  cleanup();

  const now = Date.now();
  const record = ipRequestCounts.get(ip);

  if (!record || now > record.resetAt) {
    ipRequestCounts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, remaining: MAX_REQUESTS - 1, resetAt: now + WINDOW_MS };
  }

  record.count += 1;
  const remaining = Math.max(0, MAX_REQUESTS - record.count);
  return { allowed: record.count <= MAX_REQUESTS, remaining, resetAt: record.resetAt };
}
