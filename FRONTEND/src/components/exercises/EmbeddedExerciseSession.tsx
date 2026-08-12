import { useCallback, useEffect, useRef, useState } from "react";
import { getNextExercise, submitExerciseAnswer } from "../../services/exerciseApi";
import type {
  ExerciseAnswerPayload,
  ExerciseResult,
  ExerciseType,
  PresentedExercise,
} from "../../types/exercise";
import { ExerciseRenderer } from "./ExerciseRenderer";

interface EmbeddedExerciseSessionProps {
  subtopicId: number;
  groupId: number;
  groupName: string;
  type: ExerciseType;
  onResultChange?: (result: ExerciseResult | null) => void;
}

interface PreservedExerciseSession {
  exercise: PresentedExercise;
  result: ExerciseResult | null;
  cachedAt: number;
}

const preservedSessions = new Map<string, PreservedExerciseSession>();
const PRESERVED_SESSION_TIME = 5 * 60_000;

function getPreservedSession(key: string) {
  const session = preservedSessions.get(key);
  if (session && Date.now() - session.cachedAt < PRESERVED_SESSION_TIME) return session;
  preservedSessions.delete(key);
  return undefined;
}

export function EmbeddedExerciseSession({
  subtopicId,
  groupId,
  groupName,
  type,
  onResultChange,
}: EmbeddedExerciseSessionProps) {
  const sessionKey = `${subtopicId}:${groupId}:${type}`;
  const preserved = getPreservedSession(sessionKey);
  const [exercise, setExercise] = useState<PresentedExercise | null>(preserved?.exercise ?? null);
  const [result, setResult] = useState<ExerciseResult | null>(preserved?.result ?? null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submissionInFlight = useRef(false);
  const onResultChangeRef = useRef(onResultChange);

  useEffect(() => {
    onResultChangeRef.current = onResultChange;
  }, [onResultChange]);

  const loadNextExercise = useCallback(async (force = false) => {
    const cached = getPreservedSession(sessionKey);
    if (!force && cached) {
      setExercise(cached.exercise);
      setResult(cached.result);
      onResultChangeRef.current?.(cached.result);
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      setExercise(null);
      setResult(null);
      onResultChangeRef.current?.(null);
      const nextExercise = await getNextExercise(subtopicId, groupId, type);
      preservedSessions.set(sessionKey, { exercise: nextExercise, result: null, cachedAt: Date.now() });
      setExercise(nextExercise);
    } catch (requestError) {
      setError(requestError instanceof Error
        ? requestError.message
        : "Não foi possível gerar o exercício.");
    } finally {
      setIsLoading(false);
    }
  }, [groupId, sessionKey, subtopicId, type]);

  useEffect(() => {
    void loadNextExercise();
  }, [loadNextExercise]);

  async function submitAnswer(answer: ExerciseAnswerPayload) {
    if (!exercise || submissionInFlight.current) return;

    try {
      submissionInFlight.current = true;
      setIsSubmitting(true);
      setError(null);
      const nextResult = await submitExerciseAnswer({
        exerciseId: exercise.exerciseId,
        type: exercise.type,
        answer,
      } as Parameters<typeof submitExerciseAnswer>[0]);
      setResult(nextResult);
      preservedSessions.set(sessionKey, { exercise, result: nextResult, cachedAt: Date.now() });
      onResultChangeRef.current?.(nextResult);
    } catch (requestError) {
      setError(requestError instanceof Error
        ? requestError.message
        : "Não foi possível registrar a resposta.");
    } finally {
      submissionInFlight.current = false;
      setIsSubmitting(false);
    }
  }

  return (
    <section className="embedded-exercise-session">
      <header className="embedded-exercise-heading">
        <div>
          <span>Grupo</span>
          <strong>{groupName}</strong>
        </div>
        <button type="button" className="secondary-button" disabled={isLoading} onClick={() => void loadNextExercise(true)}>
          {isLoading ? "Gerando..." : "Gerar outro"}
        </button>
      </header>

      {error && <div className="exercise-error">{error}</div>}
      {isLoading && <div className="exercise-empty">Gerando exercício...</div>}
      {exercise && !isLoading && (
        <ExerciseRenderer
          exercise={exercise}
          result={result}
          isSubmitting={isSubmitting}
          onSubmit={(answer) => void submitAnswer(answer)}
          onNext={() => void loadNextExercise(true)}
        />
      )}
    </section>
  );
}
