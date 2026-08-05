import type { PendingExercise } from "./exercise.types.js";

export const EXERCISE_TTL_MS = 30 * 60 * 1000;
const pendingExercises = new Map<string, PendingExercise>();
const lastItemByScope = new Map<string, number>();

function removeExpiredExercises() {
  const now = Date.now();
  for (const [id, exercise] of pendingExercises) {
    if (exercise.expiresAt <= now) pendingExercises.delete(id);
  }
}

export function savePendingExercise(exercise: PendingExercise) {
  removeExpiredExercises();
  pendingExercises.set(exercise.exerciseId, exercise);
}

export function consumePendingExercise(exerciseId: string) {
  removeExpiredExercises();
  const exercise = pendingExercises.get(exerciseId);
  if (exercise) pendingExercises.delete(exerciseId);
  return exercise;
}

export function getLastItemId(scope: string) { return lastItemByScope.get(scope); }
export function setLastItemId(scope: string, itemId: number) { lastItemByScope.set(scope, itemId); }

export function clearExerciseStoreForTests() {
  pendingExercises.clear();
  lastItemByScope.clear();
}
