import { AppError } from "../../../errors/AppError.js";
import { ExerciseType, type ClassifyOneResult, type PendingExercise } from "../exercise.types.js";

type Pending = Extract<PendingExercise, { type: ExerciseType.CLASSIFY_ONE }>;
export function gradeClassifyOne(pending: Pending, categoryId: number): ClassifyOneResult {
  if (!pending.answerKey.optionIds.includes(categoryId)) throw new AppError("A categoria selecionada não pertence ao exercício.", 400);
  return { exerciseId: pending.exerciseId, type: ExerciseType.CLASSIFY_ONE, isCorrect: categoryId === pending.answerKey.correctAnswer.id, correctAnswer: pending.answerKey.correctAnswer, explanation: pending.answerKey.explanation, reference: pending.answerKey.reference };
}
