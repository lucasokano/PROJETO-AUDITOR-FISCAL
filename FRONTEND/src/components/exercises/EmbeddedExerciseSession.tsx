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

export function EmbeddedExerciseSession({
  subtopicId,
  groupId,
  groupName,
  type,
  onResultChange,
}: EmbeddedExerciseSessionProps) {
  const [exercise, setExercise] = useState<PresentedExercise | null>(null);
  const [result, setResult] = useState<ExerciseResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submissionInFlight = useRef(false);
  const onResultChangeRef = useRef(onResultChange);

  useEffect(() => {
    onResultChangeRef.current = onResultChange;
  }, [onResultChange]);

  const loadNextExercise = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      setExercise(null);
      setResult(null);
      onResultChangeRef.current?.(null);
      setExercise(await getNextExercise(subtopicId, groupId, type));
    } catch (requestError) {
      setError(requestError instanceof Error
        ? requestError.message
        : "Não foi possível gerar o exercício.");
    } finally {
      setIsLoading(false);
    }
  }, [groupId, subtopicId, type]);

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
        <button type="button" className="secondary-button" disabled={isLoading} onClick={() => void loadNextExercise()}>
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
          onNext={() => void loadNextExercise()}
        />
      )}
    </section>
  );
}
