import { prisma } from "../../config/prisma.js";

export function findAvailableGroups(subtopicId: number) {
  return prisma.classificationGroup.findMany({
    where: {
      subtopicId,
      isActive: true,
      categories: {
        some: {
          classifications: {
            some: { item: { isActive: true } },
          },
        },
      },
    },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      instruction: true,
    },
  });
}

export function findExerciseSource(
  subtopicId: number,
  groupId: number,
) {
  return prisma.classificationGroup.findFirst({
    where: {
      id: groupId,
      subtopicId,
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      instruction: true,
      categories: {
        orderBy: [
          { displayOrder: "asc" },
          { name: "asc" },
        ],
        select: {
          id: true,
          name: true,
        },
      },
      subtopic: {
        select: {
          knowledgeItems: {
            where: {
              isActive: true,
              classifications: {
                some: {
                  category: { groupId },
                },
              },
            },
            select: {
              id: true,
              text: true,
              explanation: true,
              reference: true,
              classifications: {
                where: {
                  category: { groupId },
                },
                select: {
                  category: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });
}
