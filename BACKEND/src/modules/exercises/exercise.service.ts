import { randomUUID } from "node:crypto";
import { AppError } from "../../errors/AppError.js";
import { getEligibleTypes } from "./exercise.eligibility.js";
import { gradePendingExercise } from "./exercise.grader.js";
import { findAvailableGroups, findExerciseSource } from "./exercise.repository.js";
import { consumePendingExercise, EXERCISE_TTL_MS, getLastItemId, savePendingExercise, setLastItemId } from "./exercise.store.js";
import { ExerciseType, type ExerciseResult, type ExerciseSource, type GeneratedExercise, type PresentedExercise, type SubmittedAnswer } from "./exercise.types.js";
import { generateClassifyBatch } from "./generators/classify-batch.generator.js";
import { generateClassifyOne } from "./generators/classify-one.generator.js";
import { generateMultipleSelect } from "./generators/multiple-select.generator.js";
import { generateSingleChoice } from "./generators/single-choice.generator.js";
import { generateTrueFalse } from "./generators/true-false.generator.js";

let nextTrueFalseValue = true;

export async function getAvailableGroups(subtopicId: number) {
  const groups = await findAvailableGroups(subtopicId);
  const availability = await Promise.all(groups.map(async (group) => {
    const source = await findExerciseSource(subtopicId, group.id);
    return { ...group, eligibleTypes: source ? getEligibleTypes(source) : [] };
  }));
  return availability.filter((group) => group.eligibleTypes.length > 0);
}

function generateByType(type: ExerciseType, source: ExerciseSource, context: { exerciseId: string; subtopicId: number; expiresAt: number }): GeneratedExercise {
  switch (type) {
    case ExerciseType.CLASSIFY_ONE: return generateClassifyOne(source, { ...context, excludedItemId: getLastItemId(`${context.subtopicId}:${source.id}:${type}`) });
    case ExerciseType.CLASSIFY_BATCH: return generateClassifyBatch(source, context);
    case ExerciseType.TRUE_FALSE: {
      const generated = generateTrueFalse(source, { ...context, forceTruth: nextTrueFalseValue });
      nextTrueFalseValue = !nextTrueFalseValue;
      return generated;
    }
    case ExerciseType.SINGLE_CHOICE: return generateSingleChoice(source, context);
    case ExerciseType.MULTIPLE_SELECT: return generateMultipleSelect(source, context);
    default: { const exhaustive: never = type; return exhaustive; }
  }
}

export async function generateNextExercise(input: { subtopicId: number; groupId: number; type?: ExerciseType }): Promise<PresentedExercise> {
  const source = await findExerciseSource(input.subtopicId, input.groupId);
  if (!source) throw new AppError("Grupo ativo não encontrado no subtópico informado.", 404);
  const type = input.type ?? ExerciseType.CLASSIFY_ONE;
  if (!getEligibleTypes(source).includes(type)) throw new AppError("O tipo de exercício não é elegível para este grupo.", 409);
  const exerciseId = randomUUID();
  const generated = generateByType(type, source, { exerciseId, subtopicId: input.subtopicId, expiresAt: Date.now() + EXERCISE_TTL_MS });
  savePendingExercise(generated.pending);
  if (type === ExerciseType.CLASSIFY_ONE) setLastItemId(`${input.subtopicId}:${input.groupId}:${type}`, generated.pending.knowledgeItemIds[0]!);
  return generated.presented;
}

export function gradeExercise(submission: SubmittedAnswer): ExerciseResult {
  const pending = consumePendingExercise(submission.exerciseId);
  if (!pending) throw new AppError("O exercício expirou ou já foi respondido.", 409);
  return gradePendingExercise(pending, submission);
}
