import type {
  Request,
  Response,
} from "express";

import {
  addDiscipline,
  addStatement,
  addSubtopic,
  addTopic,
  getStudyStructure,
  getSubtopicStatements,
} from "./study.service.js";

interface CreateDisciplineBody {
  name?: unknown;
}

interface CreateTopicBody {
  disciplineId?: unknown;
  name?: unknown;
}

interface CreateSubtopicBody {
  topicId?: unknown;
  name?: unknown;
}

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

export async function createStudyDiscipline(
  request: Request<
    Record<string, never>,
    unknown,
    CreateDisciplineBody
  >,
  response: Response,
) {
  const { name } = request.body;

  if (typeof name !== "string") {
    response.status(400).json({
      message:
        "O nome da disciplina é obrigatório.",
    });

    return;
  }

  const discipline = await addDiscipline({
    name,
  });

  response.status(201).json(discipline);
}

export async function createStudyTopic(
  request: Request<
    Record<string, never>,
    unknown,
    CreateTopicBody
  >,
  response: Response,
) {
  const { disciplineId, name } =
    request.body;

  if (
    typeof disciplineId !== "number" ||
    !Number.isInteger(disciplineId) ||
    disciplineId <= 0
  ) {
    response.status(400).json({
      message:
        "O ID da disciplina é inválido.",
    });

    return;
  }

  if (typeof name !== "string") {
    response.status(400).json({
      message:
        "O nome do tópico é obrigatório.",
    });

    return;
  }

  const topic = await addTopic({
    disciplineId,
    name,
  });

  response.status(201).json(topic);
}

export async function createStudySubtopic(
  request: Request<
    Record<string, never>,
    unknown,
    CreateSubtopicBody
  >,
  response: Response,
) {
  const { topicId, name } = request.body;

  if (
    typeof topicId !== "number" ||
    !Number.isInteger(topicId) ||
    topicId <= 0
  ) {
    response.status(400).json({
      message: "O ID do tópico é inválido.",
    });

    return;
  }

  if (typeof name !== "string") {
    response.status(400).json({
      message:
        "O nome do subtópico é obrigatório.",
    });

    return;
  }

  const subtopic = await addSubtopic({
    topicId,
    name,
  });

  response.status(201).json(subtopic);
}