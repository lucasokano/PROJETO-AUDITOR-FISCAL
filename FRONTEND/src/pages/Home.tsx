import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";
import { ArrowRight, BookOpenCheck, CalendarClock, Target } from "lucide-react";

import {
  getCachedDashboard,
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
    () => getCachedDashboard(),
  );

  const [
    isLoading,
    setIsLoading,
  ] = useState(() => getCachedDashboard() === null);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const hasPreviousData = getCachedDashboard() !== null;
      try {
        setIsLoading(!hasPreviousData);
        setIsRefreshing(hasPreviousData);
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
          setIsRefreshing(false);
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

  if (isLoading && !dashboard) {
    return (
      <section className="page home-page performance-dashboard" aria-busy="true">
        <div className="study-page-skeleton study-dashboard-skeleton">
          <span /><span /><span /><span />
        </div>
      </section>
    );
  }

  if (error && !dashboard) {
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

  const totalStatements = dashboard.disciplines.reduce((sum, item) => sum + item.totalStatements, 0);
  const answeredStatements = dashboard.disciplines.reduce((sum, item) => sum + item.answeredStatements, 0);
  const overallPercentage = totalStatements > 0 ? Math.round((answeredStatements / totalStatements) * 100) : 0;
  const forecastTotal = dashboard.forecast.reduce((sum, day) => sum + day.count, 0);

  return (
    <section className="page home-page performance-dashboard">
      <header className="home-heading">
        <span className="home-eyebrow">Painel de estudos</span>
        <h2>Desempenho</h2>
        <p>Acompanhe o conteúdo estudado e a carga de revisões dos próximos dias.</p>
        {isRefreshing && <span className="study-refresh-indicator" role="status">Atualizando...</span>}
        {error && <span className="study-refresh-error" role="alert">{error}</span>}
      </header>

      <section className="performance-summary-grid">
        <article className="performance-summary-card performance-summary-primary"><span className="performance-summary-icon"><CalendarClock size={17} /></span><div><small>Revisões pendentes</small><strong>{dashboard.dueReviews}</strong></div><button type="button" disabled={dashboard.dueReviews === 0} onClick={() => navigate("/revisao")} aria-label="Abrir revisões"><ArrowRight size={16} /></button></article>
        <article className="performance-summary-card"><span className="performance-summary-icon"><Target size={17} /></span><div><small>Progresso geral</small><strong>{overallPercentage}%</strong></div></article>
        <article className="performance-summary-card"><span className="performance-summary-icon"><BookOpenCheck size={17} /></span><div><small>Afirmações estudadas</small><strong>{answeredStatements}<em>/{totalStatements}</em></strong></div></article>
        <article className="performance-summary-card"><span className="performance-summary-icon"><CalendarClock size={17} /></span><div><small>Próximos 7 dias</small><strong>{forecastTotal}</strong></div></article>
      </section>

      <div className="performance-dashboard-grid">
      <section className="home-panel performance-forecast-panel">
        <div className="home-panel-heading">
          <div><span>Agenda</span><h3>Previsão de revisões</h3><p>Distribuição para os próximos sete dias.</p></div>
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

      <section className="home-panel performance-disciplines-panel">
        <div className="home-panel-heading">
          <div><span>Conteúdo</span><h3>Progresso por disciplina</h3><p>Conteúdo respondido pelo menos uma vez.</p></div>
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
                  <small>{discipline.answeredStatements}/{discipline.totalStatements}</small>
                </div>
              ),
            )
          )}
        </div>
      </section>
      </div>
    </section>
  );
}
