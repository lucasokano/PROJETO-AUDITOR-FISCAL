import type { Request, Response } from "express";
import { generateNextExercise, getAvailableGroups, gradeExercise } from "./exercise.service.js";
import { ExerciseType, type SubmittedAnswer } from "./exercise.types.js";

function positiveInteger(value: unknown): value is number { return typeof value === "number" && Number.isInteger(value) && value > 0; }
function parseQueryId(value: unknown) { if (typeof value !== "string") return null; const parsed = Number(value); return positiveInteger(parsed) ? parsed : null; }
function isRecord(value: unknown): value is Record<string, unknown> { return typeof value === "object" && value !== null && !Array.isArray(value); }
function isExerciseType(value: unknown): value is ExerciseType { return Object.values(ExerciseType).includes(value as ExerciseType); }

function parseSubmission(body: unknown): SubmittedAnswer | null {
  if (!isRecord(body) || typeof body.exerciseId !== "string" || !isExerciseType(body.type) || !isRecord(body.answer)) return null;
  const exerciseId = body.exerciseId.trim(); if (!exerciseId) return null;
  switch (body.type) {
    case ExerciseType.CLASSIFY_ONE: return positiveInteger(body.answer.categoryId) ? { exerciseId, type: body.type, answer: { categoryId: body.answer.categoryId } } : null;
    case ExerciseType.CLASSIFY_BATCH: {
      if (!Array.isArray(body.answer.assignments) || !body.answer.assignments.every((entry) => isRecord(entry) && positiveInteger(entry.itemId) && positiveInteger(entry.categoryId))) return null;
      return { exerciseId, type: body.type, answer: { assignments: body.answer.assignments.map((entry) => ({ itemId: entry.itemId as number, categoryId: entry.categoryId as number })) } };
    }
    case ExerciseType.TRUE_FALSE: return typeof body.answer.value === "boolean" ? { exerciseId, type: body.type, answer: { value: body.answer.value } } : null;
    case ExerciseType.SINGLE_CHOICE: return positiveInteger(body.answer.itemId) ? { exerciseId, type: body.type, answer: { itemId: body.answer.itemId } } : null;
    case ExerciseType.MULTIPLE_SELECT: return Array.isArray(body.answer.selectedItemIds) && body.answer.selectedItemIds.every(positiveInteger) ? { exerciseId, type: body.type, answer: { selectedItemIds: body.answer.selectedItemIds } } : null;
    default: { const exhaustive: never = body.type; return exhaustive; }
  }
}

export async function getNextExercise(request: Request, response: Response) {
  const subtopicId = parseQueryId(request.query.subtopicId); const groupId = parseQueryId(request.query.groupId);
  const typeValue = request.query.type; const type = typeValue === undefined ? undefined : (isExerciseType(typeValue) ? typeValue : null);
  if (!subtopicId || !groupId || type === null) { response.status(400).json({ message: "Os parâmetros do exercício são inválidos." }); return; }
  response.status(200).json(await generateNextExercise({ subtopicId, groupId, type }));
}

export async function listExerciseGroups(request: Request, response: Response) {
  const subtopicId = parseQueryId(request.query.subtopicId);
  if (!subtopicId) { response.status(400).json({ message: "O ID do subtópico é inválido." }); return; }
  response.status(200).json(await getAvailableGroups(subtopicId));
}

export function answerExercise(request: Request, response: Response) {
  const submission = parseSubmission(request.body);
  if (!submission) { response.status(400).json({ message: "A resposta do exercício é inválida." }); return; }
  response.status(200).json(gradeExercise(submission));
}
