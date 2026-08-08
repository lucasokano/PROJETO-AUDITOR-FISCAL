import type { NextFunction, Request, Response } from "express";
import { readCookie, sessionCookieName } from "../modules/auth/auth.cookie.js";
import { verifySessionToken } from "../modules/auth/auth.crypto.js";
import { publicUser } from "../modules/auth/auth.service.js";

export interface AuthenticatedRequest extends Request { auth?: { userId: number }; }

export async function requireAuth(request: AuthenticatedRequest, response: Response, next: NextFunction) {
  const token = readCookie(request.headers.cookie, sessionCookieName);
  const session = token ? verifySessionToken(token) : null;
  if (!session || !(await publicUser(session.userId))) {
    response.status(401).json({ message: "Autenticação necessária." });
    return;
  }
  request.auth = { userId: session.userId };
  next();
}
