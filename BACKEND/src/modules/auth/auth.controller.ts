import type { Request, Response } from "express";
import type { AuthenticatedRequest } from "../../middlewares/requireAuth.js";
import { clearSessionCookie, sessionCookie } from "./auth.cookie.js";
import { createSessionToken } from "./auth.crypto.js";
import { authenticate, isValidEmail, isValidPassword, publicUser } from "./auth.service.js";

export async function login(request: Request, response: Response) {
  const email = typeof request.body.email === "string" ? request.body.email : "";
  const password = typeof request.body.password === "string" ? request.body.password : "";
  const invalid = () => response.status(401).json({ message: "Email ou senha inválidos." });
  if (!isValidEmail(email) || !isValidPassword(password)) { invalid(); return; }
  const user = await authenticate(email, password);
  if (!user) { invalid(); return; }
  response.setHeader("Set-Cookie", sessionCookie(createSessionToken(user.id)));
  response.json(user);
}

export async function me(request: AuthenticatedRequest, response: Response) {
  const user = request.auth ? await publicUser(request.auth.userId) : null;
  if (!user) { response.status(401).json({ message: "Autenticação necessária." }); return; }
  response.json(user);
}

export function logout(_request: Request, response: Response) {
  response.setHeader("Set-Cookie", clearSessionCookie());
  response.status(204).send();
}
