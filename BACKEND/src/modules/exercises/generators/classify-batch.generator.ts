import { getClassifiableItems, groupItemsByCategory } from "../exercise.eligibility.js";
import { ExerciseType, type ExerciseOption, type ExerciseSource, type GeneratedExercise, type SourceItem } from "../exercise.types.js";
import { shuffle } from "../exercise.utils.js";

export function generateClassifyBatch(source: ExerciseSource, context: { exerciseId: string; subtopicId: number; expiresAt: number; itemCount?: number }): GeneratedExercise {
  const eligible = getClassifiableItems(source);
  const groups = [...groupItemsByCategory(eligible).values()].filter((items) => items.length > 0);
  const selected: SourceItem[] = [shuffle(groups[0]!)[0]!, shuffle(groups[1]!)[0]!];
  const selectedIds = new Set(selected.map((item) => item.id));
  const count = Math.min(12, Math.max(4, context.itemCount ?? 8), eligible.length);
  for (const item of shuffle(eligible)) {
    if (selected.length >= count) break;
    if (!selectedIds.has(item.id)) { selected.push(item); selectedIds.add(item.id); }
  }
  const categories: ExerciseOption[] = source.categories.map(({ id, name }) => ({ id, label: name }));
  const items = shuffle(selected);
  const payload = { prompt: "Distribua cada item na categoria correta.", groupName: source.name, instruction: source.instruction, items: items.map(({ id, text }) => ({ itemId: id, label: text })), categories };
  return {
    presented: { exerciseId: context.exerciseId, type: ExerciseType.CLASSIFY_BATCH, payload },
    pending: { exerciseId: context.exerciseId, type: ExerciseType.CLASSIFY_BATCH, subtopicId: context.subtopicId, groupId: source.id, knowledgeItemIds: items.map((item) => item.id), payload, answerKey: { items: items.map((item) => ({ ...item, correctCategory: { id: item.classifications[0]!.category.id, label: item.classifications[0]!.category.name } })), categoryIds: categories.map((category) => category.id) }, createdAt: Date.now(), expiresAt: context.expiresAt, snapshotVersion: 1 },
  };
}
