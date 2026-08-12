import type { Request, Response } from "express";
import {
  createClozeQuestion, createConceptQuestion, deleteClozeQuestion, deleteConceptQuestion,
  listClozeQuestions, listConceptQuestions, listStudyClozeQuestions, listStudyConceptQuestions,
  revealClozeAnswer, revealConceptAnswer, updateClozeQuestion, updateConceptQuestion,
} from "./authored-question.service.js";

function positiveInteger(value: unknown) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function requiredString(value: unknown) {
  return typeof value === "string" ? value : null;
}

function optionalBoolean(value: unknown) {
  return value === undefined || typeof value === "boolean" ? value : null;
}

function sendInvalid(response: Response) {
  response.status(400).json({ message: "Dados da questão inválidos." });
}

export async function getConceptQuestions(_request: Request, response: Response) {
  response.json(await listConceptQuestions());
}

export async function postConceptQuestion(request: Request, response: Response) {
  const subtopicId = positiveInteger(request.body?.subtopicId);
  const question = requiredString(request.body?.question);
  const answer = requiredString(request.body?.answer);
  if (!subtopicId || question === null || answer === null) return sendInvalid(response);
  response.status(201).json(await createConceptQuestion({ subtopicId, question, answer }));
}

export async function putConceptQuestion(request: Request, response: Response) {
  const id = positiveInteger(request.params.questionId);
  const subtopicId = positiveInteger(request.body?.subtopicId);
  const question = requiredString(request.body?.question);
  const answer = requiredString(request.body?.answer);
  const isActive = optionalBoolean(request.body?.isActive);
  if (!id || !subtopicId || question === null || answer === null || isActive === null) return sendInvalid(response);
  response.json(await updateConceptQuestion(id, { subtopicId, question, answer, isActive }));
}

export async function removeConceptQuestion(request: Request, response: Response) {
  const id = positiveInteger(request.params.questionId);
  if (!id) return sendInvalid(response);
  await deleteConceptQuestion(id); response.status(204).send();
}

export async function getStudyConceptQuestions(request: Request, response: Response) {
  const subtopicId = positiveInteger(request.query.subtopicId);
  if (!subtopicId) return sendInvalid(response);
  response.json(await listStudyConceptQuestions(subtopicId));
}

export async function revealStudyConceptQuestion(request: Request, response: Response) {
  const id = positiveInteger(request.params.questionId);
  if (!id) return sendInvalid(response);
  response.json(await revealConceptAnswer(id));
}

export async function getClozeQuestions(_request: Request, response: Response) {
  response.json(await listClozeQuestions());
}

export async function postClozeQuestion(request: Request, response: Response) {
  const subtopicId = positiveInteger(request.body?.subtopicId);
  const textWithAnswers = requiredString(request.body?.textWithAnswers);
  if (!subtopicId || textWithAnswers === null) return sendInvalid(response);
  response.status(201).json(await createClozeQuestion({ subtopicId, textWithAnswers }));
}

export async function putClozeQuestion(request: Request, response: Response) {
  const id = positiveInteger(request.params.questionId);
  const subtopicId = positiveInteger(request.body?.subtopicId);
  const textWithAnswers = requiredString(request.body?.textWithAnswers);
  const isActive = optionalBoolean(request.body?.isActive);
  if (!id || !subtopicId || textWithAnswers === null || isActive === null) return sendInvalid(response);
  response.json(await updateClozeQuestion(id, { subtopicId, textWithAnswers, isActive }));
}

export async function removeClozeQuestion(request: Request, response: Response) {
  const id = positiveInteger(request.params.questionId);
  if (!id) return sendInvalid(response);
  await deleteClozeQuestion(id); response.status(204).send();
}

export async function getStudyClozeQuestions(request: Request, response: Response) {
  const subtopicId = positiveInteger(request.query.subtopicId);
  if (!subtopicId) return sendInvalid(response);
  response.json(await listStudyClozeQuestions(subtopicId));
}

export async function revealStudyClozeQuestion(request: Request, response: Response) {
  const id = positiveInteger(request.params.questionId);
  if (!id) return sendInvalid(response);
  response.json(await revealClozeAnswer(id));
}
