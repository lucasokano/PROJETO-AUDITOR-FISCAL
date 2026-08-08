import "dotenv/config";

import { prisma } from "./config/prisma.js";
import { createApp } from "./app.js";

const port = Number(process.env.PORT) || 3001;
const app = createApp();

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
