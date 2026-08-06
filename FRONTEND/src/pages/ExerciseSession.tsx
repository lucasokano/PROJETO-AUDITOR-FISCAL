import {
  useEffect,
  useRef,
  useState,
} from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { ExerciseRenderer } from "../components/exercises/ExerciseRenderer";
import { useStudy } from "../contexts/StudyContext";
import {
  getExerciseGroups,
  getNextExercise,
  submitExerciseAnswer,
} from "../services/exerciseApi";
import {
  ExerciseType,
  type ExerciseAnswerPayload,
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
  const [searchParams] = useSearchParams();
  const {
    disciplineId: routeDisciplineId,
    topicId: routeTopicId,
    subtopicId: routeSubtopicId,
  } = useParams();

  const {
    disciplines,
    findDiscipline,
    findTopic,
    findSubtopic,
    isLoading: isStructureLoading,
    error: structureError,
  } = useStudy();

  const isContextualSession = Boolean(
    routeDisciplineId && routeTopicId && routeSubtopicId,
  );

  const requestedType = Object.values(ExerciseType).find(
    (type) => type === searchParams.get("type"),
  );
  const requestedGroupId = searchParams.get("groupId");

  const contextualDiscipline = isContextualSession
    ? findDiscipline(routeDisciplineId)
    : undefined;
  const contextualTopic = isContextualSession
    ? findTopic(routeDisciplineId, routeTopicId)
    : undefined;
  const contextualSubtopic = isContextualSession
    ? findSubtopic(routeDisciplineId, routeTopicId, routeSubtopicId)
    : undefined;
  const [disciplineId, setDisciplineId] = useState("");
  const [topicId, setTopicId] = useState("");
  const [subtopicId, setSubtopicId] = useState("");
  const [groupId, setGroupId] = useState("");
  const [groups, setGroups] = useState<ExerciseGroup[]>([]);
  const [exercise, setExercise] =
    useState<PresentedExercise | null>(null);
  const [result, setResult] =
    useState<ExerciseResult | null>(null);
  const [exerciseType, setExerciseType] =
    useState<ExerciseType>(ExerciseType.CLASSIFY_ONE);
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

  const effectiveSubtopicId = isContextualSession
    ? String(contextualSubtopic?.id ?? "")
    : subtopicId;

  useEffect(() => {
    const numericSubtopicId = Number(effectiveSubtopicId);

    setGroups([]);
    setGroupId("");
    setExercise(null);
    setResult(null);
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
          const requestedGroup = availableGroups.find(
            (group) => String(group.id) === requestedGroupId,
          );
          const automaticallySelectedGroup =
            requestedGroup ??
            (availableGroups[0] &&
              (!isContextualSession || availableGroups.length === 1)
              ? availableGroups[0]
              : null);
          setGroupId(
            automaticallySelectedGroup
              ? String(automaticallySelectedGroup.id)
              : "",
          );
          setExerciseType(
            automaticallySelectedGroup && requestedType &&
              automaticallySelectedGroup.eligibleTypes.includes(requestedType)
              ? requestedType
              : automaticallySelectedGroup?.eligibleTypes[0] ??
              ExerciseType.CLASSIFY_ONE,
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
  }, [effectiveSubtopicId, isContextualSession, requestedGroupId, requestedType]);

  const selectedGroup = groups.find(
    (group) => group.id === Number(groupId),
  );

  async function loadNextExercise() {
    const numericSubtopicId = Number(effectiveSubtopicId);
    const numericGroupId = Number(groupId);

    if (!numericSubtopicId || !numericGroupId) {
      return;
    }

    try {
      setIsLoadingExercise(true);
      setError(null);
      setExercise(null);
      setResult(null);
      const nextExercise = await getNextExercise(
        numericSubtopicId,
        numericGroupId,
        exerciseType,
      );
      setExercise(nextExercise);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setIsLoadingExercise(false);
    }
  }

  async function submitAnswer(answer: ExerciseAnswerPayload) {
    if (
      !exercise ||
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
        type: exercise.type,
        answer,
      } as Parameters<typeof submitExerciseAnswer>[0]);
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
        {isContextualSession && (
          <p>
            {contextualDiscipline?.name} / {contextualTopic?.name} / {contextualSubtopic?.name}
          </p>
        )}
        <p className={isContextualSession ? "exercise-free-description-hidden" : ""}>
          Escolha um subtópico e uma dimensão para gerar
          exercícios dinamicamente.
        </p>
      </header>

      {(structureError || error) && (
        <div className="exercise-error">
          {structureError ?? error}
        </div>
      )}

      <section className={`exercise-selection-panel ${isContextualSession ? "exercise-selection-contextual" : ""}`}>
        {!isContextualSession && (
          <>
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

          </>
        )}

        {(!isContextualSession || groups.length > 1) && <label>
          <span>Grupo</span>
          <select
            value={groupId}
            disabled={!effectiveSubtopicId || isLoadingGroups}
            onChange={(event) => {
              setGroupId(event.target.value);
                setExercise(null);
                setResult(null);
                const nextGroup = groups.find(
                  (group) => group.id === Number(event.target.value),
                );
                setExerciseType(
                  nextGroup && requestedType && nextGroup.eligibleTypes.includes(requestedType)
                    ? requestedType
                    : nextGroup?.eligibleTypes[0] ?? ExerciseType.CLASSIFY_ONE,
                );
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
        </label>}

        {isContextualSession && groups.length === 1 && (
          <div className="exercise-selected-group">
            <span>Grupo</span>
            <strong>{groups[0]?.name}</strong>
          </div>
        )}

        {isContextualSession && isLoadingGroups && (
          <div className="exercise-selected-group">
            <span>Grupos</span>
            <strong>Carregando...</strong>
          </div>
        )}

        {selectedGroup && (
          <label>
            <span>Tipo</span>
            <select
              value={exerciseType}
              onChange={(event) => {
                setExerciseType(event.target.value as ExerciseType);
                setExercise(null);
                setResult(null);
              }}
            >
              {selectedGroup.eligibleTypes.map((type) => (
                <option key={type} value={type}>
                  {{
                    CLASSIFY_ONE: "Classificar um item",
                    CLASSIFY_BATCH: "Classificar vários itens",
                    TRUE_FALSE: "Verdadeiro ou falso",
                    SINGLE_CHOICE: "Escolha única",
                    MULTIPLE_SELECT: "Seleção múltipla",
                  }[type]}
                </option>
              ))}
            </select>
          </label>
        )}

        {(!isContextualSession || groups.length > 0) && <button
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
        </button>}
      </section>

      {!effectiveSubtopicId && !isContextualSession && (
        <div className="exercise-empty">
          Selecione a estrutura para começar.
        </div>
      )}

      {effectiveSubtopicId && !isLoadingGroups && groups.length === 0 && (
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
          isSubmitting={isSubmitting}
          onSubmit={(answer) => void submitAnswer(answer)}
          onNext={() => void loadNextExercise()}
        />
      )}
    </section>
  );
}
