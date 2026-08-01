import { useEffect, useState } from "react";

import {
  getDisciplineProgress,
} from "../services/studyApi";

import type {
  DisciplineProgress,
} from "../types/study";

export function Home() {
  const [
    disciplines,
    setDisciplines,
  ] = useState<
    DisciplineProgress[]
  >([]);

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

        const result =
          await getDisciplineProgress();

        if (!cancelled) {
          setDisciplines(result);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Erro ao carregar progresso.",
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

  return (
    <section className="page">
      <h2>Bem-vindo</h2>

      <p>
        O sistema cuida das suas
        revisões. Escolha abaixo qual
        disciplina deseja expandir com
        conteúdo novo.
      </p>

      <div className="home-progress-panel">
        <h3>
          Progresso das disciplinas
        </h3>

        {isLoading && (
          <p>Carregando...</p>
        )}

        {error && <p>{error}</p>}

        {!isLoading &&
          !error &&
          disciplines.map(
            (discipline) => (
              <div
                key={
                  discipline.disciplineId
                }
                className="discipline-progress-card"
              >
                <div className="discipline-progress-header">
                  <span>
                    {discipline.name}
                  </span>

                  <strong>
                    {
                      discipline.percentage
                    }
                    %
                  </strong>
                </div>

                <div className="discipline-progress-bar">
                  <div
                    className="discipline-progress-fill"
                    style={{
                      width: `${discipline.percentage}%`,
                    }}
                  />
                </div>
              </div>
            ),
          )}
      </div>
    </section>
  );
}