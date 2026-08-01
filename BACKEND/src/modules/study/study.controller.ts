import type {
  Request,
  Response,
} from "express";

import {
  addDiscipline,
  addStatement,
  addStatementsBulk,
  addSubtopic,
  addTopic,
  editDiscipline,
  editStatement,
  editSubtopic,
  editTopic,
  getAllStatements,
  getStudyStructure,
  getSubtopicStatements,
  removeDiscipline,
  removeStatement,
  removeSubtopic,
  removeTopic,
  registerAnswer,
  getDueReviewStatements,
} from "./study.service.js";

interface IdRouteParams {
  disciplineId?: string;
  topicId?: string;
  subtopicId?: string;
  statementId?: string;
}

interface RegisterAnswerBody {
  statementId?: unknown;
  selectedAnswer?: unknown;
}

interface StatementInputBody {
  text?: unknown;
  correctAnswer?: unknown;
}

interface CreateStatementsBulkBody {
  subtopicId?: unknown;
  statements?: unknown;
}

interface UpdateStatementBody {
  subtopicId?: unknown;
  text?: unknown;
  correctAnswer?: unknown;
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

function isValidStatementInput(
  value: unknown,
): value is {
  text: string;
  correctAnswer: boolean;
} {
  if (
    typeof value !== "object" ||
    value === null
  ) {
    return false;
  }

  const statement =
    value as StatementInputBody;

  return (
    typeof statement.text === "string" &&
    statement.text.trim().length > 0 &&
    statement.text.trim().length <= 2000 &&
    typeof statement.correctAnswer ===
      "boolean"
  );
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

if (
  typeof text !== "string" ||
  text.trim().length === 0
) {
  response.status(400).json({
    message:
      "O texto da afirmação é obrigatório.",
  });

  return;
}

if (text.trim().length > 2000) {
  response.status(400).json({
    message:
      "O texto da afirmação deve ter no máximo 2000 caracteres.",
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
  text: text.trim(),
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

export async function listAllStatements(
  _request: Request,
  response: Response,
) {
  const statements =
    await getAllStatements();

  response.status(200).json(statements);
}

export async function createStudyStatementsBulk(
  request: Request<
    Record<string, never>,
    unknown,
    CreateStatementsBulkBody
  >,
  response: Response,
) {
  const { subtopicId, statements } =
    request.body;

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

  if (
    !Array.isArray(statements) ||
    statements.length === 0
  ) {
    response.status(400).json({
      message:
        "Informe pelo menos uma afirmação.",
    });

    return;
  }

  if (statements.length > 500) {
    response.status(400).json({
      message:
        "O limite por importação é de 500 afirmações.",
    });

    return;
  }

  const invalidStatementIndex =
    statements.findIndex(
      (statement) =>
        !isValidStatementInput(statement),
    );

  if (invalidStatementIndex !== -1) {
    response.status(400).json({
      message:
        `A afirmação da posição ${
          invalidStatementIndex + 1
        } é inválida.`,
    });

    return;
  }

  const normalizedStatements =
    statements.map((statement) => ({
      text: statement.text.trim(),
      correctAnswer:
        statement.correctAnswer,
    }));

  const createdStatements =
    await addStatementsBulk({
      subtopicId,
      statements: normalizedStatements,
    });

  response
    .status(201)
    .json(createdStatements);
}

export async function updateStudyStatement(
  request: Request<
    IdRouteParams,
    unknown,
    UpdateStatementBody
  >,
  response: Response,
) {
  const statementId =
    parsePositiveInteger(
      request.params.statementId,
    );

  if (!statementId) {
    response.status(400).json({
      message:
        "O ID da afirmação é inválido.",
    });

    return;
  }

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

  if (
    typeof text !== "string" ||
    text.trim().length === 0
  ) {
    response.status(400).json({
      message:
        "O texto da afirmação é obrigatório.",
    });

    return;
  }

  if (text.trim().length > 2000) {
    response.status(400).json({
      message:
        "O texto da afirmação deve ter no máximo 2000 caracteres.",
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

  const statement =
    await editStatement({
      statementId,
      subtopicId,
      text: text.trim(),
      correctAnswer,
    });

  response.status(200).json(statement);
}

export async function deleteStudyStatement(
  request: Request<IdRouteParams>,
  response: Response,
) {
  const statementId =
    parsePositiveInteger(
      request.params.statementId,
    );

  if (!statementId) {
    response.status(400).json({
      message:
        "O ID da afirmação é inválido.",
    });

    return;
  }

  await removeStatement(statementId);

  response.status(204).send();
}

export async function registerStudyAnswer(
  request: Request<
    Record<string, never>,
    unknown,
    RegisterAnswerBody
  >,
  response: Response,
) {
  const {
    statementId,
    selectedAnswer,
  } = request.body;

  if (
    typeof statementId !== "number" ||
    !Number.isInteger(statementId) ||
    statementId <= 0
  ) {
    response.status(400).json({
      message:
        "O ID da afirmação é inválido.",
    });

    return;
  }

  if (
    typeof selectedAnswer !==
    "boolean"
  ) {
    response.status(400).json({
      message:
        "A resposta é obrigatória.",
    });

    return;
  }

  const attempt =
    await registerAnswer({
      statementId,
      selectedAnswer,
    });

  response.status(201).json(attempt);
}

export async function listDueReviewStatements(
  request: Request,
  response: Response,
) {
  const limitParam = request.query.limit;

  const limit =
    typeof limitParam === "string"
      ? Number(limitParam)
      : 30;

  const statements =
    await getDueReviewStatements(limit);

  response.status(200).json(statements);
}