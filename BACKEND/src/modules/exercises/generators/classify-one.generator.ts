import { ExerciseType, type ExerciseOption, type ExerciseSource, type GeneratedExercise } from "../exercise.types.js";
import { getClassifiableItems } from "../exercise.eligibility.js";
import { pickOne, shuffle } from "../exercise.utils.js";

export function generateClassifyOne(source: ExerciseSource, context: { exerciseId: string; subtopicId: number; expiresAt: number; excludedItemId?: number }): GeneratedExercise {
  const eligible = getClassifiableItems(source);
  const candidates = eligible.length > 1 ? eligible.filter((item) => item.id !== context.excludedItemId) : eligible;
  const item = pickOne(candidates);
  const category = item.classifications[0]!.category;
  const options: ExerciseOption[] = shuffle(source.categories.map(({ id, name }) => ({ id, label: name })));
  const payload = { prompt: `${item.text} pertence a qual categoria?`, itemText: item.text, groupName: source.name, instruction: source.instruction, options };
  return {
    presented: { exerciseId: context.exerciseId, type: ExerciseType.CLASSIFY_ONE, payload },
    pending: { exerciseId: context.exerciseId, type: ExerciseType.CLASSIFY_ONE, subtopicId: context.subtopicId, groupId: source.id, knowledgeItemIds: [item.id], payload, answerKey: { correctAnswer: { id: category.id, label: category.name }, optionIds: options.map((option) => option.id), explanation: item.explanation, reference: item.reference }, createdAt: Date.now(), expiresAt: context.expiresAt, snapshotVersion: 1 },
  };
}
