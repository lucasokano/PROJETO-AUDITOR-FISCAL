import { prisma } from "../../config/prisma.js";
import { verifyPassword } from "./auth.crypto.js";

export function normalizeEmail(email: string) { return email.trim().toLowerCase(); }
export function isValidEmail(email: string) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 320; }
export function isValidPassword(password: string) { return password.length >= 12 && password.length <= 200; }

export async function authenticate(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email: normalizeEmail(email) } });
  const comparisonHash = user?.passwordHash ?? `scrypt$${Buffer.alloc(16).toString("base64url")}$${Buffer.alloc(64).toString("base64url")}`;
  const passwordMatches = await verifyPassword(password, comparisonHash);
  if (!user || !user.isActive || !passwordMatches) return null;
  return { id: user.id, email: user.email };
}

export async function publicUser(userId: number) {
  return prisma.user.findFirst({ where: { id: userId, isActive: true }, select: { id: true, email: true } });
}
