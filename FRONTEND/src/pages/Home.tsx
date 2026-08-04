import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import {
  getDashboard,
} from "../services/studyApi";

import type {
  StudyDashboard,
} from "../types/study";

export function Home() {
  const navigate = useNavigate();
  const [
    dashboard,
    setDashboard,
  ] = useState<StudyDashboard | null>(
    null,
  );

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setIsLoading(true);
        setError(null);

        const result =
          await getDashboard();

        if (!cancelled) {
          setDashboard(result);
        }
      } catch (requestError) {
        if (!cancelled) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Erro ao carregar o painel.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  const maximumForecastCount =
    useMemo(() => {
      if (!dashboard) {
        return 0;
      }

      return Math.max(
        ...dashboard.forecast.map(
          (day) => day.count,
        ),
        0,
      );
    }, [dashboard]);

  function formatForecastLabel(
    dateValue: string,
    index: number,
  ) {
    if (index === 0) {
      return "Hoje";
    }

    if (index === 1) {
      return "Amanhã";
    }

    const date = new Date(
      `${dateValue}T12:00:00`,
    );

    const label =
      new Intl.DateTimeFormat(
        "pt-BR",
        {
          weekday: "long",
        },
      ).format(date);

    return (
      label.charAt(0).toUpperCase() +
      label.slice(1)
    );
  }

  if (isLoading) {
    return (
      <section className="page">
        <h2>Carregando painel...</h2>
      </section>
    );
  }

  if (error) {
    return (
      <section className="page">
        <h2>Erro ao carregar painel</h2>

        <p>{error}</p>
      </section>
    );
  }

  if (!dashboard) {
    return (
      <section className="page">
        <h2>Painel indisponível</h2>
      </section>
    );
  }

  return (
    <section className="page home-page">
      <header className="home-heading">
        <span className="home-eyebrow">
          Painel de estudos
        </span>

        <h2>Visão geral</h2>

        <p>
          Acompanhe suas revisões e escolha
          onde ampliar seus conhecimentos.
        </p>
      </header>

      <section className="home-review-card">
        <div className="home-review-summary">
          <span>
            Revisões pendentes
          </span>

          <strong>
            {dashboard.dueReviews}
          </strong>
        </div>

        <button
  type="button"
  className="home-review-button"
  disabled={dashboard.dueReviews === 0}
  onClick={() => navigate("/revisao")}
>
  {dashboard.dueReviews > 0
    ? "Revisar agora"
    : "Nenhuma revisão pendente"}
</button>
      </section>

      <section className="home-panel">
        <div className="home-panel-heading">
          <div>
            <h3>
              Próximos 7 dias
            </h3>

            <p>
              Previsão da quantidade de
              afirmações que entrarão em
              revisão.
            </p>
          </div>
        </div>

        <div className="forecast-list">
          {dashboard.forecast.map(
            (day, index) => {
              const width =
                maximumForecastCount === 0
                  ? 0
                  : Math.max(
                      (day.count /
                        maximumForecastCount) *
                        100,
                      day.count > 0 ? 4 : 0,
                    );

              return (
                <div
                  key={day.date}
                  className="forecast-row"
                >
                  <span className="forecast-label">
                    {formatForecastLabel(
                      day.date,
                      index,
                    )}
                  </span>

                  <div className="forecast-track">
                    <div
                      className="forecast-fill"
                      style={{
                        width: `${width}%`,
                      }}
                    />
                  </div>

                  <strong className="forecast-count">
                    {day.count}
                  </strong>
                </div>
              );
            },
          )}
        </div>
      </section>

      <section className="home-panel">
        <div className="home-panel-heading">
          <div>
            <h3>
              Progresso das disciplinas
            </h3>

            <p>
              Percentual de afirmações
              respondidas ao menos uma vez.
            </p>
          </div>
        </div>

        <div className="discipline-progress-list">
          {dashboard.disciplines.length ===
          0 ? (
            <div className="home-empty-state">
              Nenhuma disciplina cadastrada.
            </div>
          ) : (
            dashboard.disciplines.map(
              (discipline, index) => (
                <div
                  key={
                    discipline.disciplineId
                  }
                  className="discipline-progress-row"
                >
                  <span className="discipline-progress-name">
                    {discipline.name}
                  </span>

                  <div className="discipline-progress-track">
                    <div
                      className={`discipline-progress-value discipline-progress-color-${
                        (index % 6) + 1
                      }`}
                      style={{
                        width: `${discipline.percentage}%`,
                      }}
                    />
                  </div>

                  <strong className="discipline-progress-percentage">
                    {discipline.percentage}%
                  </strong>
                </div>
              ),
            )
          )}
        </div>
      </section>
    </section>
  );
}