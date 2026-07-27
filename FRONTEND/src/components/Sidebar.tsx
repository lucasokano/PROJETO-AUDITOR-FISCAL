import { ChevronDown, ChevronRight, Home } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { studyStructure } from "../data/studyStructure";

interface SidebarProps {
  isOpen: boolean;
}

export function Sidebar({ isOpen }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const [openDisciplines, setOpenDisciplines] = useState<Set<string>>(
    new Set(),
  );

  const pathParts = location.pathname.split("/").filter(Boolean);

  const currentDisciplineId =
    pathParts[0] === "disciplina" ? pathParts[1] : undefined;

  const currentTopicId =
    pathParts[2] === "topico" ? pathParts[3] : undefined;

  useEffect(() => {
    if (!currentDisciplineId) {
      return;
    }

    setOpenDisciplines((current) => {
      const updated = new Set(current);
      updated.add(currentDisciplineId);
      return updated;
    });
  }, [currentDisciplineId]);

  function toggleDiscipline(disciplineId: string) {
    setOpenDisciplines((current) => {
      const updated = new Set(current);

      if (updated.has(disciplineId)) {
        updated.delete(disciplineId);
      } else {
        updated.add(disciplineId);
      }

      return updated;
    });
  }

  function handleTopicClick(
    disciplineId: string,
    topicId: string,
    firstSubtopicId?: string,
  ) {
    if (firstSubtopicId) {
      navigate(
        `/disciplina/${disciplineId}/topico/${topicId}/subtopico/${firstSubtopicId}`,
      );

      return;
    }

    navigate(`/disciplina/${disciplineId}/topico/${topicId}`);
  }

  return (
    <aside
      className={`sidebar ${
        isOpen ? "sidebar-open" : "sidebar-closed"
      }`}
    >
      <h2 className="sidebar-title">Sistema de Estudos</h2>

      <nav className="sidebar-navigation">
        <button
          type="button"
          className={`sidebar-home-button ${
            location.pathname === "/" ? "sidebar-item-active" : ""
          }`}
          onClick={() => navigate("/")}
        >
          <Home size={18} />
          <span>Página inicial</span>
        </button>

        {studyStructure.map((discipline) => {
          const isExpanded = openDisciplines.has(discipline.id);
          const isCurrentDiscipline =
            currentDisciplineId === discipline.id;

          return (
            <div
              className="discipline-navigation"
              key={discipline.id}
            >
              <button
                type="button"
                className={`discipline-button ${
                  isCurrentDiscipline ? "discipline-button-active" : ""
                }`}
                onClick={() => toggleDiscipline(discipline.id)}
              >
                <span>{discipline.name}</span>

                {isExpanded ? (
                  <ChevronDown size={18} />
                ) : (
                  <ChevronRight size={18} />
                )}
              </button>

              {isExpanded && (
                <div className="topics-list">
                  {discipline.topics.map((topic) => {
                    const isCurrentTopic =
                      isCurrentDiscipline &&
                      currentTopicId === topic.id;

                    return (
                      <button
                        type="button"
                        key={topic.id}
                        className={`topic-button ${
                          isCurrentTopic ? "topic-button-active" : ""
                        }`}
                        onClick={() =>
                          handleTopicClick(
                            discipline.id,
                            topic.id,
                            topic.subtopics[0]?.id,
                          )
                        }
                      >
                        {topic.name}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}