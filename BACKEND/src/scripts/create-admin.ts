import "dotenv/config";
import { prisma } from "../config/prisma.js";
import { hashPassword } from "../modules/auth/auth.crypto.js";
import { isValidEmail, isValidPassword, normalizeEmail } from "../modules/auth/auth.service.js";

const email = normalizeEmail(process.env.GEMA_ADMIN_EMAIL ?? "");
const password = process.env.GEMA_ADMIN_PASSWORD ?? "";

if (!isValidEmail(email)) throw new Error("GEMA_ADMIN_EMAIL é inválido.");
if (!isValidPassword(password)) throw new Error("GEMA_ADMIN_PASSWORD deve possuir entre 12 e 200 caracteres.");

try {
  const passwordHash = await hashPassword(password);
  const user = await prisma.$transaction(async (transaction) => {
    await transaction.user.updateMany({ where: { email: { not: email } }, data: { isActive: false } });
    return transaction.user.upsert({ where: { email }, update: { passwordHash, isActive: true }, create: { email, passwordHash } });
  });
  console.log(`Conta administrativa configurada: ${user.email} (id ${user.id}).`);
} finally { await prisma.$disconnect(); }
