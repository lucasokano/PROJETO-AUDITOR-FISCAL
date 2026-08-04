import { prisma } from "../../config/prisma.js";

export function findSubtopicById(subtopicId: number) {
  return prisma.subtopic.findUnique({
    where: { id: subtopicId },
    select: { id: true },
  });
}

export function findGroupById(groupId: number) {
  return prisma.classificationGroup.findUnique({
    where: { id: groupId },
    select: {
      id: true,
      subtopicId: true,
      _count: { select: { categories: true } },
    },
  });
}

export function findGroupBySubtopicAndName(
  subtopicId: number,
  name: string,
) {
  return prisma.classificationGroup.findFirst({
    where: {
      subtopicId,
      name: { equals: name, mode: "insensitive" },
    },
    select: { id: true },
  });
}

export function createGroup(data: {
  subtopicId: number;
  name: string;
  instruction: string | null;
}) {
  return prisma.classificationGroup.create({ data });
}

export function updateGroup(
  groupId: number,
  data: {
    name?: string;
    instruction?: string | null;
    isActive?: boolean;
  },
) {
  return prisma.classificationGroup.update({
    where: { id: groupId },
    data,
  });
}

export function deleteGroup(groupId: number) {
  return prisma.classificationGroup.delete({
    where: { id: groupId },
  });
}

export function findCategoryById(categoryId: number) {
  return prisma.classificationCategory.findUnique({
    where: { id: categoryId },
    select: {
      id: true,
      groupId: true,
      group: { select: { subtopicId: true } },
      _count: { select: { classifications: true } },
    },
  });
}

export function findCategoryIdentity(categoryId: number) {
  return prisma.classificationCategory.findUnique({
    where: { id: categoryId },
    select: {
      id: true,
      group: { select: { subtopicId: true } },
    },
  });
}

export function findCategoryByGroupAndName(
  groupId: number,
  name: string,
) {
  return prisma.classificationCategory.findFirst({
    where: {
      groupId,
      name: { equals: name, mode: "insensitive" },
    },
    select: { id: true },
  });
}

export function createCategory(data: {
  groupId: number;
  name: string;
  displayOrder: number;
}) {
  return prisma.classificationCategory.create({ data });
}

export function updateCategory(
  categoryId: number,
  data: {
    name?: string;
    displayOrder?: number;
  },
) {
  return prisma.classificationCategory.update({
    where: { id: categoryId },
    data,
  });
}

export function deleteCategory(categoryId: number) {
  return prisma.classificationCategory.delete({
    where: { id: categoryId },
  });
}

export function findItemById(itemId: number) {
  return prisma.knowledgeItem.findUnique({
    where: { id: itemId },
    select: {
      id: true,
      subtopicId: true,
      classifications: {
        select: {
          category: {
            select: {
              group: { select: { subtopicId: true } },
            },
          },
        },
      },
      progress: { select: { totalAttempts: true } },
    },
  });
}

export function findItemIdentity(itemId: number) {
  return prisma.knowledgeItem.findUnique({
    where: { id: itemId },
    select: { id: true, subtopicId: true },
  });
}

export function createItem(data: {
  subtopicId: number;
  text: string;
  explanation: string | null;
  reference: string | null;
}) {
  return prisma.knowledgeItem.create({ data });
}

export function updateItem(
  itemId: number,
  data: {
    subtopicId?: number;
    text?: string;
    explanation?: string | null;
    reference?: string | null;
    isActive?: boolean;
  },
) {
  return prisma.knowledgeItem.update({
    where: { id: itemId },
    data,
  });
}

export function deleteItem(itemId: number) {
  return prisma.knowledgeItem.delete({
    where: { id: itemId },
  });
}

export function findClassificationByPair(
  itemId: number,
  categoryId: number,
) {
  return prisma.itemClassification.findUnique({
    where: { itemId_categoryId: { itemId, categoryId } },
    select: { id: true },
  });
}

export function findClassificationById(
  classificationId: number,
) {
  return prisma.itemClassification.findUnique({
    where: { id: classificationId },
    select: { id: true },
  });
}

export function createClassification(data: {
  itemId: number;
  categoryId: number;
}) {
  return prisma.itemClassification.create({ data });
}

export function deleteClassification(
  classificationId: number,
) {
  return prisma.itemClassification.delete({
    where: { id: classificationId },
  });
}

export function findKnowledgeBySubtopicId(
  subtopicId: number,
) {
  return prisma.subtopic.findUnique({
    where: { id: subtopicId },
    select: {
      id: true,
      classificationGroups: {
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          instruction: true,
          isActive: true,
          categories: {
            orderBy: [
              { displayOrder: "asc" },
              { name: "asc" },
            ],
            select: {
              id: true,
              name: true,
              displayOrder: true,
            },
          },
        },
      },
      knowledgeItems: {
        orderBy: { id: "asc" },
        select: {
          id: true,
          text: true,
          explanation: true,
          reference: true,
          isActive: true,
          classifications: {
            orderBy: { id: "asc" },
            select: {
              id: true,
              categoryId: true,
              category: {
                select: {
                  name: true,
                  group: {
                    select: { id: true, name: true },
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
