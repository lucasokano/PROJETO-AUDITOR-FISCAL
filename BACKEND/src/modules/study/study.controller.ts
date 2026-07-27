import type { Request, Response } from "express";

import {
  getStudyStructure,
  getSubtopicStatements,
} from "./study.service.js";

interface SubtopicRouteParams {
  subtopicId: string;
}

function parsePositiveInteger(value: string): number | null {
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
  const structure = await getStudyStructure();

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
      message: "O ID do subtópico é inválido.",
    });

    return;
  }

  const statements = await getSubtopicStatements(
    subtopicId,
  );

  response.status(200).json(statements);
}