import { AppError } from "../../errors/AppError.js";
import { gradeClassifyBatch } from "./graders/classify-batch.grader.js";
import { gradeClassifyOne } from "./graders/classify-one.grader.js";
import { gradeMultipleSelect } from "./graders/multiple-select.grader.js";
import { gradeSingleChoice } from "./graders/single-choice.grader.js";
import { gradeTrueFalse } from "./graders/true-false.grader.js";
import { ExerciseType, type ExerciseResult, type PendingExercise, type SubmittedAnswer } from "./exercise.types.js";

export function gradePendingExercise(pending: PendingExercise, submission: SubmittedAnswer): ExerciseResult {
  if (pending.type !== submission.type) throw new AppError("O tipo informado não corresponde ao exercício.", 400);
  switch (pending.type) {
    case ExerciseType.CLASSIFY_ONE: return gradeClassifyOne(pending, (submission as Extract<SubmittedAnswer, { type: ExerciseType.CLASSIFY_ONE }>).answer.categoryId);
    case ExerciseType.CLASSIFY_BATCH: return gradeClassifyBatch(pending, (submission as Extract<SubmittedAnswer, { type: ExerciseType.CLASSIFY_BATCH }>).answer.assignments);
    case ExerciseType.TRUE_FALSE: return gradeTrueFalse(pending, (submission as Extract<SubmittedAnswer, { type: ExerciseType.TRUE_FALSE }>).answer.value);
    case ExerciseType.SINGLE_CHOICE: return gradeSingleChoice(pending, (submission as Extract<SubmittedAnswer, { type: ExerciseType.SINGLE_CHOICE }>).answer.itemId);
    case ExerciseType.MULTIPLE_SELECT: return gradeMultipleSelect(pending, (submission as Extract<SubmittedAnswer, { type: ExerciseType.MULTIPLE_SELECT }>).answer.selectedItemIds);
    default: { const exhaustive: never = pending; return exhaustive; }
  }
}
