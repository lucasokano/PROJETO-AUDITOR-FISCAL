import type { ExerciseOption } from "./exercise.types.js";

interface PendingExercise {
  correctAnswer: ExerciseOption;
  optionIds: number[];
  explanation: string | null;
  reference: string | null;
  expiresAt: number;
}

const EXERCISE_TTL_MS = 30 * 60 * 1000;
const pendingExercises = new Map<string, PendingExercise>();
const lastItemByScope = new Map<string, number>();

function removeExpiredExercises() {
  const now = Date.now();

  for (const [exerciseId, exercise] of pendingExercises) {
    if (exercise.expiresAt <= now) {
      pendingExercises.delete(exerciseId);
    }
  }
}

export function savePendingExercise(
  exerciseId: string,
  exercise: Omit<PendingExercise, "expiresAt">,
) {
  removeExpiredExercises();
  pendingExercises.set(exerciseId, {
    ...exercise,
    expiresAt: Date.now() + EXERCISE_TTL_MS,
  });
}

export function consumePendingExercise(exerciseId: string) {
  removeExpiredExercises();
  const exercise = pendingExercises.get(exerciseId);

  if (exercise) {
    pendingExercises.delete(exerciseId);
  }

  return exercise;
}

export function getLastItemId(scope: string) {
  return lastItemByScope.get(scope);
}

export function setLastItemId(scope: string, itemId: number) {
  lastItemByScope.set(scope, itemId);
}
