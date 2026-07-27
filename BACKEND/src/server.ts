import "dotenv/config";

import cors from "cors";
import express from "express";

import { prisma } from "./config/prisma.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { studyRoutes } from "./modules/study/study.routes.js";

const app = express();

const port = Number(process.env.PORT) || 3001;

app.use(
  cors({
    origin: "http://localhost:5173",
  }),
);

app.use(express.json());

app.get("/api/health", async (_request, response) => {
  await prisma.$queryRaw`SELECT 1`;

  response.status(200).json({
    status: "ok",
    database: "connected",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/study", studyRoutes);

app.use((_request, response) => {
  response.status(404).json({
    message: "Rota não encontrada.",
  });
});

app.use(errorHandler);

const server = app.listen(port, () => {
  console.log(
    `Servidor executando em http://localhost:${port}`,
  );
});

async function shutdown(signal: string) {
  console.log(`\nEncerrando servidor: ${signal}`);

  server.close(async () => {
    try {
      await prisma.$disconnect();
      process.exit(0);
    } catch (error) {
      console.error(
        "Erro ao desconectar o Prisma:",
        error,
      );

      process.exit(1);
    }
  });
}

process.on("SIGINT", () => {
  void shutdown("SIGINT");
});

process.on("SIGTERM", () => {
  void shutdown("SIGTERM");
});