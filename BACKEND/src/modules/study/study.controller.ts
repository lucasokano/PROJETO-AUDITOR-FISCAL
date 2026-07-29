import type {
  Request,
  Response,
} from "express";

import {
  addStatement,
  getStudyStructure,
  getSubtopicStatements,
} from "./study.service.js";

interface SubtopicRouteParams {
  subtopicId: string;
}

interface CreateStatementBody {
  subtopicId?: unknown;
  text?: unknown;
  correctAnswer?: unknown;
}

function parsePositiveInteger(
  value: string,
): number | null {
  const parsedValue = Number(value);

  if (
    !Number.isInteger(parsedValue) ||
    parsedValue <= 0
  ) {
    return null;
  }

  return parsedValue;
}

export async function listStudyStructure(
  _request: Request,
  response: Response,
) {
  const structure =
    await getStudyStructure();

  response.status(200).json(structure);
}

export async function listSubtopicStatements(
  request: Request<SubtopicRouteParams>,
  response: Response,
) {
  const subtopicId = parsePositiveInteger(
    request.params.subtopicId,
  );

  if (!subtopicId) {
    response.status(400).json({
      message:
        "O ID do subtópico é inválido.",
    });

    return;
  }

  const statements =
    await getSubtopicStatements(subtopicId);

  response.status(200).json(statements);
}

export async function createStudyStatement(
  request: Request<
    Record<string, never>,
    unknown,
    CreateStatementBody
  >,
  response: Response,
) {
  const {
    subtopicId,
    text,
    correctAnswer,
  } = request.body;

  if (
    typeof subtopicId !== "number" ||
    !Number.isInteger(subtopicId) ||
    subtopicId <= 0
  ) {
    response.status(400).json({
      message:
        "O ID do subtópico é inválido.",
    });

    return;
  }

  if (typeof text !== "string") {
    response.status(400).json({
      message:
        "O texto da afirmação é obrigatório.",
    });

    return;
  }

  if (
    typeof correctAnswer !== "boolean"
  ) {
    response.status(400).json({
      message:
        "A resposta correta deve ser verdadeiro ou falso.",
    });

    return;
  }

  const statement = await addStatement({
    subtopicId,
    text,
    correctAnswer,
  });

  response.status(201).json(statement);
}