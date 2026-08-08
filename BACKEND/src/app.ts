import cors from "cors";
import express from "express";
import { prisma } from "./config/prisma.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { requireAuth } from "./middlewares/requireAuth.js";
import { authRoutes } from "./modules/auth/auth.routes.js";
import { exerciseRoutes } from "./modules/exercises/exercise.routes.js";
import { knowledgeRoutes } from "./modules/knowledge/knowledge.routes.js";
import { studyRoutes } from "./modules/study/study.routes.js";
import { examQuestionRoutes } from "./modules/examQuestions/exam-question.routes.js";

export function createApp() {
  const app = express();
  const frontendUrl = process.env.FRONTEND_URL ?? "http://localhost:5173";

  app.use(cors({ origin: frontendUrl, credentials: true }));
  app.use(express.json());
  app.get("/api/health", async (_request, response) => {
    await prisma.$queryRaw`SELECT 1`;
    response.status(200).json({ status: "ok", database: "connected", timestamp: new Date().toISOString() });
  });
  app.use("/api/auth", authRoutes);
  app.use("/api/study", requireAuth, studyRoutes);
  app.use("/api/knowledge", requireAuth, knowledgeRoutes);
  app.use("/api/exercises", requireAuth, exerciseRoutes);
  app.use("/api/exam-questions", requireAuth, examQuestionRoutes);
  app.use((_request, response) => { response.status(404).json({ message: "Rota não encontrada." }); });
  app.use(errorHandler);
  return app;
}
