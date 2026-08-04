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
  return request<StudyDashboard>(
    "/study/dashboard",
  );
}

export function getStudyStructure() {
  return request<Discipline[]>(
    "/study/structure",
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

export function createStatement(
  input: CreateStatementInput,
) {
  return request<StatementResponse>(
    "/study/statements",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
}

export function createStatementsBulk(
  input: CreateStatementsBulkInput,
) {
  return request<StatementResponse[]>(
    "/study/statements/bulk",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
}

export function updateStatement(
  statementId: number,
  input: UpdateStatementInput,
) {
  return request<StatementResponse>(
    `/study/statements/${statementId}`,
    {
      method: "PATCH",
      body: JSON.stringify(input),
    },
  );
}

export function deleteStatement(
  statementId: number,
) {
  return request<void>(
    `/study/statements/${statementId}`,
    {
      method: "DELETE",
    },
  );
}

export function createDiscipline(
  input: CreateDisciplineInput,
) {
  return request<DisciplineResponse>(
    "/study/disciplines",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
}

export function createTopic(
  input: CreateTopicInput,
) {
  return request<TopicResponse>(
    "/study/topics",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
}

export function createSubtopic(
  input: CreateSubtopicInput,
) {
  return request<SubtopicResponse>(
    "/study/subtopics",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
}

export function updateDiscipline(
  disciplineId: number,
  name: string,
) {
  return request<DisciplineResponse>(
    `/study/disciplines/${disciplineId}`,
    {
      method: "PATCH",
      body: JSON.stringify({ name }),
    },
  );
}

export function updateTopic(
  topicId: number,
  name: string,
) {
  return request<TopicResponse>(
    `/study/topics/${topicId}`,
    {
      method: "PATCH",
      body: JSON.stringify({ name }),
    },
  );
}

export function updateSubtopic(
  subtopicId: number,
  name: string,
) {
  return request<SubtopicResponse>(
    `/study/subtopics/${subtopicId}`,
    {
      method: "PATCH",
      body: JSON.stringify({ name }),
    },
  );
}

export function deleteDiscipline(
  disciplineId: number,
) {
  return request<void>(
    `/study/disciplines/${disciplineId}`,
    {
      method: "DELETE",
    },
  );
}

export function deleteTopic(
  topicId: number,
) {
  return request<void>(
    `/study/topics/${topicId}`,
    {
      method: "DELETE",
    },
  );
}

export function deleteSubtopic(
  subtopicId: number,
) {
  return request<void>(
    `/study/subtopics/${subtopicId}`,
    {
      method: "DELETE",
    },
  );
}

export function registerAnswer(
  statementId: number,
  selectedAnswer: boolean,
) {
  return request<RegisterAnswerResponse>(
    "/study/answer",
    {
      method: "POST",
      body: JSON.stringify({
        statementId,
        selectedAnswer,
      }),
    },
  );
}

export function getDisciplineProgress() {
  return request<DisciplineProgress[]>(
    "/study/discipline-progress",
  );
}

export function getDueReviewStatements(
  limit = 30,
) {
  return request<PublicStatement[]>(
    `/study/review?limit=${limit}`,
  );
}
