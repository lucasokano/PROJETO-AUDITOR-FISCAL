import { prisma } from "../../config/prisma.js";

interface UpdateStatementData {
  subtopicId: number;
  text: string;
  correctAnswer: boolean;
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

interface CreateStatementData {
  subtopicId: number;
  text: string;
  correctAnswer: boolean;
}

export function findStudyStructure() {
  return prisma.discipline.findMany({
    orderBy: [
      {
        displayOrder: "asc",
      },
      {
        name: "asc",
      },
    ],
    include: {
      topics: {
        orderBy: [
          {
            displayOrder: "asc",
          },
          {
            name: "asc",
          },
        ],
        include: {
          subtopics: {
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
      },
    },
  });
}

export function findStatementsBySubtopicId(
  subtopicId: number,
) {
  return prisma.statement.findMany({
    where: {
      subtopicId,
    },
    orderBy: {
      id: "asc",
    },
  });
}

export function findSubtopicById(
  subtopicId: number,
) {
  return prisma.subtopic.findUnique({
    where: {
      id: subtopicId,
    },
    select: {
      id: true,
    },
  });
}

export function createStatement(
  data: CreateStatementData,
) {
  return prisma.statement.create({
    data,
  });
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

export function findDisciplineDetailsById(
  disciplineId: number,
) {
  return prisma.discipline.findUnique({
    where: {
      id: disciplineId,
    },
    select: {
      id: true,
      _count: {
        select: {
          topics: true,
        },
      },
    },
  });
}

export function findTopicDetailsById(
  topicId: number,
) {
  return prisma.topic.findUnique({
    where: {
      id: topicId,
    },
    select: {
      id: true,
      disciplineId: true,
      _count: {
        select: {
          subtopics: true,
        },
      },
    },
  });
}

export function findSubtopicDetailsById(
  subtopicId: number,
) {
  return prisma.subtopic.findUnique({
    where: {
      id: subtopicId,
    },
    select: {
      id: true,
      topicId: true,
      _count: {
        select: {
          statements: true,
        },
      },
    },
  });
}

export function updateDiscipline(
  disciplineId: number,
  data: {
    name: string;
    slug: string;
  },
) {
  return prisma.discipline.update({
    where: {
      id: disciplineId,
    },
    data,
    select: {
      id: true,
      name: true,
      slug: true,
    },
  });
}

export function updateTopic(
  topicId: number,
  data: {
    name: string;
    slug: string;
  },
) {
  return prisma.topic.update({
    where: {
      id: topicId,
    },
    data,
    select: {
      id: true,
      disciplineId: true,
      name: true,
      slug: true,
    },
  });
}

export function updateSubtopic(
  subtopicId: number,
  data: {
    name: string;
    slug: string;
  },
) {
  return prisma.subtopic.update({
    where: {
      id: subtopicId,
    },
    data,
    select: {
      id: true,
      topicId: true,
      name: true,
      slug: true,
    },
  });
}

export function deleteDiscipline(
  disciplineId: number,
) {
  return prisma.discipline.delete({
    where: {
      id: disciplineId,
    },
  });
}

export function deleteTopic(topicId: number) {
  return prisma.topic.delete({
    where: {
      id: topicId,
    },
  });
}

export function deleteSubtopic(
  subtopicId: number,
) {
  return prisma.subtopic.delete({
    where: {
      id: subtopicId,
    },
  });
}

export function findAllStatements() {
  return prisma.statement.findMany({
    orderBy: {
      id: "desc",
    },
    include: {
      subtopic: {
        include: {
          topic: {
            include: {
              discipline: true,
            },
          },
        },
      },
    },
  });
}

export function findStatementById(
  statementId: number,
) {
  return prisma.statement.findUnique({
    where: {
      id: statementId,
    },
  });
}

export function createStatementsBulk(input: {
  subtopicId: number;
  statements: {
    text: string;
    correctAnswer: boolean;
  }[];
}) {
  return prisma.$transaction(
    input.statements.map((statement) =>
      prisma.statement.create({
        data: {
          subtopicId: input.subtopicId,
          text: statement.text,
          correctAnswer:
            statement.correctAnswer,
        },
      }),
    ),
  );
}

export function updateStatement(
  statementId: number,
  data: UpdateStatementData,
) {
  return prisma.statement.update({
    where: {
      id: statementId,
    },
    data,
  });
}

export function deleteStatement(
  statementId: number,
) {
  return prisma.statement.delete({
    where: {
      id: statementId,
    },
  });
}