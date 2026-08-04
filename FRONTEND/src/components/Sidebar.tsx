import {
  ChevronDown,
  ChevronRight,
  Home,
  Settings,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import { useStudy } from "../contexts/StudyContext";

interface SidebarProps {
  isOpen: boolean;
}

export function Sidebar({
  isOpen,
}: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    disciplines,
    isLoading,
    error,
    reloadStructure,
  } = useStudy();

  const [openDisciplines, setOpenDisciplines] =
    useState<Set<string>>(new Set());

  const pathParts = location.pathname
    .split("/")
    .filter(Boolean);

  const currentDisciplineSlug =
    pathParts[0] === "disciplina"
      ? pathParts[1]
      : undefined;

  const currentTopicSlug =
    pathParts[2] === "topico"
      ? pathParts[3]
      : undefined;

  useEffect(() => {
    if (!currentDisciplineSlug) {
      return;
    }

    setOpenDisciplines((current) => {
      const updated = new Set(current);

      updated.add(currentDisciplineSlug);

      return updated;
    });
  }, [currentDisciplineSlug]);

  function toggleDiscipline(
    disciplineSlug: string,
  ) {
    setOpenDisciplines((current) => {
      const updated = new Set(current);

      if (updated.has(disciplineSlug)) {
        updated.delete(disciplineSlug);
      } else {
        updated.add(disciplineSlug);
      }

      return updated;
    });
  }

  function openTopic(
    disciplineSlug: string,
    topicSlug: string,
    firstSubtopicSlug?: string,
  ) {
    if (firstSubtopicSlug) {
      navigate(
        `/disciplina/${disciplineSlug}/topico/${topicSlug}/subtopico/${firstSubtopicSlug}`,
      );

      return;
    }

    navigate(
      `/disciplina/${disciplineSlug}/topico/${topicSlug}`,
    );
  }

  return (
    <aside
      className={`sidebar ${
        isOpen
          ? "sidebar-open"
          : "sidebar-closed"
      }`}
    >
      <h2 className="sidebar-title">
        Sistema de Estudos
      </h2>

      <nav className="sidebar-navigation">
        <button
          type="button"
          className={`sidebar-home-button ${
            location.pathname === "/"
              ? "sidebar-item-active"
              : ""
          }`}
          onClick={() => navigate("/")}
        >
          <Home size={18} />

          <span>Página inicial</span>
        </button>

        {isLoading && (
          <div className="sidebar-status">
            Carregando disciplinas...
          </div>
        )}

        {error && (
          <div className="sidebar-error">
            <span>{error}</span>

            <button
              type="button"
              onClick={() =>
                void reloadStructure()
              }
            >
              Tentar novamente
            </button>
          </div>
        )}

        {!isLoading &&
          !error &&
          disciplines.map((discipline) => {
            const isExpanded =
              openDisciplines.has(
                discipline.slug,
              );

            const isCurrentDiscipline =
              currentDisciplineSlug ===
              discipline.slug;

            return (
              <div
                key={discipline.id}
                className="discipline-navigation"
              >
                <button
                  type="button"
                  className={`discipline-button ${
                    isCurrentDiscipline
                      ? "discipline-button-active"
                      : ""
                  }`}
                  onClick={() =>
                    toggleDiscipline(
                      discipline.slug,
                    )
                  }
                >
                  <span>
                    {discipline.name}
                  </span>

                  {isExpanded ? (
                    <ChevronDown size={18} />
                  ) : (
                    <ChevronRight size={18} />
                  )}
                </button>

                {isExpanded && (
                  <div className="topics-list">
                    {discipline.topics.map(
                      (topic) => {
                        const isCurrentTopic =
                          isCurrentDiscipline &&
                          currentTopicSlug ===
                            topic.slug;

                        return (
                          <button
                            type="button"
                            key={topic.id}
                            className={`topic-button ${
                              isCurrentTopic
                                ? "topic-button-active"
                                : ""
                            }`}
                            onClick={() =>
                              openTopic(
                                discipline.slug,
                                topic.slug,
                                topic
                                  .subtopics[0]
                                  ?.slug,
                              )
                            }
                          >
                            {topic.name}
                          </button>
                        );
                      },
                    )}
                  </div>
                )}
              </div>
            );
          })}
      </nav>

      <div className="sidebar-admin-section">
        <button
          type="button"
          className={`sidebar-home-button ${
            location.pathname.startsWith("/admin")
              ? "sidebar-item-active"
              : ""
          }`}
          onClick={() => navigate("/admin")}
        >
          <Settings size={18} />

          <span>Administração</span>
        </button>
      </div>
    </aside>
  );
}
