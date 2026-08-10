import {
  useEffect,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import {
  getCachedDueReviewStatements,
  getDueReviewStatements,
  registerAnswer,
} from "../services/studyApi";

import type {
  PublicStatement,
} from "../types/study";

interface ReviewAnswer {
  statementId: number;
  isCorrect: boolean;
}

const REVIEW_LIMIT = 30;

export function Review() {
  const navigate = useNavigate();

  const [
    statements,
    setStatements,
  ] = useState<PublicStatement[]>(
    () => getCachedDueReviewStatements(REVIEW_LIMIT) ?? [],
  );

  const [
    currentIndex,
    setCurrentIndex,
  ] = useState(0);

  const [
    answers,
    setAnswers,
  ] = useState<ReviewAnswer[]>([]);

  const [
    isLoading,
    setIsLoading,
  ] = useState(
    () => getCachedDueReviewStatements(REVIEW_LIMIT) === null,
  );

  const [isRefreshing, setIsRefreshing] = useState(false);

  const [
    isAnswering,
    setIsAnswering,
  ] = useState(false);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadReviews() {
      const hasPreviousData = getCachedDueReviewStatements(REVIEW_LIMIT) !== null;
      try {
        setIsLoading(!hasPreviousData);
        setIsRefreshing(hasPreviousData);
        setError(null);

        const result =
          await getDueReviewStatements(REVIEW_LIMIT);

        if (!cancelled) {
          setStatements(result);
        }
      } catch (requestError) {
        if (!cancelled) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Erro ao carregar revisões.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
          setIsRefreshing(false);
        }
      }
    }

    void loadReviews();

    return () => {
      cancelled = true;
    };
  }, []);

  const currentStatement =
    statements[currentIndex];

  const isFinished =
    statements.length > 0 &&
    currentIndex >= statements.length;

  const correctAnswers =
    answers.filter(
      (answer) => answer.isCorrect,
    ).length;

  const incorrectAnswers =
    answers.length - correctAnswers;

  const percentage =
    answers.length === 0
      ? 0
      : Math.round(
          (correctAnswers /
            answers.length) *
            100,
        );

  async function handleAnswer(
    selectedAnswer: boolean,
  ) {
    if (
      !currentStatement ||
      isAnswering
    ) {
      return;
    }

    try {
      setIsAnswering(true);
      setError(null);

      const result =
        await registerAnswer(
          currentStatement.id,
          selectedAnswer,
        );

      setAnswers((current) => [
        ...current,
        {
          statementId:
            currentStatement.id,
          isCorrect:
            result.attempt.isCorrect,
        },
      ]);

      setCurrentIndex(
        (current) => current + 1,
      );
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Erro ao registrar resposta.",
      );
    } finally {
      setIsAnswering(false);
    }
  }

  if (isLoading && statements.length === 0) {
    return (
      <section className="page review-page" aria-busy="true">
        <div className="study-page-skeleton study-review-skeleton">
          <span /><span /><span />
        </div>
      </section>
    );
  }

  if (
    error &&
    statements.length === 0
  ) {
    return (
      <section className="page">
        <h2>
          Erro ao carregar revisões
        </h2>

        <p>{error}</p>

        <button
          type="button"
          onClick={() => navigate("/")}
        >
          Voltar ao painel
        </button>
      </section>
    );
  }

  if (statements.length === 0) {
    return (
      <section className="page review-page">
        <div className="review-empty">
          <h2>
            Nenhuma revisão pendente
          </h2>

          <p>
            Você está em dia com suas
            revisões.
          </p>

          <button
            type="button"
            className="review-primary-button"
            onClick={() => navigate("/")}
          >
            Voltar ao painel
          </button>
        </div>
      </section>
    );
  }

  if (isFinished) {
    return (
      <section className="page review-page">
        <div className="review-result">
          <span className="review-eyebrow">
            Sessão concluída
          </span>

          <h2>
            Revisão finalizada
          </h2>

          <div className="review-result-grid">
            <div>
              <span>Respondidas</span>
              <strong>
                {answers.length}
              </strong>
            </div>

            <div>
              <span>Certas</span>
              <strong>
                {correctAnswers}
              </strong>
            </div>

            <div>
              <span>Erradas</span>
              <strong>
                {incorrectAnswers}
              </strong>
            </div>

            <div>
              <span>Aproveitamento</span>
              <strong>
                {percentage}%
              </strong>
            </div>
          </div>

          <button
            type="button"
            className="review-primary-button"
            onClick={() => navigate("/")}
          >
            Voltar ao painel
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="page review-page">
      <header className="review-header">
        <div>
          <span className="review-eyebrow">
            Revisão
          </span>

          <h2>
            Afirmação{" "}
            {currentIndex + 1} de{" "}
            {statements.length}
          </h2>
        </div>

        <button
          type="button"
          className="review-exit-button"
          onClick={() => navigate("/")}
        >
          Sair
        </button>
        {isRefreshing && <span className="study-refresh-indicator" role="status">Atualizando...</span>}
      </header>

      <div className="review-progress-track">
        <div
          className="review-progress-fill"
          style={{
            width: `${
              (currentIndex /
                statements.length) *
              100
            }%`,
          }}
        />
      </div>

      <article className="review-card">
        <p>
          {currentStatement?.text}
        </p>

        {error && (
          <div className="review-error">
            {error}
          </div>
        )}

        <div className="review-actions">
          <button
            type="button"
            className="review-answer-button review-answer-false"
            disabled={isAnswering}
            onClick={() =>
              void handleAnswer(false)
            }
          >
            Falso
          </button>

          <button
            type="button"
            className="review-answer-button review-answer-true"
            disabled={isAnswering}
            onClick={() =>
              void handleAnswer(true)
            }
          >
            Verdadeiro
          </button>
        </div>
      </article>
    </section>
  );
}
