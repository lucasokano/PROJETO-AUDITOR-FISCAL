import assert from "node:assert/strict";
import type { AddressInfo } from "node:net";
import { after, before, test } from "node:test";
import type { Server } from "node:http";
import { createApp } from "../../../app.js";
import { prisma } from "../../../config/prisma.js";
import { hashPassword } from "../auth.crypto.js";

const email = `auth-test-${Date.now()}@example.com`;
const inactiveEmail = `auth-inactive-${Date.now()}@example.com`;
const password = "correct-test-password-123";
let server: Server;
let baseUrl = "";

function cookieFrom(response: Response) { return response.headers.get("set-cookie")?.split(";", 1)[0] ?? ""; }
async function post(path: string, body?: object, cookie?: string) {
  return fetch(`${baseUrl}${path}`, { method: "POST", headers: { "Content-Type": "application/json", ...(cookie ? { Cookie: cookie } : {}) }, body: body ? JSON.stringify(body) : undefined });
}

before(async () => {
  process.env.AUTH_SECRET = "test-secret-with-at-least-thirty-two-characters";
  await prisma.user.createMany({ data: [
    { email, passwordHash: await hashPassword(password), isActive: true },
    { email: inactiveEmail, passwordHash: await hashPassword(password), isActive: false },
  ] });
  server = createApp().listen(0);
  await new Promise<void>((resolve) => server.once("listening", resolve));
  baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}/api`;
});

after(async () => {
  await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  await prisma.user.deleteMany({ where: { email: { in: [email, inactiveEmail] } } });
  await prisma.$disconnect();
});

test("login correto cria sessão e não expõe senha", async () => {
  const response = await post("/auth/login", { email, password });
  assert.equal(response.status, 200);
  assert.match(response.headers.get("set-cookie") ?? "", /HttpOnly/);
  const text = await response.text();
  assert.equal(text.includes(password), false);
  assert.equal(text.includes("passwordHash"), false);
});

test("senha incorreta usa resposta genérica", async () => {
  const response = await post("/auth/login", { email, password: "incorrect-password-123" });
  assert.equal(response.status, 401);
  assert.deepEqual(await response.json(), { message: "Email ou senha inválidos." });
});

test("email inexistente usa a mesma resposta genérica", async () => {
  const response = await post("/auth/login", { email: "missing@example.com", password });
  assert.equal(response.status, 401);
  assert.deepEqual(await response.json(), { message: "Email ou senha inválidos." });
});

test("me sem sessão retorna 401", async () => {
  assert.equal((await fetch(`${baseUrl}/auth/me`)).status, 401);
});

test("me autenticado retorna somente dados públicos", async () => {
  const login = await post("/auth/login", { email, password });
  const response = await fetch(`${baseUrl}/auth/me`, { headers: { Cookie: cookieFrom(login) } });
  assert.equal(response.status, 200);
  const user = await response.json() as Record<string, unknown>;
  assert.equal(user.email, email);
  assert.deepEqual(Object.keys(user).sort(), ["email", "id"]);
});

test("rota privada sem sessão retorna 401", async () => {
  assert.equal((await fetch(`${baseUrl}/study/dashboard`)).status, 401);
});

test("logout remove a sessão do navegador", async () => {
  const login = await post("/auth/login", { email, password });
  const response = await post("/auth/logout", undefined, cookieFrom(login));
  assert.equal(response.status, 204);
  assert.match(response.headers.get("set-cookie") ?? "", /Max-Age=0/);
  assert.equal((await fetch(`${baseUrl}/auth/me`)).status, 401);
});

test("usuário inativo não entra", async () => {
  const response = await post("/auth/login", { email: inactiveEmail, password });
  assert.equal(response.status, 401);
  assert.deepEqual(await response.json(), { message: "Email ou senha inválidos." });
});
