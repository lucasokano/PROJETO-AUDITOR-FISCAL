import type {
  ExerciseType,
  ExerciseGroup,
  ExerciseResult,
  PresentedExercise,
  SubmittedAnswer,
} from "../types/exercise";
import { createKeyedCache } from "./questionCache";

const API_URL =
  import.meta.env.VITE_API_URL ??
  "http://localhost:3001/api";
const exerciseGroupCache = createKeyedCache<ExerciseGroup[]>();

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

  return response.json() as Promise<T>;
}

export function getExerciseGroups(subtopicId: number) {
  return exerciseGroupCache.load(subtopicId, () => request<ExerciseGroup[]>(`/exercises/groups?subtopicId=${subtopicId}`));
}

export function getCachedExerciseGroups(subtopicId: number) { return exerciseGroupCache.peek(subtopicId); }

export function getNextExercise(
  subtopicId: number,
  groupId: number,
  type?: ExerciseType,
) {
  return request<PresentedExercise>(
    `/exercises/next?subtopicId=${subtopicId}&groupId=${groupId}${type ? `&type=${type}` : ""}`,
  );
}

export function submitExerciseAnswer(
  submission: SubmittedAnswer,
) {
  return request<ExerciseResult>("/exercises/answer", {
    method: "POST",
    body: JSON.stringify(submission),
  });
}
