import { sessionMaxAgeSeconds } from "./auth.crypto.js";

export const sessionCookieName = "gema_session";

function sameSite() {
  const configured = process.env.AUTH_COOKIE_SAME_SITE?.toLowerCase();
  return configured === "strict" || configured === "none" ? configured : "lax";
}

function attributes(maxAge: number) {
  const secure = process.env.NODE_ENV === "production" || sameSite() === "none";
  return [`Path=/`, `HttpOnly`, `SameSite=${sameSite()}`, `Max-Age=${maxAge}`, secure ? "Secure" : ""].filter(Boolean).join("; ");
}

export function sessionCookie(token: string) {
  return `${sessionCookieName}=${encodeURIComponent(token)}; ${attributes(sessionMaxAgeSeconds)}`;
}

export function clearSessionCookie() {
  return `${sessionCookieName}=; ${attributes(0)}`;
}

export function readCookie(header: string | undefined, name: string) {
  if (!header) return null;
  for (const part of header.split(";")) {
    const [key, ...value] = part.trim().split("=");
    if (key === name) return decodeURIComponent(value.join("="));
  }
  return null;
}
