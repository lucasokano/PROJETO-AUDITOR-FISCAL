import cors from "cors";
import dotenv from "dotenv";
import express from "express";

dotenv.config();

const app = express();

const port = Number(process.env.PORT) || 3001;

app.use(cors());
app.use(express.json());

app.get("/", (_request, response) => {
  response.json({
    message: "API do Sistema de Estudos funcionando",
  });
});

app.get("/api/health", (_request, response) => {
  response.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

app.listen(port, () => {
  console.log(`Servidor executando em http://localhost:${port}`);
});