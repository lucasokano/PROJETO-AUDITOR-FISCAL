import { getClassifiableItems, groupItemsByCategory } from "../exercise.eligibility.js";
import { ExerciseType, type ExerciseSource, type GeneratedExercise } from "../exercise.types.js";
import { pickOne, shuffle } from "../exercise.utils.js";

export function generateMultipleSelect(source: ExerciseSource, context: { exerciseId: string; subtopicId: number; expiresAt: number; optionCount?: number }): GeneratedExercise {
  const items = getClassifiableItems(source);
  const groups = groupItemsByCategory(items);
  const targets = [...groups.entries()].filter(([categoryId, values]) => values.length >= 2 && items.some((item) => item.classifications[0]!.category.id !== categoryId));
  const [targetId, correctPool] = pickOne(targets);
  const targetCategory = source.categories.find((category) => category.id === targetId)!;
  const count = Math.min(10, Math.max(4, context.optionCount ?? 6), items.length);
  const correctCount = Math.min(correctPool.length, count - 1);
  const correct = shuffle(correctPool).slice(0, correctCount);
  const distractors = shuffle(items.filter((item) => item.classifications[0]!.category.id !== targetId)).slice(0, count - correct.length);
  const selected = shuffle([...correct, ...distractors]);
  const options = selected.map(({ id, text }) => ({ itemId: id, label: text }));
  const payload = { prompt: `Selecione todos os itens que pertencem à categoria ${targetCategory.name}.`, groupName: source.name, category: { id: targetCategory.id, label: targetCategory.name }, options };
  return {
    presented: { exerciseId: context.exerciseId, type: ExerciseType.MULTIPLE_SELECT, payload },
    pending: { exerciseId: context.exerciseId, type: ExerciseType.MULTIPLE_SELECT, subtopicId: context.subtopicId, groupId: source.id, knowledgeItemIds: selected.map((item) => item.id), payload, answerKey: { correctItemIds: correct.map((item) => item.id), items: selected, optionIds: selected.map((item) => item.id) }, createdAt: Date.now(), expiresAt: context.expiresAt, snapshotVersion: 1 },
  };
}
