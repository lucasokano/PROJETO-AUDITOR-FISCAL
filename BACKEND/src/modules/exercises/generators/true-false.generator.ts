import { getClassifiableItems } from "../exercise.eligibility.js";
import { ExerciseType, type ExerciseSource, type GeneratedExercise } from "../exercise.types.js";
import { pickOne } from "../exercise.utils.js";

export function generateTrueFalse(source: ExerciseSource, context: { exerciseId: string; subtopicId: number; expiresAt: number; forceTruth?: boolean }): GeneratedExercise {
  const item = pickOne(getClassifiableItems(source));
  const correctCategory = item.classifications[0]!.category;
  const truth = context.forceTruth ?? Math.random() < 0.5;
  const shownCategory = truth ? correctCategory : pickOne(source.categories.filter((category) => category.id !== correctCategory.id));
  const payload = { statement: `${item.text} pertence à categoria ${shownCategory.name}.`, groupName: source.name, instruction: source.instruction };
  return {
    presented: { exerciseId: context.exerciseId, type: ExerciseType.TRUE_FALSE, payload },
    pending: { exerciseId: context.exerciseId, type: ExerciseType.TRUE_FALSE, subtopicId: context.subtopicId, groupId: source.id, knowledgeItemIds: [item.id], payload, answerKey: { correctAnswer: truth, explanation: item.explanation, reference: item.reference }, createdAt: Date.now(), expiresAt: context.expiresAt, snapshotVersion: 1 },
  };
}
