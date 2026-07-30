import type {
  Request,
  Response,
} from "express";

import {
  addDiscipline,
  addStatement,
  addSubtopic,
  addTopic,
  editDiscipline,
  editSubtopic,
  editTopic,
  getStudyStructure,
  getSubtopicStatements,
  removeDiscipline,
  removeSubtopic,
  removeTopic,
} from "./study.service.js";

interface IdRouteParams {
  disciplineId?: string;
  topicId?: string;
  subtopicId?: string;
}

interface NameBody {
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

interface CreateStatementBody {
  subtopicId?: unknown;
  text?: unknown;
  correctAnswer?: unknown;
}

function parsePositiveInteger(
  value: string | undefined,
) {
  if (!value) {
    return null;
  }

  const parsed = Number(value);

  if (
    !Number.isInteger(parsed) ||
    parsed <= 0
  ) {
    return null;
  }

  return parsed;
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
  request: Request<IdRouteParams>,
  response: Response,
) {
  const subtopicId =
    parsePositiveInteger(
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
    await getSubtopicStatements(
      subtopicId,
    );

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
        "A resposta correta é obrigatória.",
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
    NameBody
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

  const discipline =
    await addDiscipline({ name });

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
      message:
        "O ID do tópico é inválido.",
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

export async function updateStudyDiscipline(
  request: Request<
    IdRouteParams,
    unknown,
    NameBody
  >,
  response: Response,
) {
  const disciplineId =
    parsePositiveInteger(
      request.params.disciplineId,
    );

  const { name } = request.body;

  if (!disciplineId) {
    response.status(400).json({
      message:
        "O ID da disciplina é inválido.",
    });

    return;
  }

  if (typeof name !== "string") {
    response.status(400).json({
      message:
        "O nome da disciplina é obrigatório.",
    });

    return;
  }

  const discipline =
    await editDiscipline({
      disciplineId,
      name,
    });

  response.status(200).json(discipline);
}

export async function updateStudyTopic(
  request: Request<
    IdRouteParams,
    unknown,
    NameBody
  >,
  response: Response,
) {
  const topicId = parsePositiveInteger(
    request.params.topicId,
  );

  const { name } = request.body;

  if (!topicId) {
    response.status(400).json({
      message:
        "O ID do tópico é inválido.",
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

  const topic = await editTopic({
    topicId,
    name,
  });

  response.status(200).json(topic);
}

export async function updateStudySubtopic(
  request: Request<
    IdRouteParams,
    unknown,
    NameBody
  >,
  response: Response,
) {
  const subtopicId =
    parsePositiveInteger(
      request.params.subtopicId,
    );

  const { name } = request.body;

  if (!subtopicId) {
    response.status(400).json({
      message:
        "O ID do subtópico é inválido.",
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

  const subtopic =
    await editSubtopic({
      subtopicId,
      name,
    });

  response.status(200).json(subtopic);
}

export async function deleteStudyDiscipline(
  request: Request<IdRouteParams>,
  response: Response,
) {
  const disciplineId =
    parsePositiveInteger(
      request.params.disciplineId,
    );

  if (!disciplineId) {
    response.status(400).json({
      message:
        "O ID da disciplina é inválido.",
    });

    return;
  }

  await removeDiscipline(disciplineId);

  response.status(204).send();
}

export async function deleteStudyTopic(
  request: Request<IdRouteParams>,
  response: Response,
) {
  const topicId = parsePositiveInteger(
    request.params.topicId,
  );

  if (!topicId) {
    response.status(400).json({
      message:
        "O ID do tópico é inválido.",
    });

    return;
  }

  await removeTopic(topicId);

  response.status(204).send();
}

export async function deleteStudySubtopic(
  request: Request<IdRouteParams>,
  response: Response,
) {
  const subtopicId =
    parsePositiveInteger(
      request.params.subtopicId,
    );

  if (!subtopicId) {
    response.status(400).json({
      message:
        "O ID do subtópico é inválido.",
    });

    return;
  }

  await removeSubtopic(subtopicId);

  response.status(204).send();
}