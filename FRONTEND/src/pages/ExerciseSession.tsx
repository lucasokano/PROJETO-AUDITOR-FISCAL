import {
  useEffect,
  useRef,
  useState,
} from "react";
import { ExerciseRenderer } from "../components/exercises/ExerciseRenderer";
import { useStudy } from "../contexts/StudyContext";
import {
  getExerciseGroups,
  getNextExercise,
  submitExerciseAnswer,
} from "../services/exerciseApi";
import {
  ExerciseType,
  type ExerciseGroup,
  type ExerciseResult,
  type PresentedExercise,
} from "../types/exercise";

function getErrorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "Não foi possível concluir a operação.";
}

export function ExerciseSession() {
  const {
    disciplines,
    isLoading: isStructureLoading,
    error: structureError,
  } = useStudy();
  const [disciplineId, setDisciplineId] = useState("");
  const [topicId, setTopicId] = useState("");
  const [subtopicId, setSubtopicId] = useState("");
  const [groupId, setGroupId] = useState("");
  const [groups, setGroups] = useState<ExerciseGroup[]>([]);
  const [exercise, setExercise] =
    useState<PresentedExercise | null>(null);
  const [result, setResult] =
    useState<ExerciseResult | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] =
    useState<number | null>(null);
  const [isLoadingGroups, setIsLoadingGroups] =
    useState(false);
  const [isLoadingExercise, setIsLoadingExercise] =
    useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const submissionInFlight = useRef(false);

  const discipline = disciplines.find(
    (item) => item.id === Number(disciplineId),
  );
  const topic = discipline?.topics.find(
    (item) => item.id === Number(topicId),
  );

  useEffect(() => {
    const numericSubtopicId = Number(subtopicId);

    setGroups([]);
    setGroupId("");
    setExercise(null);
    setResult(null);
    setSelectedCategoryId(null);
    setError(null);

    if (!numericSubtopicId) {
      return;
    }

    let cancelled = false;

    async function loadGroups() {
      try {
        setIsLoadingGroups(true);
        const availableGroups = await getExerciseGroups(
          numericSubtopicId,
        );

        if (!cancelled) {
          setGroups(availableGroups);
          setGroupId(
            availableGroups[0]
              ? String(availableGroups[0].id)
              : "",
          );
        }
      } catch (requestError) {
        if (!cancelled) {
          setError(getErrorMessage(requestError));
        }
      } finally {
        if (!cancelled) {
          setIsLoadingGroups(false);
        }
      }
    }

    void loadGroups();

    return () => {
      cancelled = true;
    };
  }, [subtopicId]);

  async function loadNextExercise() {
    const numericSubtopicId = Number(subtopicId);
    const numericGroupId = Number(groupId);

    if (!numericSubtopicId || !numericGroupId) {
      return;
    }

    try {
      setIsLoadingExercise(true);
      setError(null);
      setExercise(null);
      setResult(null);
      setSelectedCategoryId(null);
      const nextExercise = await getNextExercise(
        numericSubtopicId,
        numericGroupId,
      );
      setExercise(nextExercise);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setIsLoadingExercise(false);
    }
  }

  async function submitAnswer() {
    if (
      !exercise ||
      selectedCategoryId === null ||
      submissionInFlight.current
    ) {
      return;
    }

    try {
      submissionInFlight.current = true;
      setIsSubmitting(true);
      setError(null);
      const exerciseResult = await submitExerciseAnswer({
        exerciseId: exercise.exerciseId,
        type: ExerciseType.CLASSIFY_ONE,
        answer: { categoryId: selectedCategoryId },
      });
      setResult(exerciseResult);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      submissionInFlight.current = false;
      setIsSubmitting(false);
    }
  }

  return (
    <section className="page exercise-session-page">
      <header className="exercise-session-heading">
        <span>Sessão de exercícios</span>
        <h2>Classificação</h2>
        <p>
          Escolha um subtópico e uma dimensão para gerar
          exercícios dinamicamente.
        </p>
      </header>

      {(structureError || error) && (
        <div className="exercise-error">
          {structureError ?? error}
        </div>
      )}

      <section className="exercise-selection-panel">
        <label>
          <span>Disciplina</span>
          <select
            value={disciplineId}
            disabled={isStructureLoading}
            onChange={(event) => {
              setDisciplineId(event.target.value);
              setTopicId("");
              setSubtopicId("");
            }}
          >
            <option value="">Selecione</option>
            {disciplines.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>Tópico</span>
          <select
            value={topicId}
            disabled={!discipline}
            onChange={(event) => {
              setTopicId(event.target.value);
              setSubtopicId("");
            }}
          >
            <option value="">Selecione</option>
            {discipline?.topics.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>Subtópico</span>
          <select
            value={subtopicId}
            disabled={!topic}
            onChange={(event) =>
              setSubtopicId(event.target.value)
            }
          >
            <option value="">Selecione</option>
            {topic?.subtopics.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>Grupo</span>
          <select
            value={groupId}
            disabled={!subtopicId || isLoadingGroups}
            onChange={(event) => {
              setGroupId(event.target.value);
              setExercise(null);
              setResult(null);
              setSelectedCategoryId(null);
            }}
          >
            <option value="">
              {isLoadingGroups ? "Carregando..." : "Selecione"}
            </option>
            {groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          className="exercise-primary-button"
          disabled={!groupId || isLoadingExercise}
          onClick={() => void loadNextExercise()}
        >
          {isLoadingExercise
            ? "Gerando..."
            : exercise
              ? "Gerar outro"
              : "Solicitar exercício"}
        </button>
      </section>

      {!subtopicId && (
        <div className="exercise-empty">
          Selecione a estrutura para começar.
        </div>
      )}

      {subtopicId && !isLoadingGroups && groups.length === 0 && (
        <div className="exercise-empty">
          Não há grupos ativos com itens classificados neste
          subtópico.
        </div>
      )}

      {isLoadingExercise && (
        <div className="exercise-empty">Gerando exercício...</div>
      )}

      {exercise && !isLoadingExercise && (
        <ExerciseRenderer
          exercise={exercise}
          result={result}
          selectedCategoryId={selectedCategoryId}
          isSubmitting={isSubmitting}
          onSelect={setSelectedCategoryId}
          onSubmit={() => void submitAnswer()}
          onNext={() => void loadNextExercise()}
        />
      )}
    </section>
  );
}
