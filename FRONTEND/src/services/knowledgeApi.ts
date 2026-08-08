import type {
  KnowledgeImportItem,
  KnowledgeImportReport,
  SubtopicKnowledge,
} from "../types/knowledge";

const API_URL =
  import.meta.env.VITE_API_URL ??
  "http://localhost:3001/api";

async function request<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(
      data?.message ?? "Erro ao comunicar com o servidor.",
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export function getSubtopicKnowledge(subtopicId: number) {
  return request<SubtopicKnowledge>(
    `/knowledge/subtopics/${subtopicId}`,
  );
}

export function createKnowledgeGroup(input: {
  subtopicId: number;
  name: string;
  instruction: string | null;
}) {
  return request("/knowledge/groups", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateKnowledgeGroup(
  groupId: number,
  input: {
    name?: string;
    instruction?: string | null;
    isActive?: boolean;
  },
) {
  return request(`/knowledge/groups/${groupId}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function deleteKnowledgeGroup(groupId: number) {
  return request<void>(`/knowledge/groups/${groupId}`, {
    method: "DELETE",
  });
}

export function createKnowledgeCategory(input: {
  groupId: number;
  name: string;
  displayOrder: number;
}) {
  return request("/knowledge/categories", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateKnowledgeCategory(
  categoryId: number,
  input: { name?: string; displayOrder?: number },
) {
  return request(`/knowledge/categories/${categoryId}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function deleteKnowledgeCategory(categoryId: number) {
  return request<void>(`/knowledge/categories/${categoryId}`, {
    method: "DELETE",
  });
}

export function createKnowledgeItem(input: {
  subtopicId: number;
  text: string;
  explanation: string | null;
  reference: string | null;
}) {
  return request("/knowledge/items", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateKnowledgeItem(
  itemId: number,
  input: {
    text?: string;
    explanation?: string | null;
    reference?: string | null;
    isActive?: boolean;
  },
) {
  return request(`/knowledge/items/${itemId}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function deleteKnowledgeItem(itemId: number) {
  return request<void>(`/knowledge/items/${itemId}`, {
    method: "DELETE",
  });
}

export function createKnowledgeClassification(input: {
  itemId: number;
  categoryId: number;
}) {
  return request("/knowledge/classifications", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function deleteKnowledgeClassification(
  classificationId: number,
) {
  return request<void>(
    `/knowledge/classifications/${classificationId}`,
    { method: "DELETE" },
  );
}

export function importKnowledgeItems(input: {
  subtopicId: number;
  groupId: number;
  items: KnowledgeImportItem[];
}) {
  return request<KnowledgeImportReport>(
    "/knowledge/items/import",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
}
