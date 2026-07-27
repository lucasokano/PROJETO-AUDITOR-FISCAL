import { AppError } from "../../errors/AppError.js";

import {
  findStatementsBySubtopicId,
  findStudyStructure,
  findSubtopicById,
} from "./study.repository.js";

export async function getStudyStructure() {
  return findStudyStructure();
}

export async function getSubtopicStatements(
  subtopicId: number,
) {
  const subtopic = await findSubtopicById(subtopicId);

  if (!subtopic) {
    throw new AppError("Subtópico não encontrado.", 404);
  }

  return findStatementsBySubtopicId(subtopicId);
}