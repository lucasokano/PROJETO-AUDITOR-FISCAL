import { prisma } from "../../config/prisma.js";

export function findStudyStructure() {
  return prisma.discipline.findMany({
    select: {
      id: true,
      name: true,
      slug: true,

      topics: {
        select: {
          id: true,
          name: true,
          slug: true,

          subtopics: {
            select: {
              id: true,
              name: true,
              slug: true,
            },

            orderBy: [
              {
                displayOrder: "asc",
              },
              {
                name: "asc",
              },
            ],
          },
        },

        orderBy: [
          {
            displayOrder: "asc",
          },
          {
            name: "asc",
          },
        ],
      },
    },

    orderBy: [
      {
        displayOrder: "asc",
      },
      {
        name: "asc",
      },
    ],
  });
}

export function findSubtopicById(subtopicId: number) {
  return prisma.subtopic.findUnique({
    where: {
      id: subtopicId,
    },

    select: {
      id: true,
    },
  });
}

export function findStatementsBySubtopicId(
  subtopicId: number,
) {
  return prisma.statement.findMany({
    where: {
      subtopicId,
      isActive: true,
    },

    select: {
      id: true,
      text: true,
      correctAnswer: true,
    },

    orderBy: {
      id: "asc",
    },
  });
}
interface CreateStatementData {
  subtopicId: number;
  text: string;
  correctAnswer: boolean;
}

export function createStatement(
  data: CreateStatementData,
) {
  return prisma.statement.create({
    data: {
      subtopicId: data.subtopicId,
      text: data.text,
      correctAnswer: data.correctAnswer,
    },

    select: {
      id: true,
      subtopicId: true,
      text: true,
      correctAnswer: true,
      isActive: true,
      createdAt: true,
    },
  });
}