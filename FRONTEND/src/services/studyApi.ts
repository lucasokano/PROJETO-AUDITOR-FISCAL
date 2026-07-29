import type {
  CreateStatementInput,
  CreatedStatement,
  Discipline,
  Statement,
} from "../types/study";

const API_URL =
  import.meta.env.VITE_API_URL ??
  "http://localhost:3001/api";

interface ApiErrorResponse {
  message?: string;
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