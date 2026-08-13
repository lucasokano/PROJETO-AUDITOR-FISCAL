import type { Exam, ExamBoard, ExamQuestion, ExamQuestionInput, StudyExamQuestion, StudyExamQuestionResult } from "../types/examQuestion";
import { createKeyedCache } from "./questionCache";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001/api";
const studyQuestionCache = createKeyedCache<StudyExamQuestion[]>();
async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}/exam-questions${path}`, {
    ...options,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...options?.headers },
  });
  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.message ?? "Não foi possível concluir a operação.");
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}
export const getExamBoards = () => request<ExamBoard[]>("/boards");
export const createExamBoard = (name: string) => request<ExamBoard>("/boards", { method: "POST", body: JSON.stringify({ name }) });
export const deleteExamBoard = (id: number) => request<void>(`/boards/${id}`, { method: "DELETE" });
export const getExams = () => request<Exam[]>("/exams");
export const createExam = (input: { boardId: number; name: string; year: number | null }) => request<Exam>("/exams", { method: "POST", body: JSON.stringify(input) });
export const deleteExam = (id: number) => request<void>(`/exams/${id}`, { method: "DELETE" });
export const getExamQuestions = () => request<ExamQuestion[]>("/questions");
export const createExamQuestion = async (input: ExamQuestionInput) => {
  const created = await request<ExamQuestion>("/questions", { method: "POST", body: JSON.stringify(input) });
  studyQuestionCache.invalidate(input.subtopicId);
  return created;
};
export const updateExamQuestion = async (id: number, input: ExamQuestionInput & { isActive?: boolean }) => {
  const updated = await request<ExamQuestion>(`/questions/${id}`, { method: "PUT", body: JSON.stringify(input) });
  studyQuestionCache.invalidate(); return updated;
};
export const deleteExamQuestion = async (id: number) => {
  await request<void>(`/questions/${id}`, { method: "DELETE" });
  studyQuestionCache.invalidate();
};
export const getCachedStudyExamQuestions = (subtopicId: number) => studyQuestionCache.peek(subtopicId);
export const getStudyExamQuestions = (subtopicId: number) => studyQuestionCache.load(subtopicId, () => request<StudyExamQuestion[]>(`/study?subtopicId=${subtopicId}`));
export const answerStudyExamQuestion = (questionId: number, selectedOptionId: number) => request<StudyExamQuestionResult>(`/study/${questionId}/answer`, { method: "POST", body: JSON.stringify({ selectedOptionId }) });
