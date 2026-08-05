import { AppError } from "../../../errors/AppError.js";
import { ExerciseType, type PendingExercise, type SingleChoiceResult } from "../exercise.types.js";
type Pending = Extract<PendingExercise, { type: ExerciseType.SINGLE_CHOICE }>;
export function gradeSingleChoice(pending: Pending, itemId: number): SingleChoiceResult {
  if (!pending.answerKey.optionIds.includes(itemId)) throw new AppError("O item selecionado não pertence ao exercício.", 400);
  const selectedAnswer = pending.payload.options.find((option) => option.itemId === itemId)!;
  return { exerciseId: pending.exerciseId, type: ExerciseType.SINGLE_CHOICE, isCorrect: itemId === pending.answerKey.correctItem.itemId, selectedAnswer, correctAnswer: pending.answerKey.correctItem, explanation: pending.answerKey.explanation, reference: pending.answerKey.reference };
}
