import type {
  CreateDisciplineInput,
  CreateStatementInput,
  CreateSubtopicInput,
  CreateTopicInput,
  CreatedStatement,
  Discipline,
  Statement,
  Subtopic,
  Topic,
} from "../types/study";

const API_URL =
  import.meta.env.VITE_API_URL ??
  "http://localhost:3001/api";

interface ApiErrorResponse {
  message?: string;
}

export interface CreatedDiscipline {
  id: number;
  name: string;
  slug: string;
}

export interface CreatedTopic {
  id: number;
  disciplineId: number;
  name: string;
  slug: string;
}

export interface CreatedSubtopic {
  id: number;
  topicId: number;
  name: string;
  slug: string;
}

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
    let message =
      "Não foi possível acessar a API.";

    try {
      const body =
        (await response.json()) as ApiErrorResponse;

      if (body.message) {
        message = body.message;
      }
    } catch {
      // Mantém a mensagem padrão.
    }

    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

export function getStudyStructure() {
  return request<Discipline[]>(
    "/study/structure",
  );
}

export function getSubtopicStatements(
  subtopicId: number,
) {
  return request<Statement[]>(
    `/study/subtopics/${subtopicId}/statements`,
  );
}

export function createStatement(
  input: CreateStatementInput,
) {
  return request<CreatedStatement>(
    "/study/statements",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
}

export function createDiscipline(
  input: CreateDisciplineInput,
) {
  return request<CreatedDiscipline>(
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
  return request<CreatedTopic>(
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
  return request<CreatedSubtopic>(
    "/study/subtopics",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
}