import { ExerciseType, type PendingExercise, type TrueFalseResult } from "../exercise.types.js";
type Pending = Extract<PendingExercise, { type: ExerciseType.TRUE_FALSE }>;
export function gradeTrueFalse(pending: Pending, value: boolean): TrueFalseResult {
  return { exerciseId: pending.exerciseId, type: ExerciseType.TRUE_FALSE, isCorrect: value === pending.answerKey.correctAnswer, correctAnswer: pending.answerKey.correctAnswer, explanation: pending.answerKey.explanation, reference: pending.answerKey.reference };
}
