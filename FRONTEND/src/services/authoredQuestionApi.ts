import type {
  ClozeQuestionInput, ConceptAnswerResult, ConceptQuestionInput,
  StudyConceptQuestion, ConceptQuestion, ClozeQuestion, ClozeImportInput, ClozeImportPreviewItem, ClozeImportResult,
} from "../types/authoredQuestion";
import { createKeyedCache } from "./questionCache";
import { invalidateOfflineClozeSubtopic } from "./offlineDb";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001/api";
const conceptStudyCache = createKeyedCache<StudyConceptQuestion[]>();

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}/authored-questions${path}`, {
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

export const createConceptQuestion = async (input: ConceptQuestionInput) => {
  const created = await request("/conceptual", { method: "POST", body: JSON.stringify(input) });
  conceptStudyCache.invalidate(input.subtopicId);
  return created;
};
export const createClozeQuestion = async (input: ClozeQuestionInput) => {
  const created = await request("/cloze", { method: "POST", body: JSON.stringify(input) });
  await invalidateOfflineClozeSubtopic(input.subtopicId);
  return created;
};
export const getCachedStudyConceptQuestions = (subtopicId: number) => conceptStudyCache.peek(subtopicId);
export const getStudyConceptQuestions = (subtopicId: number) => conceptStudyCache.load(subtopicId, () => request<StudyConceptQuestion[]>(`/study/conceptual?subtopicId=${subtopicId}`));
export const revealConceptAnswer = (id: number) => request<ConceptAnswerResult>(`/study/conceptual/${id}/reveal`, { method: "POST" });
export const changeClozeDifficulty = async (id: number, isDifficult: boolean) => {
  const updated = await request<{ id: number; subtopicId: number; isDifficult: boolean }>(`/cloze/${id}/difficulty`, { method: "PATCH", body: JSON.stringify({ isDifficult }) });
  await invalidateOfflineClozeSubtopic(updated.subtopicId);
  return updated;
};
export const getConceptQuestions = () => request<ConceptQuestion[]>("/conceptual");
export const updateConceptQuestion = async (id: number, input: ConceptQuestionInput & { isActive?: boolean }) => {
  const updated = await request<ConceptQuestion>(`/conceptual/${id}`, { method: "PUT", body: JSON.stringify(input) });
  conceptStudyCache.invalidate(); return updated;
};
export const deleteConceptQuestion = async (id: number, subtopicId: number) => {
  await request<void>(`/conceptual/${id}`, { method: "DELETE" }); conceptStudyCache.invalidate(subtopicId);
};
export const getClozeQuestions = () => request<ClozeQuestion[]>("/cloze");
export const updateClozeQuestion = async (id: number, input: ClozeQuestionInput & { isActive?: boolean }) => {
  const updated = await request<ClozeQuestion>(`/cloze/${id}`, { method: "PUT", body: JSON.stringify(input) });
  await invalidateOfflineClozeSubtopic(input.subtopicId); return updated;
};
export const deleteClozeQuestion = async (id: number, subtopicId: number) => {
  await request<void>(`/cloze/${id}`, { method: "DELETE" }); await invalidateOfflineClozeSubtopic(subtopicId);
};
export const previewClozeImport = (input: ClozeImportInput) => request<{ items: ClozeImportPreviewItem[] }>("/cloze/import/preview", { method: "POST", body: JSON.stringify(input) });
export const importClozeQuestions = async (input: ClozeImportInput) => {
  const result = await request<ClozeImportResult>("/cloze/import", { method: "POST", body: JSON.stringify(input) });
  return result;
};
