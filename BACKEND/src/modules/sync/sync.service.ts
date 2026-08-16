import { prisma } from "../../config/prisma.js";

function timestamp(value: Date | null | undefined) {
  return value?.toISOString() ?? "0";
}

export async function getSyncVersions() {
  const [disciplines, topics, subtopics, clozeGroups] = await Promise.all([
    prisma.discipline.aggregate({ _max: { updatedAt: true }, _count: { id: true } }),
    prisma.topic.aggregate({ _max: { updatedAt: true }, _count: { id: true } }),
    prisma.subtopic.aggregate({ _max: { updatedAt: true }, _count: { id: true } }),
    prisma.clozeQuestion.groupBy({
      by: ["subtopicId"],
      where: { isActive: true },
      _max: { updatedAt: true },
      _count: { id: true },
    }),
  ]);

  return {
    structure: [
      timestamp(disciplines._max.updatedAt), disciplines._count.id,
      timestamp(topics._max.updatedAt), topics._count.id,
      timestamp(subtopics._max.updatedAt), subtopics._count.id,
    ].join(":"),
    fillBlankQuestions: Object.fromEntries(clozeGroups.map((group) => [
      group.subtopicId,
      `${timestamp(group._max.updatedAt)}:${group._count.id}`,
    ])),
    updatedAt: new Date().toISOString(),
  };
}
