import { getClassifiableItems, groupItemsByCategory } from "../exercise.eligibility.js";
import { ExerciseType, type ExerciseSource, type GeneratedExercise } from "../exercise.types.js";
import { pickOne, shuffle } from "../exercise.utils.js";

export function generateSingleChoice(source: ExerciseSource, context: { exerciseId: string; subtopicId: number; expiresAt: number }): GeneratedExercise {
  const items = getClassifiableItems(source);
  const groups = groupItemsByCategory(items);
  const targetEntries = [...groups.entries()].filter(([categoryId, values]) => values.length > 0 && items.filter((item) => item.classifications[0]!.category.id !== categoryId).length >= 2);
  const [targetId, correctItems] = pickOne(targetEntries);
  const targetCategory = source.categories.find((category) => category.id === targetId)!;
  const correct = pickOne(correctItems);
  const distractors = shuffle(items.filter((item) => item.classifications[0]!.category.id !== targetId)).slice(0, 4);
  const options = shuffle([correct, ...distractors]).map(({ id, text }) => ({ itemId: id, label: text }));
  const payload = { prompt: `Qual destes itens pertence à categoria ${targetCategory.name}?`, groupName: source.name, category: { id: targetCategory.id, label: targetCategory.name }, options };
  return {
    presented: { exerciseId: context.exerciseId, type: ExerciseType.SINGLE_CHOICE, payload },
    pending: { exerciseId: context.exerciseId, type: ExerciseType.SINGLE_CHOICE, subtopicId: context.subtopicId, groupId: source.id, knowledgeItemIds: options.map((option) => option.itemId), payload, answerKey: { correctItem: { itemId: correct.id, label: correct.text }, optionIds: options.map((option) => option.itemId), explanation: correct.explanation, reference: correct.reference }, createdAt: Date.now(), expiresAt: context.expiresAt, snapshotVersion: 1 },
  };
}
