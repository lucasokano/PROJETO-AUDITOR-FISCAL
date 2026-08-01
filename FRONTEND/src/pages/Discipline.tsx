import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useParams } from "react-router-dom";

import { StatementCard } from "../components/StatementCard";
import { useStudy } from "../contexts/StudyContext";
import {
  getSubtopicStatements,
  registerAnswer,
} from "../services/studyApi";
import type { Statement } from "../types/study";

interface AnswerResult {
  statementId: number;
  isCorrect: boolean;
}

export function Discipline() {
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
    useState<Statement[]>([]);

  const [answers, setAnswers] =
    useState<AnswerResult[]>([]);

  const [isLoading, setIsLoading] =
    useState(false);

  const [error, setError] = useState<
    string | null
  >(null);

useEffect(() => {
  setAnswers([]);
  setStatements([]);
  setError(null);

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

  async function handleAnswer(
  statement: Statement,
  selectedAnswer: boolean,
) {
  try {
    await registerAnswer(
      statement.id,
      selectedAnswer,
    );

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
            selectedAnswer ===
            statement.correctAnswer,
        },
      ];
    });
  } catch (error) {
    console.error(error);
  }
}

  function restartSubtopic() {
    setAnswers([]);
  }

  if (isStructureLoading) {
    return (
      <section className="page">
        <h2>Carregando conteúdo...</h2>
      </section>
    );
  }

  if (structureError) {
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
    <section className="page discipline-page">
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

      <div className="discipline-content">
        <div className="statements-area">
          <div className="statements-table">
            <div className="statements-header">
              <div>Afirmação</div>
              <div>Verdadeiro</div>
              <div>Falso</div>
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

        <aside className="performance-panel">
          <h3>Desempenho</h3>

          <div className="performance-item">
            <span>Total</span>
            <strong>{total}</strong>
          </div>

          <div className="performance-item">
            <span>Respondidas</span>
            <strong>{answered}</strong>
          </div>

          <div className="performance-item performance-correct">
            <span>Certas</span>
            <strong>{correct}</strong>
          </div>

          <div className="performance-item performance-incorrect">
            <span>Erradas</span>
            <strong>{incorrect}</strong>
          </div>

          <div className="performance-percentage">
            <span>Certas sobre o total</span>
            <strong>{percentage}%</strong>
          </div>

          <div className="performance-progress">
            <div
              className="performance-progress-bar"
              style={{
                width: `${percentage}%`,
              }}
            />
          </div>

          {answered > 0 && (
            <button
              type="button"
              className="restart-button"
              onClick={restartSubtopic}
            >
              Reiniciar subtópico
            </button>
          )}
        </aside>
      </div>
    </section>
  );
}