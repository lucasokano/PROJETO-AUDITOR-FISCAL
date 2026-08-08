import { createHmac, randomBytes, scrypt, timingSafeEqual } from "node:crypto";

const KEY_LENGTH = 64;
const SESSION_SECONDS = 60 * 60 * 24 * 7;

function scryptAsync(password: string, salt: Buffer) {
  return new Promise<Buffer>((resolve, reject) => {
    scrypt(password, salt, KEY_LENGTH, (error, key) => error ? reject(error) : resolve(key));
  });
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16);
  const key = await scryptAsync(password, salt);
  return `scrypt$${salt.toString("base64url")}$${key.toString("base64url")}`;
}

export async function verifyPassword(password: string, storedHash: string) {
  const [algorithm, saltValue, keyValue] = storedHash.split("$");
  if (algorithm !== "scrypt" || !saltValue || !keyValue) return false;
  const expected = Buffer.from(keyValue, "base64url");
  const actual = await scryptAsync(password, Buffer.from(saltValue, "base64url"));
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

function authSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) throw new Error("AUTH_SECRET deve possuir pelo menos 32 caracteres.");
  return secret;
}

export function createSessionToken(userId: number, now = Date.now()) {
  const payload = Buffer.from(JSON.stringify({ sub: userId, exp: Math.floor(now / 1000) + SESSION_SECONDS })).toString("base64url");
  const signature = createHmac("sha256", authSecret()).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

export function verifySessionToken(token: string, now = Date.now()) {
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;
  const expected = createHmac("sha256", authSecret()).update(payload).digest();
  const received = Buffer.from(signature, "base64url");
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) return null;
  try {
    const value = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { sub?: unknown; exp?: unknown };
    if (typeof value.sub !== "number" || typeof value.exp !== "number" || value.exp <= Math.floor(now / 1000)) return null;
    return { userId: value.sub, expiresAt: value.exp };
  } catch { return null; }
}

export const sessionMaxAgeSeconds = SESSION_SECONDS;
