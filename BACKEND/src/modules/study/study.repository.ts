import { prisma } from "../../config/prisma.js";

interface CreateAnswerAttemptData {
  statementId: number;
  selectedAnswer: boolean;
  isCorrect: boolean;
}

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

export async function createAnswerAttempt(
  data: CreateAnswerAttemptData,
) {
  return prisma.$transaction(
    async (transaction) => {
      const currentProgress =
        await transaction.statementProgress.findUnique({
          where: {
            statementId: data.statementId,
          },
          select: {
            consecutiveCorrect: true,
          },
        });

      const consecutiveCorrect =
        data.isCorrect
          ? (currentProgress?.consecutiveCorrect ??
              0) + 1
          : 0;

      const reviewIntervals = [
        2,
        5,
        10,
        20,
        40,
      ];

      const intervalIndex = Math.min(
        Math.max(consecutiveCorrect - 1, 0),
        reviewIntervals.length - 1,
      );

      const reviewDays = data.isCorrect
  ? (reviewIntervals[intervalIndex] ?? 40)
  : 1;

      const answeredAt = new Date();

      const nextReviewAt = new Date(
        answeredAt,
      );

      nextReviewAt.setDate(
        nextReviewAt.getDate() +
          reviewDays,
      );

      const attempt =
        await transaction.answerAttempt.create({
          data: {
            statementId: data.statementId,
            selectedAnswer:
              data.selectedAnswer,
            isCorrect: data.isCorrect,
            answeredAt,
          },
        });

      const progress =
        await transaction.statementProgress.upsert({
          where: {
            statementId: data.statementId,
          },

          create: {
            statementId: data.statementId,
            totalAttempts: 1,
            correctAttempts: data.isCorrect
              ? 1
              : 0,
            incorrectAttempts: data.isCorrect
              ? 0
              : 1,
            consecutiveCorrect,
            lastResult: data.isCorrect,
            lastAnsweredAt: answeredAt,
            nextReviewAt,
          },

          update: {
            totalAttempts: {
              increment: 1,
            },

            correctAttempts: data.isCorrect
              ? {
                  increment: 1,
                }
              : undefined,

            incorrectAttempts:
              data.isCorrect
                ? undefined
                : {
                    increment: 1,
                  },

            consecutiveCorrect,
            lastResult: data.isCorrect,
            lastAnsweredAt: answeredAt,
            nextReviewAt,
          },
        });

      return {
        attempt,
        progress,
      };
    },
  );
}

export function getAnswerHistory(
  statementId: number,
) {
  return prisma.answerAttempt.findMany({
    where: {
      statementId,
    },
    orderBy: {
      answeredAt: "desc",
    },
  });
}

export function findDueReviewStatements(
  limit: number,
) {
  return prisma.statement.findMany({
    where: {
      isActive: true,
      progress: {
        is: {
          nextReviewAt: {
            lte: new Date(),
          },
        },
      },
    },

    include: {
      progress: true,

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

    orderBy: {
      progress: {
        nextReviewAt: "asc",
      },
    },

    take: limit,
  });
}

interface DisciplineProgressRow {
  disciplineId: number;
  name: string;
  totalStatements: number;
  answeredStatements: number;
}

export function findDisciplineProgress() {
  return prisma.$queryRaw<
    DisciplineProgressRow[]
  >`
    SELECT
      d.id AS "disciplineId",
      d.name,
      COUNT(DISTINCT s.id)::int
        AS "totalStatements",
      COUNT(
        DISTINCT CASE
          WHEN aa.id IS NOT NULL
          THEN s.id
        END
      )::int AS "answeredStatements"
    FROM disciplines d
    LEFT JOIN topics t
      ON t.discipline_id = d.id
    LEFT JOIN subtopics st
      ON st.topic_id = t.id
    LEFT JOIN statements s
      ON s.subtopic_id = st.id
      AND s.is_active = true
    LEFT JOIN answer_attempts aa
      ON aa.statement_id = s.id
    GROUP BY
      d.id,
      d.name,
      d.display_order
    ORDER BY
      d.display_order ASC,
      d.name ASC
  `;
}

export function countDueReviewStatements() {
  return prisma.statementProgress.count({
    where: {
      nextReviewAt: {
        lte: new Date(),
      },

      statement: {
        isActive: true,
      },
    },
  });
}