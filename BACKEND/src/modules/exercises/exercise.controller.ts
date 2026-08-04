import type { Request, Response } from "express";
import {
  generateNextExercise,
  getAvailableGroups,
  gradeExercise,
} from "./exercise.service.js";
import {
  ExerciseType,
  type SubmittedAnswer,
} from "./exercise.types.js";

interface AnswerBody {
  exerciseId?: unknown;
  type?: unknown;
  answer?: unknown;
}

function parsePositiveInteger(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0
    ? parsed
    : null;
}

export async function getNextExercise(
  request: Request,
  response: Response,
) {
  const subtopicId = parsePositiveInteger(
    request.query.subtopicId,
  );
  const groupId = parsePositiveInteger(
    request.query.groupId,
  );

  if (!subtopicId || !groupId) {
    response.status(400).json({
      message:
        "Os IDs do subtópico e do grupo são inválidos.",
    });
    return;
  }

  const exercise = await generateNextExercise({
    subtopicId,
    groupId,
  });
  response.status(200).json(exercise);
}

export async function listExerciseGroups(
  request: Request,
  response: Response,
) {
  const subtopicId = parsePositiveInteger(
    request.query.subtopicId,
  );

  if (!subtopicId) {
    response.status(400).json({
      message: "O ID do subtópico é inválido.",
    });
    return;
  }

  const groups = await getAvailableGroups(subtopicId);
  response.status(200).json(groups);
}

export function answerExercise(
  request: Request<
    Record<string, never>,
    unknown,
    AnswerBody
  >,
  response: Response,
) {
  const { exerciseId, type, answer } = request.body;

  if (
    typeof exerciseId !== "string" ||
    exerciseId.trim().length === 0
  ) {
    response.status(400).json({
      message: "O ID do exercício é inválido.",
    });
    return;
  }

  if (type !== ExerciseType.CLASSIFY_ONE) {
    response.status(400).json({
      message: "O tipo de exercício é inválido.",
    });
    return;
  }

  if (
    typeof answer !== "object" ||
    answer === null ||
    !("categoryId" in answer) ||
    typeof answer.categoryId !== "number" ||
    !Number.isInteger(answer.categoryId) ||
    answer.categoryId <= 0
  ) {
    response.status(400).json({
      message: "A resposta do exercício é inválida.",
    });
    return;
  }

  const submission: SubmittedAnswer = {
    exerciseId: exerciseId.trim(),
    type,
    answer: { categoryId: answer.categoryId },
  };
  const result = gradeExercise(submission);
  response.status(200).json(result);
}
