import type { Request, Response } from "express";
import {
  createBoard, createExam, createQuestion, deleteBoard, deleteExam, deleteQuestion,
  listBoards, listExams, listQuestions, updateBoard, updateExam, updateQuestion,
  listStudyQuestions, gradeStudyQuestion,
  type QuestionInput,
} from "./exam-question.service.js";

const id = (value: unknown) => {
  if (typeof value !== "string") return null;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

export async function getBoards(_req: Request, res: Response) { res.json(await listBoards()); }
export async function postBoard(req: Request, res: Response) { res.status(201).json(await createBoard(String(req.body.name ?? ""))); }
export async function patchBoard(req: Request, res: Response) {
  const boardId = id(req.params.boardId); if (!boardId) { res.status(400).json({ message: "ID inválido." }); return; }
  res.json(await updateBoard(boardId, String(req.body.name ?? ""), req.body.isActive));
}
export async function removeBoard(req: Request, res: Response) {
  const boardId = id(req.params.boardId); if (!boardId) { res.status(400).json({ message: "ID inválido." }); return; }
  await deleteBoard(boardId); res.status(204).send();
}
export async function getExams(_req: Request, res: Response) { res.json(await listExams()); }
export async function postExam(req: Request, res: Response) { res.status(201).json(await createExam(req.body)); }
export async function patchExam(req: Request, res: Response) {
  const examId = id(req.params.examId); if (!examId) { res.status(400).json({ message: "ID inválido." }); return; }
  res.json(await updateExam(examId, req.body));
}
export async function removeExam(req: Request, res: Response) {
  const examId = id(req.params.examId); if (!examId) { res.status(400).json({ message: "ID inválido." }); return; }
  await deleteExam(examId); res.status(204).send();
}
export async function getQuestions(_req: Request, res: Response) { res.json(await listQuestions()); }
export async function getStudyQuestions(req: Request, res: Response) {
  const subtopicId = id(req.query.subtopicId);
  if (!subtopicId) { res.status(400).json({ message: "O subtópico é obrigatório." }); return; }
  res.json(await listStudyQuestions(subtopicId));
}
export async function answerStudyQuestion(req: Request, res: Response) {
  const questionId = id(req.params.questionId);
  const selectedOptionId = typeof req.body.selectedOptionId === "number" ? req.body.selectedOptionId : null;
  if (!questionId || !selectedOptionId) { res.status(400).json({ message: "Questão ou alternativa inválida." }); return; }
  res.json(await gradeStudyQuestion(questionId, selectedOptionId));
}
export async function postQuestion(req: Request, res: Response) { res.status(201).json(await createQuestion(req.body as QuestionInput)); }
export async function putQuestion(req: Request, res: Response) {
  const questionId = id(req.params.questionId); if (!questionId) { res.status(400).json({ message: "ID inválido." }); return; }
  res.json(await updateQuestion(questionId, req.body as QuestionInput));
}
export async function removeQuestion(req: Request, res: Response) {
  const questionId = id(req.params.questionId); if (!questionId) { res.status(400).json({ message: "ID inválido." }); return; }
  await deleteQuestion(questionId); res.status(204).send();
}
