import { randomUUID } from "node:crypto";
import { AppError } from "../../errors/AppError.js";
import {
  findAvailableGroups,
  findExerciseSource,
} from "./exercise.repository.js";
import {
  consumePendingExercise,
  getLastItemId,
  savePendingExercise,
  setLastItemId,
} from "./exercise.store.js";
import {
  ExerciseType,
  type ExerciseOption,
  type ExerciseResult,
  type PresentedExercise,
  type SubmittedAnswer,
} from "./exercise.types.js";

function shuffle<T>(values: T[]) {
  const shuffled = [...values];

  for (let index = shuffled.length - 1; index > 0; index--) {
    const target = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[target]] = [
      shuffled[target]!,
      shuffled[index]!,
    ];
  }

  return shuffled;
}

export function getAvailableGroups(subtopicId: number) {
  return findAvailableGroups(subtopicId);
}

export async function generateNextExercise(input: {
  subtopicId: number;
  groupId: number;
}): Promise<PresentedExercise> {
  const source = await findExerciseSource(
    input.subtopicId,
    input.groupId,
  );

  if (!source) {
    throw new AppError(
      "Grupo ativo não encontrado no subtópico informado.",
      404,
    );
  }

  if (source.categories.length === 0) {
    throw new AppError(
      "O grupo não possui categorias disponíveis.",
      409,
    );
  }

  const eligibleItems =
    source.subtopic.knowledgeItems.filter(
      (item) => item.classifications.length === 1,
    );

  if (eligibleItems.length === 0) {
    throw new AppError(
      "Não há itens ativos com uma classificação única neste grupo.",
      409,
    );
  }

  const scope = `${input.subtopicId}:${input.groupId}`;
  const lastItemId = getLastItemId(scope);
  const candidates = eligibleItems.length > 1
    ? eligibleItems.filter((item) => item.id !== lastItemId)
    : eligibleItems;
  const item = candidates[
    Math.floor(Math.random() * candidates.length)
  ]!;
  const correctCategory = item.classifications[0]!.category;
  const options: ExerciseOption[] = shuffle(
    source.categories.map((category) => ({
      id: category.id,
      label: category.name,
    })),
  );
  const exerciseId = randomUUID();

  savePendingExercise(exerciseId, {
    correctAnswer: {
      id: correctCategory.id,
      label: correctCategory.name,
    },
    optionIds: options.map((option) => option.id),
    explanation: item.explanation,
    reference: item.reference,
  });
  setLastItemId(scope, item.id);

  return {
    exerciseId,
    type: ExerciseType.CLASSIFY_ONE,
    payload: {
      prompt: `${item.text} pertence a qual categoria?`,
      itemText: item.text,
      groupName: source.name,
      instruction: source.instruction,
      options,
    },
  };
}

export function gradeExercise(
  submission: SubmittedAnswer,
): ExerciseResult {
  const pending = consumePendingExercise(
    submission.exerciseId,
  );

  if (!pending) {
    throw new AppError(
      "O exercício expirou ou já foi respondido.",
      409,
    );
  }

  if (!pending.optionIds.includes(submission.answer.categoryId)) {
    throw new AppError(
      "A categoria selecionada não pertence ao exercício.",
      400,
    );
  }

  return {
    exerciseId: submission.exerciseId,
    type: ExerciseType.CLASSIFY_ONE,
    isCorrect:
      submission.answer.categoryId ===
      pending.correctAnswer.id,
    correctAnswer: pending.correctAnswer,
    explanation: pending.explanation,
    reference: pending.reference,
  };
}
