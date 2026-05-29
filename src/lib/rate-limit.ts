const store = new Map<string, { count: number; resetAt: number }>();

export function isRateLimited(ip: string, maxAttempts = 5, windowMs = 60_000): boolean {
  const now = Date.now();
  const entry = store.get(ip);

  if (!entry || now > entry.resetAt) {
    store.set(ip, { count: 1, resetAt: now + windowMs });
    return false;
  }

  if (entry.count >= maxAttempts) return true;
  entry.count++;
  return false;
}

export function extractIP(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return "127.0.0.1";
}