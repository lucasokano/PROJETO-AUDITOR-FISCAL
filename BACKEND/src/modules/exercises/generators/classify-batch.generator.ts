import { getClassifiableItems } from "../exercise.eligibility.js";
import { ExerciseType, type ExerciseOption, type ExerciseSource, type GeneratedExercise } from "../exercise.types.js";
import { shuffle } from "../exercise.utils.js";

export function generateClassifyBatch(source: ExerciseSource, context: { exerciseId: string; subtopicId: number; expiresAt: number; itemCount?: number }): GeneratedExercise {
  const eligible = getClassifiableItems(source);
  const count = Math.min(context.itemCount ?? 8, eligible.length);
  const selected = shuffle(eligible).slice(0, count);
  const categories: ExerciseOption[] = source.categories.map(({ id, name }) => ({ id, label: name }));
  const items = shuffle(selected);
  const payload = { prompt: "Distribua cada item na categoria correta.", groupName: source.name, instruction: source.instruction, items: items.map(({ id, text }) => ({ itemId: id, label: text })), categories };
  return {
    presented: { exerciseId: context.exerciseId, type: ExerciseType.CLASSIFY_BATCH, payload },
    pending: { exerciseId: context.exerciseId, type: ExerciseType.CLASSIFY_BATCH, subtopicId: context.subtopicId, groupId: source.id, knowledgeItemIds: items.map((item) => item.id), payload, answerKey: { items: items.map((item) => ({ ...item, correctCategory: { id: item.classifications[0]!.category.id, label: item.classifications[0]!.category.name } })), categoryIds: categories.map((category) => category.id) }, createdAt: Date.now(), expiresAt: context.expiresAt, snapshotVersion: 1 },
  };
}
