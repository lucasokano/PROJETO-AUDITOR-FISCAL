import { AppError } from "../../errors/AppError.js";

import {
  createDiscipline,
  createStatement,
  createSubtopic,
  createTopic,
  findDisciplineById,
  findDisciplineBySlug,
  findStatementsBySubtopicId,
  findStudyStructure,
  findSubtopicById,
  findSubtopicByTopicAndSlug,
  findTopicByDisciplineAndSlug,
  findTopicById,
} from "./study.repository.js";

interface CreateStatementInput {
  subtopicId: number;
  text: string;
  correctAnswer: boolean;
}

export async function getStudyStructure() {
  return findStudyStructure();
}

export async function getSubtopicStatements(
  subtopicId: number,
) {
  const subtopic = await findSubtopicById(
    subtopicId,
  );

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
  const text = input.text.trim();

  if (text.length < 5) {
    throw new AppError(
      "A afirmação deve possuir pelo menos 5 caracteres.",
      400,
    );
  }

  if (text.length > 2000) {
    throw new AppError(
      "A afirmação deve possuir no máximo 2000 caracteres.",
      400,
    );
  }

  const subtopic = await findSubtopicById(
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

export async function addDiscipline(
  input: CreateDisciplineInput,
) {
  const name = validateName(input.name);
  const slug = createSlug(name);

  const existingDiscipline =
    await findDisciplineBySlug(slug);

  if (existingDiscipline) {
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

  const discipline = await findDisciplineById(
    input.disciplineId,
  );

  if (!discipline) {
    throw new AppError(
      "Disciplina não encontrada.",
      404,
    );
  }

  const slug = createSlug(name);

  const existingTopic =
    await findTopicByDisciplineAndSlug(
      input.disciplineId,
      slug,
    );

  if (existingTopic) {
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

  const existingSubtopic =
    await findSubtopicByTopicAndSlug(
      input.topicId,
      slug,
    );

  if (existingSubtopic) {
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