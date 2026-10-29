import rateLimit from "express-rate-limit";

const MINUTE_MS = 60 * 1000;

function limiter(windowMinutes: number, limit: number, error: string) {
  return rateLimit({ windowMs: windowMinutes * MINUTE_MS, limit, standardHeaders: "draft-7", legacyHeaders: false, message: { error } });
}

export const authLimiter = limiter(15, 30, "Too many attempts. Please wait a few minutes and try again.");
export const demoLimiter = limiter(60, 10, "Too many demo accounts from this network. Please try again later.");
