import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.js";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL não foi definida.");
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  const informatica = await prisma.discipline.upsert({
    where: {
      slug: "informatica",
    },
    update: {
      name: "Informática",
      displayOrder: 1,
    },
    create: {
      name: "Informática",
      slug: "informatica",
      displayOrder: 1,
    },
  });

  const portugues = await prisma.discipline.upsert({
    where: {
      slug: "portugues",
    },
    update: {
      name: "Português",
      displayOrder: 2,
    },
    create: {
      name: "Português",
      slug: "portugues",
      displayOrder: 2,
    },
  });

  const redes = await prisma.topic.upsert({
    where: {
      disciplineId_slug: {
        disciplineId: informatica.id,
        slug: "redes",
      },
    },
    update: {
      name: "Redes de Computadores",
      displayOrder: 1,
    },
    create: {
      disciplineId: informatica.id,
      name: "Redes de Computadores",
      slug: "redes",
      displayOrder: 1,
    },
  });

  const bancoDeDados = await prisma.topic.upsert({
    where: {
      disciplineId_slug: {
        disciplineId: informatica.id,
        slug: "banco-de-dados",
      },
    },
    update: {
      name: "Banco de Dados",
      displayOrder: 2,
    },
    create: {
      disciplineId: informatica.id,
      name: "Banco de Dados",
      slug: "banco-de-dados",
      displayOrder: 2,
    },
  });

  const gramatica = await prisma.topic.upsert({
    where: {
      disciplineId_slug: {
        disciplineId: portugues.id,
        slug: "gramatica",
      },
    },
    update: {
      name: "Gramática",
      displayOrder: 1,
    },
    create: {
      disciplineId: portugues.id,
      name: "Gramática",
      slug: "gramatica",
      displayOrder: 1,
    },
  });

  const modeloOsi = await prisma.subtopic.upsert({
    where: {
      topicId_slug: {
        topicId: redes.id,
        slug: "modelo-osi",
      },
    },
    update: {
      name: "Modelo OSI",
      displayOrder: 1,
    },
    create: {
      topicId: redes.id,
      name: "Modelo OSI",
      slug: "modelo-osi",
      displayOrder: 1,
    },
  });

  const tcpIp = await prisma.subtopic.upsert({
    where: {
      topicId_slug: {
        topicId: redes.id,
        slug: "tcp-ip",
      },
    },
    update: {
      name: "TCP/IP",
      displayOrder: 2,
    },
    create: {
      topicId: redes.id,
      name: "TCP/IP",
      slug: "tcp-ip",
      displayOrder: 2,
    },
  });

  const dns = await prisma.subtopic.upsert({
    where: {
      topicId_slug: {
        topicId: redes.id,
        slug: "dns",
      },
    },
    update: {
      name: "DNS",
      displayOrder: 3,
    },
    create: {
      topicId: redes.id,
      name: "DNS",
      slug: "dns",
      displayOrder: 3,
    },
  });

  const modeloRelacional = await prisma.subtopic.upsert({
    where: {
      topicId_slug: {
        topicId: bancoDeDados.id,
        slug: "modelo-relacional",
      },
    },
    update: {
      name: "Modelo Relacional",
      displayOrder: 1,
    },
    create: {
      topicId: bancoDeDados.id,
      name: "Modelo Relacional",
      slug: "modelo-relacional",
      displayOrder: 1,
    },
  });

  const normalizacao = await prisma.subtopic.upsert({
    where: {
      topicId_slug: {
        topicId: bancoDeDados.id,
        slug: "normalizacao",
      },
    },
    update: {
      name: "Normalização",
      displayOrder: 2,
    },
    create: {
      topicId: bancoDeDados.id,
      name: "Normalização",
      slug: "normalizacao",
      displayOrder: 2,
    },
  });

  const classesDePalavras = await prisma.subtopic.upsert({
    where: {
      topicId_slug: {
        topicId: gramatica.id,
        slug: "classes-de-palavras",
      },
    },
    update: {
      name: "Classes de Palavras",
      displayOrder: 1,
    },
    create: {
      topicId: gramatica.id,
      name: "Classes de Palavras",
      slug: "classes-de-palavras",
      displayOrder: 1,
    },
  });

  await prisma.statement.deleteMany();

  await prisma.statement.createMany({
    data: [
      {
        subtopicId: modeloOsi.id,
        text: "O modelo OSI possui sete camadas.",
        correctAnswer: true,
      },
      {
        subtopicId: modeloOsi.id,
        text: "A camada de transporte é responsável pelo endereçamento IP.",
        correctAnswer: false,
      },
      {
        subtopicId: modeloOsi.id,
        text: "A camada física é a primeira camada do modelo OSI.",
        correctAnswer: true,
      },

      {
        subtopicId: tcpIp.id,
        text: "O TCP é um protocolo orientado à conexão.",
        correctAnswer: true,
      },
      {
        subtopicId: tcpIp.id,
        text: "O UDP garante a entrega de todos os pacotes.",
        correctAnswer: false,
      },

      {
        subtopicId: dns.id,
        text: "O DNS converte nomes de domínio em endereços IP.",
        correctAnswer: true,
      },
      {
        subtopicId: dns.id,
        text: "O DNS substitui o protocolo DHCP.",
        correctAnswer: false,
      },
      {
        subtopicId: dns.id,
        text: "Um domínio pode possuir mais de um registro DNS.",
        correctAnswer: true,
      },

      {
        subtopicId: modeloRelacional.id,
        text: "Uma chave primária identifica unicamente um registro.",
        correctAnswer: true,
      },
      {
        subtopicId: modeloRelacional.id,
        text: "Uma tabela relacional pode possuir duas linhas idênticas sem qualquer restrição.",
        correctAnswer: false,
      },

      {
        subtopicId: normalizacao.id,
        text: "A normalização busca reduzir redundâncias nos dados.",
        correctAnswer: true,
      },
      {
        subtopicId: normalizacao.id,
        text: "A primeira forma normal permite atributos multivalorados.",
        correctAnswer: false,
      },

      {
        subtopicId: classesDePalavras.id,
        text: "O substantivo pode nomear seres, lugares, sentimentos e conceitos.",
        correctAnswer: true,
      },
      {
        subtopicId: classesDePalavras.id,
        text: "Todo advérbio varia obrigatoriamente em gênero e número.",
        correctAnswer: false,
      },
    ],
  });

  console.log("Seed concluído com sucesso.");
}

main()
  .catch((error: unknown) => {
    console.error("Erro ao executar o seed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });