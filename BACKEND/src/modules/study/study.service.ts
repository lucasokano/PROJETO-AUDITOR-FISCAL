import { AppError } from "../../errors/AppError.js";

import {
  createStatement,
  findStatementsBySubtopicId,
  findStudyStructure,
  findSubtopicById,
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