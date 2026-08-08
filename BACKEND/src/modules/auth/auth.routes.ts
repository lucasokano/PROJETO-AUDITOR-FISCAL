import { Router } from "express";
import { requireAuth } from "../../middlewares/requireAuth.js";
import { login, logout, me } from "./auth.controller.js";

const attempts = new Map<string, { count: number; resetAt: number }>();
function loginRateLimit(request: Parameters<typeof login>[0], response: Parameters<typeof login>[1], next: () => void) {
  const key = request.ip ?? "unknown";
  const now = Date.now();
  const current = attempts.get(key);
  if (!current || current.resetAt <= now) { attempts.set(key, { count: 1, resetAt: now + 15 * 60_000 }); next(); return; }
  if (current.count >= 10) { response.status(429).json({ message: "Muitas tentativas. Tente novamente mais tarde." }); return; }
  current.count += 1; next();
}

export const authRoutes = Router();
authRoutes.post("/login", loginRateLimit, login);
authRoutes.get("/me", requireAuth, me);
authRoutes.post("/logout", requireAuth, logout);
