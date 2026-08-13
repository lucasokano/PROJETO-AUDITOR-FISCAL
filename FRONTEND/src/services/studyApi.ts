import type {
  CreateDisciplineInput,
  CreateStatementInput,
  CreateStatementsBulkInput,
  CreateSubtopicInput,
  CreateTopicInput,
  Discipline,
  Statement,
  UpdateStatementInput,
  DisciplineProgress,
  PublicStatement,
  RegisterAnswerResponse,
  StudyDashboard,
} from "../types/study";
import {
  invalidateDashboard,
  invalidateReviews,
  invalidateStructure,
  loadDashboardCached,
  loadReviewsCached,
  loadStructureCached,
  peekDashboard,
  peekReviews,
  peekStructure,
  recordStatementAnswer,
} from "./studyCache";

export { clearStudyCache } from "./studyCache";
export const getCachedDashboard = peekDashboard;
export const getCachedStudyStructure = peekStructure;
export const getCachedDueReviewStatements = peekReviews;

interface DisciplineResponse {
  id: number;
  name: string;
  slug: string;
}

interface TopicResponse {
  id: number;
  disciplineId: number;
  name: string;
  slug: string;
}

interface SubtopicResponse {
  id: number;
  topicId: number;
  name: string;
  slug: string;
}

interface StatementResponse {
  id: number;
  subtopicId: number;
  text: string;
  correctAnswer: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const API_URL =
  import.meta.env.VITE_API_URL ??
  "http://localhost:3001/api";

async function request<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(
    `${API_URL}${path}`,
    {
      ...options,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    },
  );

  if (!response.ok) {
    const data = await response
      .json()
      .catch(() => null);

    throw new Error(
      data?.message ??
        "Erro ao comunicar com o servidor.",
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export function getDashboard() {
  return loadDashboardCached(
    () => request<StudyDashboard>("/study/dashboard"),
  );
}

export function getStudyStructure() {
  return loadStructureCached(
    () => request<Discipline[]>("/study/structure"),
  );
}

export function getAllStatements() {
  return request<Statement[]>(
    "/study/statements",
  );
}

export function getStatementsBySubtopic(
  subtopicId: number,
) {
  return request<PublicStatement[]>(
    `/study/subtopics/${subtopicId}/statements`,
  );
}

export const getSubtopicStatements =
  getStatementsBySubtopic;

export async function createStatement(
  input: CreateStatementInput,
) {
  const result = await request<StatementResponse>(
    "/study/statements",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
  invalidateDashboard();
  invalidateReviews();
  return result;
}

export async function createStatementsBulk(
  input: CreateStatementsBulkInput,
) {
  const result = await request<StatementResponse[]>(
    "/study/statements/bulk",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
  invalidateDashboard();
  invalidateReviews();
  return result;
}

export async function updateStatement(
  statementId: number,
  input: UpdateStatementInput,
) {
  const result = await request<StatementResponse>(
    `/study/statements/${statementId}`,
    {
      method: "PATCH",
      body: JSON.stringify(input),
    },
  );
  invalidateDashboard();
  invalidateReviews();
  return result;
}

export async function deleteStatement(
  statementId: number,
) {
  const result = await request<void>(
    `/study/statements/${statementId}`,
    {
      method: "DELETE",
    },
  );
  invalidateDashboard();
  invalidateReviews();
  return result;
}

export async function createDiscipline(
  input: CreateDisciplineInput,
) {
  const result = await request<DisciplineResponse>(
    "/study/disciplines",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
  invalidateStructure();
  invalidateDashboard();
  return result;
}

export async function createTopic(
  input: CreateTopicInput,
) {
  const result = await request<TopicResponse>(
    "/study/topics",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
  invalidateStructure();
  return result;
}

export async function createSubtopic(
  input: CreateSubtopicInput,
) {
  const result = await request<SubtopicResponse>(
    "/study/subtopics",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
  invalidateStructure();
  return result;
}

export async function updateDiscipline(
  disciplineId: number,
  name: string,
) {
  const result = await request<DisciplineResponse>(
    `/study/disciplines/${disciplineId}`,
    {
      method: "PATCH",
      body: JSON.stringify({ name }),
    },
  );
  invalidateStructure();
  invalidateDashboard();
  return result;
}

export async function updateTopic(
  topicId: number,
  name: string,
) {
  const result = await request<TopicResponse>(
    `/study/topics/${topicId}`,
    {
      method: "PATCH",
      body: JSON.stringify({ name }),
    },
  );
  invalidateStructure();
  return result;
}

export async function updateSubtopic(
  subtopicId: number,
  name: string,
) {
  const result = await request<SubtopicResponse>(
    `/study/subtopics/${subtopicId}`,
    {
      method: "PATCH",
      body: JSON.stringify({ name }),
    },
  );
  invalidateStructure();
  return result;
}

export async function reorderTopics(disciplineId: number, ids: number[]) {
  await request<void>(`/study/disciplines/${disciplineId}/topics/order`, {
    method: "PATCH",
    body: JSON.stringify({ ids }),
  });
  invalidateStructure();
}

export async function reorderSubtopics(topicId: number, ids: number[]) {
  await request<void>(`/study/topics/${topicId}/subtopics/order`, {
    method: "PATCH",
    body: JSON.stringify({ ids }),
  });
  invalidateStructure();
}

export async function deleteDiscipline(
  disciplineId: number,
) {
  const result = await request<void>(
    `/study/disciplines/${disciplineId}`,
    {
      method: "DELETE",
    },
  );
  invalidateStructure();
  invalidateDashboard();
  return result;
}

export async function deleteTopic(
  topicId: number,
) {
  const result = await request<void>(
    `/study/topics/${topicId}`,
    {
      method: "DELETE",
    },
  );
  invalidateStructure();
  return result;
}

export async function deleteSubtopic(
  subtopicId: number,
) {
  const result = await request<void>(
    `/study/subtopics/${subtopicId}`,
    {
      method: "DELETE",
    },
  );
  invalidateStructure();
  return result;
}

export async function registerAnswer(
  statementId: number,
  selectedAnswer: boolean,
) {
  const result = await request<RegisterAnswerResponse>(
    "/study/answer",
    {
      method: "POST",
      body: JSON.stringify({
        statementId,
        selectedAnswer,
      }),
    },
  );
  recordStatementAnswer(statementId);
  return result;
}

export function getDisciplineProgress() {
  return request<DisciplineProgress[]>(
    "/study/discipline-progress",
  );
}

export function getDueReviewStatements(
  limit = 30,
) {
  return loadReviewsCached(
    limit,
    () => request<PublicStatement[]>(`/study/review?limit=${limit}`),
  );
}
