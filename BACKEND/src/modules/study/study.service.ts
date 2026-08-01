import { AppError } from "../../errors/AppError.js";

import {
  createDiscipline,
  createStatement,
  createStatementsBulk,
  createSubtopic,
  createTopic,
  deleteDiscipline,
  deleteStatement,
  deleteSubtopic,
  deleteTopic,
  findAllStatements,
  findDisciplineById,
  findDisciplineBySlug,
  findDisciplineDetailsById,
  findStatementById,
  findStatementsBySubtopicId,
  findStudyStructure,
  findSubtopicById,
  findSubtopicByTopicAndSlug,
  findSubtopicDetailsById,
  findTopicByDisciplineAndSlug,
  findTopicById,
  findTopicDetailsById,
  updateDiscipline,
  updateStatement,
  updateSubtopic,
  updateTopic,
  createAnswerAttempt,
  findDueReviewStatements,
  findDisciplineProgress,
  countDueReviewStatements,
} from "./study.repository.js";

interface BulkStatementInput {
  text: string;
  correctAnswer: boolean;
}

interface CreateStatementsBulkInput {
  subtopicId: number;
  statements: BulkStatementInput[];
}

interface UpdateStatementInput {
  statementId: number;
  subtopicId: number;
  text: string;
  correctAnswer: boolean;
}

interface RegisterAnswerInput {
  statementId: number;
  selectedAnswer: boolean;
}

interface CreateStatementInput {
  subtopicId: number;
  text: string;
  correctAnswer: boolean;
}

interface CreateDisciplineInput {
  name: string;
}

interface CreateTopicInput {
  disciplineId: number;
  name: string;
}

interface CreateSubtopicInput {
  topicId: number;
  name: string;
}

interface UpdateDisciplineInput {
  disciplineId: number;
  name: string;
}

interface UpdateTopicInput {
  topicId: number;
  name: string;
}

interface UpdateSubtopicInput {
  subtopicId: number;
  name: string;
}

function validateStatementText(value: string) {
  const text = value.trim();

  if (text.length < 3) {
    throw new AppError(
      "A afirmação deve possuir pelo menos 3 caracteres.",
      400,
    );
  }

  if (text.length > 2000) {
    throw new AppError(
      "A afirmação deve possuir no máximo 2000 caracteres.",
      400,
    );
  }

  return text;
}

function normalizeName(name: string) {
  return name.trim().replace(/\s+/g, " ");
}

function createSlug(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function validateName(name: string) {
  const normalizedName = normalizeName(name);

  if (normalizedName.length < 2) {
    throw new AppError(
      "O nome deve possuir pelo menos 2 caracteres.",
      400,
    );
  }

  if (normalizedName.length > 120) {
    throw new AppError(
      "O nome deve possuir no máximo 120 caracteres.",
      400,
    );
  }

  return normalizedName;
}

export function getStudyStructure() {
  return findStudyStructure();
}

export async function getSubtopicStatements(
  subtopicId: number,
) {
  const subtopic =
    await findSubtopicById(subtopicId);

  if (!subtopic) {
    throw new AppError(
      "Subtópico não encontrado.",
      404,
    );
  }

  return findStatementsBySubtopicId(
    subtopicId,
  );
}

export async function addStatement(
  input: CreateStatementInput,
) {
  const text = validateStatementText(
    input.text,
  );

  const subtopic =
    await findSubtopicById(
      input.subtopicId,
    );

  if (!subtopic) {
    throw new AppError(
      "Subtópico não encontrado.",
      404,
    );
  }

  return createStatement({
    subtopicId: input.subtopicId,
    text,
    correctAnswer: input.correctAnswer,
  });
}

export async function addDiscipline(
  input: CreateDisciplineInput,
) {
  const name = validateName(input.name);
  const slug = createSlug(name);

  const existing =
    await findDisciplineBySlug(slug);

  if (existing) {
    throw new AppError(
      "Já existe uma disciplina com esse nome.",
      409,
    );
  }

  return createDiscipline({
    name,
    slug,
  });
}

export async function addTopic(
  input: CreateTopicInput,
) {
  const name = validateName(input.name);

  const discipline =
    await findDisciplineById(
      input.disciplineId,
    );

  if (!discipline) {
    throw new AppError(
      "Disciplina não encontrada.",
      404,
    );
  }

  const slug = createSlug(name);

  const existing =
    await findTopicByDisciplineAndSlug(
      input.disciplineId,
      slug,
    );

  if (existing) {
    throw new AppError(
      "Já existe um tópico com esse nome nessa disciplina.",
      409,
    );
  }

  return createTopic({
    disciplineId: input.disciplineId,
    name,
    slug,
  });
}

export async function addSubtopic(
  input: CreateSubtopicInput,
) {
  const name = validateName(input.name);

  const topic = await findTopicById(
    input.topicId,
  );

  if (!topic) {
    throw new AppError(
      "Tópico não encontrado.",
      404,
    );
  }

  const slug = createSlug(name);

  const existing =
    await findSubtopicByTopicAndSlug(
      input.topicId,
      slug,
    );

  if (existing) {
    throw new AppError(
      "Já existe um subtópico com esse nome nesse tópico.",
      409,
    );
  }

  return createSubtopic({
    topicId: input.topicId,
    name,
    slug,
  });
}

export async function editDiscipline(
  input: UpdateDisciplineInput,
) {
  const name = validateName(input.name);
  const slug = createSlug(name);

  const discipline =
    await findDisciplineDetailsById(
      input.disciplineId,
    );

  if (!discipline) {
    throw new AppError(
      "Disciplina não encontrada.",
      404,
    );
  }

  const existing =
    await findDisciplineBySlug(slug);

  if (
    existing &&
    existing.id !== input.disciplineId
  ) {
    throw new AppError(
      "Já existe uma disciplina com esse nome.",
      409,
    );
  }

  return updateDiscipline(
    input.disciplineId,
    {
      name,
      slug,
    },
  );
}

export async function editTopic(
  input: UpdateTopicInput,
) {
  const name = validateName(input.name);
  const slug = createSlug(name);

  const topic =
    await findTopicDetailsById(
      input.topicId,
    );

  if (!topic) {
    throw new AppError(
      "Tópico não encontrado.",
      404,
    );
  }

  const existing =
    await findTopicByDisciplineAndSlug(
      topic.disciplineId,
      slug,
    );

  if (
    existing &&
    existing.id !== input.topicId
  ) {
    throw new AppError(
      "Já existe um tópico com esse nome nessa disciplina.",
      409,
    );
  }

  return updateTopic(input.topicId, {
    name,
    slug,
  });
}

export async function editSubtopic(
  input: UpdateSubtopicInput,
) {
  const name = validateName(input.name);
  const slug = createSlug(name);

  const subtopic =
    await findSubtopicDetailsById(
      input.subtopicId,
    );

  if (!subtopic) {
    throw new AppError(
      "Subtópico não encontrado.",
      404,
    );
  }

  const existing =
    await findSubtopicByTopicAndSlug(
      subtopic.topicId,
      slug,
    );

  if (
    existing &&
    existing.id !== input.subtopicId
  ) {
    throw new AppError(
      "Já existe um subtópico com esse nome nesse tópico.",
      409,
    );
  }

  return updateSubtopic(
    input.subtopicId,
    {
      name,
      slug,
    },
  );
}

export async function removeDiscipline(
  disciplineId: number,
) {
  const discipline =
    await findDisciplineDetailsById(
      disciplineId,
    );

  if (!discipline) {
    throw new AppError(
      "Disciplina não encontrada.",
      404,
    );
  }

  if (discipline._count.topics > 0) {
    throw new AppError(
      "Remova os tópicos antes de excluir a disciplina.",
      409,
    );
  }

  await deleteDiscipline(disciplineId);
}

export async function removeTopic(
  topicId: number,
) {
  const topic =
    await findTopicDetailsById(topicId);

  if (!topic) {
    throw new AppError(
      "Tópico não encontrado.",
      404,
    );
  }

  if (topic._count.subtopics > 0) {
    throw new AppError(
      "Remova os subtópicos antes de excluir o tópico.",
      409,
    );
  }

  await deleteTopic(topicId);
}

export async function removeSubtopic(
  subtopicId: number,
) {
  const subtopic =
    await findSubtopicDetailsById(
      subtopicId,
    );

  if (!subtopic) {
    throw new AppError(
      "Subtópico não encontrado.",
      404,
    );
  }

  if (subtopic._count.statements > 0) {
    throw new AppError(
      "Remova as afirmações antes de excluir o subtópico.",
      409,
    );
  }

  await deleteSubtopic(subtopicId);
}

export function getAllStatements() {
  return findAllStatements();
}

export async function addStatementsBulk(
  input: CreateStatementsBulkInput,
) {
  const subtopic =
    await findSubtopicById(
      input.subtopicId,
    );

  if (!subtopic) {
    throw new AppError(
      "Subtópico não encontrado.",
      404,
    );
  }

  if (input.statements.length === 0) {
    throw new AppError(
      "Informe pelo menos uma afirmação.",
      400,
    );
  }

  if (input.statements.length > 500) {
    throw new AppError(
      "O limite por importação é de 500 afirmações.",
      400,
    );
  }

  const statements =
    input.statements.map(
      (statement) => ({
        text: validateStatementText(
          statement.text,
        ),
        correctAnswer:
          statement.correctAnswer,
      }),
    );

  return createStatementsBulk({
    subtopicId: input.subtopicId,
    statements,
  });
}

export async function editStatement(
  input: UpdateStatementInput,
) {
  const text = validateStatementText(
    input.text,
  );

  const statement =
    await findStatementById(
      input.statementId,
    );

  if (!statement) {
    throw new AppError(
      "Afirmação não encontrada.",
      404,
    );
  }

  const subtopic =
    await findSubtopicById(
      input.subtopicId,
    );

  if (!subtopic) {
    throw new AppError(
      "Subtópico não encontrado.",
      404,
    );
  }

  return updateStatement(
    input.statementId,
    {
      subtopicId: input.subtopicId,
      text,
      correctAnswer:
        input.correctAnswer,
    },
  );
}

export async function removeStatement(
  statementId: number,
) {
  const statement =
    await findStatementById(
      statementId,
    );

  if (!statement) {
    throw new AppError(
      "Afirmação não encontrada.",
      404,
    );
  }

  await deleteStatement(statementId);
}

export async function registerAnswer(
  input: RegisterAnswerInput,
) {
  const statement =
    await findStatementById(
      input.statementId,
    );

  if (!statement) {
    throw new AppError(
      "Afirmação não encontrada.",
      404,
    );
  }

  const isCorrect =
    statement.correctAnswer ===
    input.selectedAnswer;

  return createAnswerAttempt({
    statementId: input.statementId,
    selectedAnswer:
      input.selectedAnswer,
    isCorrect,
  });
}

export async function getDueReviewStatements(
  limit = 30,
) {
  if (limit <= 0) {
    throw new AppError(
      "O limite deve ser maior que zero.",
      400,
    );
  }

  if (limit > 200) {
    limit = 200;
  }

  return findDueReviewStatements(limit);
}
export async function getDisciplineProgress() {
  const disciplines =
    await findDisciplineProgress();

  return disciplines.map((discipline) => ({
    disciplineId: discipline.disciplineId,
    name: discipline.name,
    totalStatements:
      discipline.totalStatements,
    answeredStatements:
      discipline.answeredStatements,
    percentage:
      discipline.totalStatements === 0
        ? 0
        : Math.round(
            (discipline.answeredStatements /
              discipline.totalStatements) *
              100,
          ),
  }));
}

export async function getStudyDashboard() {
  const [
    dueReviews,
    disciplines,
  ] = await Promise.all([
    countDueReviewStatements(),
    getDisciplineProgress(),
  ]);

  return {
    dueReviews,
    disciplines,
  };
}