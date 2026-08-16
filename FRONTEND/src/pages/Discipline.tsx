import {
  useEffect,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  CircleCheck,
  CircleX,
  FileText,
  ListChecks,
} from "lucide-react";

import { useParams, useSearchParams } from "react-router-dom";

import { StatementCard } from "../components/StatementCard";
import { EmbeddedExerciseSession } from "../components/exercises/EmbeddedExerciseSession";
import { RealMultipleChoiceSession, type RealQuestionProgress } from "../components/exercises/RealMultipleChoiceSession";
import { AuthoredUngradedSession } from "../components/exercises/AuthoredUngradedSession";
import { useStudy } from "../contexts/StudyContext";
import { getCachedExerciseGroups, getExerciseGroups } from "../services/exerciseApi";
import { getStudyConceptQuestions } from "../services/authoredQuestionApi";
import { getStudyExamQuestions } from "../services/examQuestionApi";
import {
  getSubtopicStatements,
  registerAnswer,
} from "../services/studyApi";
import type { PublicStatement } from "../types/study";
import type { AuthoredQuestionKind } from "../types/authoredQuestion";
import {
  ExerciseType,
  type ClassifyBatchResult,
  type ExerciseGroup,
} from "../types/exercise";

const exerciseTypeLabels = {
  [ExerciseType.CLASSIFY_ONE]: "Classificar item",
  [ExerciseType.CLASSIFY_BATCH]: "Classificar em colunas",
  [ExerciseType.TRUE_FALSE]: "Verdadeiro ou falso",
  [ExerciseType.SINGLE_CHOICE]: "Escolha única",
  [ExerciseType.MULTIPLE_SELECT]: "Seleção múltipla",
};

interface AnswerResult {
  statementId: number;
  isCorrect: boolean;
}

export function Discipline() {
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedExerciseMode = searchParams.get("exercise") ?? "true-false";
  const requestedStructuredType = searchParams.get("type");
  const requestedStructuredGroupId = Number(searchParams.get("groupId"));
  const {
    disciplineId,
    topicId,
    subtopicId,
  } = useParams();

  const {
    findDiscipline,
    findTopic,
    findSubtopic,
    isLoading: isStructureLoading,
    error: structureError,
  } = useStudy();

  const discipline =
    findDiscipline(disciplineId);

  const topic = findTopic(
    disciplineId,
    topicId,
  );

  const subtopic = findSubtopic(
    disciplineId,
    topicId,
    subtopicId,
  );

  const [statements, setStatements] =
    useState<PublicStatement[]>([]);

  const [answers, setAnswers] =
    useState<AnswerResult[]>([]);

  const [isLoading, setIsLoading] =
    useState(false);

  const [error, setError] = useState<
    string | null
  >(null);

  const [answerError, setAnswerError] =
    useState<string | null>(null);

  const [answeringStatementId, setAnsweringStatementId] =
    useState<number | null>(null);

  const [exerciseGroups, setExerciseGroups] =
    useState<ExerciseGroup[]>([]);

  const [areExerciseGroupsLoading, setAreExerciseGroupsLoading] =
    useState(false);

  const [activeExercise, setActiveExercise] = useState<{
    type: ExerciseType;
    groupId: number;
  } | null>(null);

  const [isRealMultipleChoiceActive, setIsRealMultipleChoiceActive] =
    useState(false);
  const [activeAuthoredType, setActiveAuthoredType] =
    useState<AuthoredQuestionKind | null>(null);

  const [batchResult, setBatchResult] =
    useState<ClassifyBatchResult | null>(null);
  const [realQuestionProgress, setRealQuestionProgress] =
    useState<RealQuestionProgress>({ total: 0, answered: 0, correct: 0 });
  const handleRealQuestionProgress = useCallback((progress: RealQuestionProgress) => {
    setRealQuestionProgress(progress);
  }, []);
  const [authoredProgress, setAuthoredProgress] = useState({ total: 0, answered: 0 });
  const handleAuthoredProgress = useCallback((progress: { total: number; answered: number }) => {
    setAuthoredProgress(progress);
  }, []);

  const answerInFlightRef = useRef(false);
  const activeSubtopicIdRef = useRef<
    number | null
  >(subtopic?.id ?? null);

useEffect(() => {
  activeSubtopicIdRef.current =
    subtopic?.id ?? null;

  setAnswers([]);
  setStatements([]);
  setError(null);
  setAnswerError(null);
  setActiveExercise(null);
  setIsRealMultipleChoiceActive(false);
  setActiveAuthoredType(null);
  setBatchResult(null);
  setRealQuestionProgress({ total: 0, answered: 0, correct: 0 });
  setAuthoredProgress({ total: 0, answered: 0 });

  if (!subtopic) {
    setIsLoading(false);
    return;
  }

  const currentSubtopicId = subtopic.id;
  let cancelled = false;

  async function loadStatements() {
    try {
      setIsLoading(true);

      const result = await getSubtopicStatements(
        currentSubtopicId,
      );

      if (!cancelled) {
        setStatements(result);
      }
    } catch (requestError) {
      if (!cancelled) {
        const message =
          requestError instanceof Error
            ? requestError.message
            : "Erro ao carregar afirmações.";

        setError(message);
        setStatements([]);
      }
    } finally {
      if (!cancelled) {
        setIsLoading(false);
      }
    }
  }

  void loadStatements();

  return () => {
    cancelled = true;
  };
}, [subtopic]);

  useEffect(() => {
    if (!subtopic) return;
    if (requestedExerciseMode === "structured") {
      const type = Object.values(ExerciseType).find((value) => value === requestedStructuredType);
      const group = exerciseGroups.find((item) => item.id === requestedStructuredGroupId);
      setIsRealMultipleChoiceActive(false);
      setActiveAuthoredType(null);
      setActiveExercise(type && group?.eligibleTypes.includes(type) ? { type, groupId: group.id } : null);
      return;
    }
    setActiveExercise(null);
    setBatchResult(null);
    setActiveAuthoredType(
      requestedExerciseMode === "conceptual" || requestedExerciseMode === "cloze"
        ? requestedExerciseMode
        : null,
    );
    setIsRealMultipleChoiceActive(requestedExerciseMode === "exam");
    setAuthoredProgress({ total: 0, answered: 0 });
  }, [exerciseGroups, requestedExerciseMode, requestedStructuredGroupId, requestedStructuredType, subtopic]);

  useEffect(() => {
    if (!subtopic) {
      setExerciseGroups([]);
      setAreExerciseGroupsLoading(false);
      return;
    }

    const currentSubtopicId = subtopic.id;
    const cachedGroups = getCachedExerciseGroups(currentSubtopicId);
    setExerciseGroups(cachedGroups ?? []);
    let cancelled = false;

    async function loadExerciseGroups() {
      try {
        setAreExerciseGroupsLoading(!cachedGroups);
        const result = await getExerciseGroups(currentSubtopicId);

        if (!cancelled) {
          setExerciseGroups(result);
        }
      } catch {
        if (!cancelled) {
          setExerciseGroups([]);
        }
      } finally {
        if (!cancelled) {
          setAreExerciseGroupsLoading(false);
        }
      }
    }

    void loadExerciseGroups();
    void Promise.allSettled([
      getStudyExamQuestions(currentSubtopicId),
      getStudyConceptQuestions(currentSubtopicId),
    ]);

    return () => {
      cancelled = true;
    };
  }, [subtopic]);

  const answeredIds = useMemo(
    () =>
      new Set(
        answers.map(
          (answer) => answer.statementId,
        ),
      ),
    [answers],
  );

  const unansweredStatements = useMemo(
    () =>
      statements.filter(
        (statement) =>
          !answeredIds.has(statement.id),
      ),
    [answeredIds, statements],
  );

  const total = statements.length;
  const answered = answers.length;

  const correct = answers.filter(
    (answer) => answer.isCorrect,
  ).length;

  const incorrect = answered - correct;

  const percentage =
    total > 0
      ? Math.round((correct / total) * 100)
      : 0;

  const isBatchExerciseActive =
    activeExercise?.type === ExerciseType.CLASSIFY_BATCH;
  const isAuthoredUngradedActive = activeAuthoredType !== null;
  const performanceTotal = isAuthoredUngradedActive
    ? authoredProgress.total
    : isBatchExerciseActive
    ? batchResult?.totalCount ?? 0
    : isRealMultipleChoiceActive ? realQuestionProgress.total : total;
  const performanceCorrect = isAuthoredUngradedActive
    ? 0
    : isBatchExerciseActive
    ? batchResult?.correctCount ?? 0
    : isRealMultipleChoiceActive ? realQuestionProgress.correct : correct;
  const performanceIncorrect = isAuthoredUngradedActive
    ? 0
    : isBatchExerciseActive
    ? performanceTotal - performanceCorrect
    : isRealMultipleChoiceActive ? realQuestionProgress.answered - realQuestionProgress.correct : incorrect;
  const performanceAnswered = isAuthoredUngradedActive
    ? authoredProgress.answered
    : isBatchExerciseActive
    ? batchResult?.totalCount ?? 0
    : isRealMultipleChoiceActive ? realQuestionProgress.answered : answered;
  const performancePercentage = isAuthoredUngradedActive
    ? (authoredProgress.total > 0 ? Math.round((authoredProgress.answered / authoredProgress.total) * 100) : 0)
    : isBatchExerciseActive
    ? Math.round((batchResult?.score ?? 0) * 100)
    : isRealMultipleChoiceActive
      ? realQuestionProgress.answered > 0 ? Math.round((realQuestionProgress.correct / realQuestionProgress.answered) * 100) : 0
      : percentage;

  const structuredExerciseTabs = useMemo(
    () =>
      [ExerciseType.CLASSIFY_BATCH, ExerciseType.MULTIPLE_SELECT].flatMap((type) => {
        const group = exerciseGroups.find((candidate) =>
          candidate.eligibleTypes.includes(type),
        );

        return group ? [{ type, groupId: group.id }] : [];
      }),
    [exerciseGroups],
  );

  async function handleAnswer(
  statement: PublicStatement,
  selectedAnswer: boolean,
) {
  if (answerInFlightRef.current) {
    return;
  }

  try {
    answerInFlightRef.current = true;
    setAnsweringStatementId(statement.id);
    setAnswerError(null);

    const result = await registerAnswer(
      statement.id,
      selectedAnswer,
    );

    if (
      activeSubtopicIdRef.current !==
      statement.subtopicId
    ) {
      return;
    }

    setAnswers((current) => {
      const alreadyAnswered =
        current.some(
          (answer) =>
            answer.statementId ===
            statement.id,
        );

      if (alreadyAnswered) {
        return current;
      }

      return [
        ...current,
        {
          statementId: statement.id,
          isCorrect:
            result.attempt.isCorrect,
        },
      ];
    });
  } catch (requestError) {
    setAnswerError(
      requestError instanceof Error
        ? requestError.message
        : "Erro ao registrar resposta.",
    );
  } finally {
    answerInFlightRef.current = false;
    setAnsweringStatementId(null);
  }
}

  function restartSubtopic() {
    setAnswers([]);
    setAnswerError(null);
  }

  if (isStructureLoading && !discipline) {
    return (
      <section className="page" aria-busy="true">
        <div className="study-page-skeleton study-review-skeleton">
          <span /><span /><span />
        </div>
      </section>
    );
  }

  if (structureError && (!discipline || !topic)) {
    return (
      <section className="page">
        <h2>Erro ao carregar conteúdo</h2>
        <p>{structureError}</p>
      </section>
    );
  }

  if (!discipline || !topic) {
    return (
      <section className="page">
        <h2>Conteúdo não encontrado</h2>
      </section>
    );
  }

  return (
    <div className="discipline-workspace">

      <section className="page discipline-page">
      {structureError && <div className="review-error" role="alert">{structureError}</div>}
      <div className="discipline-heading">
        <span>{discipline.name}</span>
        <span>/</span>
        <span>{topic.name}</span>

        {subtopic && (
          <>
            <span>/</span>
            <strong>{subtopic.name}</strong>
          </>
        )}
      </div>

      <h2>{subtopic?.name ?? topic.name}</h2>

      {subtopic && (
        <nav className="discipline-exercise-tabs" aria-label="Tipos de exercício do subtópico">
          <button
            type="button"
            className={`discipline-exercise-tab ${activeExercise === null && !isRealMultipleChoiceActive && !activeAuthoredType ? "discipline-exercise-tab-active" : ""}`}
            onClick={() => {
              setActiveExercise(null);
              setIsRealMultipleChoiceActive(false);
              setActiveAuthoredType(null);
              setSearchParams({}, { replace: true });
            }}
          >
            Afirmações V/F
          </button>

          <button
            type="button"
            className={`discipline-exercise-tab ${isRealMultipleChoiceActive ? "discipline-exercise-tab-active" : ""}`}
            onClick={() => {
              setActiveExercise(null);
              setActiveAuthoredType(null);
              setIsRealMultipleChoiceActive(true);
              setSearchParams({ exercise: "exam" }, { replace: true });
            }}
          >
            Questões de prova
          </button>

          <button type="button" className={`discipline-exercise-tab ${activeAuthoredType === "conceptual" ? "discipline-exercise-tab-active" : ""}`} onClick={() => { setActiveExercise(null); setIsRealMultipleChoiceActive(false); setActiveAuthoredType("conceptual"); setSearchParams({ exercise: "conceptual" }, { replace: true }); }}>
            Conceitual
          </button>

          <button type="button" className={`discipline-exercise-tab ${activeAuthoredType === "cloze" ? "discipline-exercise-tab-active" : ""}`} onClick={() => { setActiveExercise(null); setIsRealMultipleChoiceActive(false); setActiveAuthoredType("cloze"); setSearchParams({ exercise: "cloze" }, { replace: true }); }}>
            Lacunas
          </button>

          {structuredExerciseTabs.map(({ type, groupId }) => (
            <button
              type="button"
              className={`discipline-exercise-tab ${activeExercise?.type === type ? "discipline-exercise-tab-active" : ""}`}
              key={type}
              onClick={() => {
                setIsRealMultipleChoiceActive(false);
                setActiveAuthoredType(null);
                setBatchResult(null);
                setActiveExercise({ type, groupId });
                setSearchParams({ exercise: "structured", type, groupId: String(groupId) }, { replace: true });
              }}
            >
              {exerciseTypeLabels[type]}
            </button>
          ))}

          {areExerciseGroupsLoading && <span className="discipline-tabs-loading">Carregando...</span>}
        </nav>
      )}

      {activeAuthoredType && subtopic ? (
        <AuthoredUngradedSession kind={activeAuthoredType} subtopicId={subtopic.id} onProgressChange={handleAuthoredProgress} />
      ) : activeExercise && subtopic ? (
        <EmbeddedExerciseSession
          subtopicId={subtopic.id}
          groupId={activeExercise.groupId}
          groupName={exerciseGroups.find((group) => group.id === activeExercise.groupId)?.name ?? "Exercício estruturado"}
          type={activeExercise.type}
          onResultChange={(result) =>
            setBatchResult(result?.type === ExerciseType.CLASSIFY_BATCH ? result : null)
          }
        />
      ) : isRealMultipleChoiceActive ? (
        subtopic && <RealMultipleChoiceSession subtopicId={subtopic.id} onProgressChange={handleRealQuestionProgress} />
      ) : <div className="discipline-content">
        <div className="statements-area">
          <div className="statements-table">
            <div className="statements-header">
              <div className="statement-score-cell">
                <div className="mobile-performance-rate"><strong>{performancePercentage}%</strong></div>
                <div className="performance-kicks" role="list" aria-label="Sequência de respostas">
                  {Array.from({ length: total }, (_, index) => {
                    const answer = answers[index];
                    const status = !answer
                      ? "pending"
                      : answer.isCorrect
                        ? "correct"
                        : "incorrect";

                    return (
                      <span
                        key={answer?.statementId ?? `pending-${index}`}
                        className={`performance-kick performance-kick-${status}`}
                        role="listitem"
                        aria-label={`Questão ${index + 1}`}
                      />
                    );
                  })}
                </div>
              </div>
              <div className="statement-response-heading">Resposta</div>
            </div>

            <div className="statement-list">
              {!subtopic && (
                <div className="empty-statements">
                  Selecione um subtópico.
                </div>
              )}

              {isLoading && (
                <div className="empty-statements">
                  Carregando afirmações...
                </div>
              )}

              {error && (
                <div className="empty-statements">
                  {error}
                </div>
              )}

              {answerError && (
                <div className="review-error">
                  {answerError}
                </div>
              )}

              {!isLoading &&
                !error &&
                subtopic &&
                total === 0 && (
                  <div className="empty-statements">
                    Nenhuma afirmação cadastrada
                    neste subtópico.
                  </div>
                )}

              {!isLoading &&
                !error &&
                unansweredStatements.map(
                  (statement) => (
                    <StatementCard
                      key={statement.id}
                      text={statement.text}
                      disabled={
                        answeringStatementId !== null
                      }
                      onAnswer={(answer) =>
                        handleAnswer(
                          statement,
                          answer,
                        )
                      }
                    />
                  ),
                )}

              {!isLoading &&
                !error &&
                total > 0 &&
                unansweredStatements.length ===
                  0 && (
                  <div className="statements-finished">
                    <h3>
                      Subtópico concluído
                    </h3>

                    <p>
                      Você respondeu todas as
                      afirmações deste subtópico.
                    </p>

                    <button
                      type="button"
                      className="restart-button"
                      onClick={
                        restartSubtopic
                      }
                    >
                      Responder novamente
                    </button>
                  </div>
                )}
            </div>
          </div>
        </div>

      </div>}
      </section>
<aside className="performance-panel">
        <header className="performance-panel-heading">
          <h3>Desempenho</h3>
        </header>

        <div
          className="performance-ring"
          role="progressbar"
          aria-label={isAuthoredUngradedActive ? "Percentual respondido" : "Percentual de acertos"}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={performancePercentage}
          style={{
            background: `conic-gradient(var(--color-primary) ${performancePercentage * 3.6}deg, #303640 0deg)`,
          }}
        >
          <div className="performance-ring-center">
            <strong>{performancePercentage}%</strong>
            <span>{isAuthoredUngradedActive ? "respondidas" : "de acertos"}</span>
          </div>
        </div>

        <div className="performance-metrics">
          <div className="performance-item">
            <span><FileText size={15} /> {isBatchExerciseActive ? "Total de itens" : isRealMultipleChoiceActive || isAuthoredUngradedActive ? "Total de questões" : "Total de afirmações"}</span>
            <strong>{performanceTotal}</strong>
          </div>

          <div className="performance-item">
            <span><ListChecks size={15} /> Respondidas</span>
            <strong>{performanceAnswered}</strong>
          </div>

          {!isAuthoredUngradedActive && <div className="performance-item performance-correct">
            <span><CircleCheck size={15} /> Certas</span>
            <strong>{performanceCorrect}</strong>
          </div>}

          {!isAuthoredUngradedActive && <div className="performance-item performance-incorrect">
            <span><CircleX size={15} /> Erradas</span>
            <strong>{performanceIncorrect}</strong>
          </div>}
        </div>

        {!isBatchExerciseActive && !isRealMultipleChoiceActive && !isAuthoredUngradedActive && answered > 0 && (
          <button type="button" className="restart-button" onClick={restartSubtopic}>
            Reiniciar subtópico
          </button>
        )}
      </aside>

    </div>
  );
}
