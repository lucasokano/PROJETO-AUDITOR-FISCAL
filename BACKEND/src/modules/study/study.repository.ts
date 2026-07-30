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
interface CreateDisciplineData {
  name: string;
  slug: string;
}

interface CreateTopicData {
  disciplineId: number;
  name: string;
  slug: string;
}

interface CreateSubtopicData {
  topicId: number;
  name: string;
  slug: string;
}

export function findDisciplineById(
  disciplineId: number,
) {
  return prisma.discipline.findUnique({
    where: {
      id: disciplineId,
    },
    select: {
      id: true,
    },
  });
}

export function findTopicById(topicId: number) {
  return prisma.topic.findUnique({
    where: {
      id: topicId,
    },
    select: {
      id: true,
      disciplineId: true,
    },
  });
}

export function findDisciplineBySlug(
  slug: string,
) {
  return prisma.discipline.findFirst({
    where: {
      slug,
    },
    select: {
      id: true,
    },
  });
}

export function findTopicByDisciplineAndSlug(
  disciplineId: number,
  slug: string,
) {
  return prisma.topic.findFirst({
    where: {
      disciplineId,
      slug,
    },
    select: {
      id: true,
    },
  });
}

export function findSubtopicByTopicAndSlug(
  topicId: number,
  slug: string,
) {
  return prisma.subtopic.findFirst({
    where: {
      topicId,
      slug,
    },
    select: {
      id: true,
    },
  });
}

export function createDiscipline(
  data: CreateDisciplineData,
) {
  return prisma.discipline.create({
    data: {
      name: data.name,
      slug: data.slug,
      displayOrder: 0,
    },
    select: {
      id: true,
      name: true,
      slug: true,
    },
  });
}

export function createTopic(
  data: CreateTopicData,
) {
  return prisma.topic.create({
    data: {
      disciplineId: data.disciplineId,
      name: data.name,
      slug: data.slug,
      displayOrder: 0,
    },
    select: {
      id: true,
      disciplineId: true,
      name: true,
      slug: true,
    },
  });
}

export function createSubtopic(
  data: CreateSubtopicData,
) {
  return prisma.subtopic.create({
    data: {
      topicId: data.topicId,
      name: data.name,
      slug: data.slug,
      displayOrder: 0,
    },
    select: {
      id: true,
      topicId: true,
      name: true,
      slug: true,
    },
  });
}