import { BookOpen } from "lucide-react";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import { useStudy } from "../contexts/StudyContext";

export function SubtopicMenu() {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    findDiscipline,
    findTopic,
    isLoading,
  } = useStudy();

  const pathParts = location.pathname
    .split("/")
    .filter(Boolean);

  const disciplineSlug =
    pathParts[0] === "disciplina"
      ? pathParts[1]
      : undefined;

  const topicSlug =
    pathParts[2] === "topico"
      ? pathParts[3]
      : undefined;

  const subtopicSlug =
    pathParts[4] === "subtopico"
      ? pathParts[5]
      : undefined;

  if (isLoading) {
    return null;
  }

  const discipline =
    findDiscipline(disciplineSlug);

  const topic = findTopic(
    disciplineSlug,
    topicSlug,
  );

  if (
    !discipline ||
    !topic ||
    !disciplineSlug ||
    !topicSlug
  ) {
    return null;
  }

  function openSubtopic(
    selectedSubtopicSlug: string,
  ) {
    navigate(
      `/disciplina/${disciplineSlug}/topico/${topicSlug}/subtopico/${selectedSubtopicSlug}`,
    );
  }

  return (
    <aside className="subtopic-sidebar">
      <div className="subtopic-sidebar-header">
        <BookOpen size={18} />

        <div>
          <span className="subtopic-discipline-name">
            {discipline.name}
          </span>

          <strong>{topic.name}</strong>
        </div>
      </div>

      <nav className="subtopic-navigation">
        {topic.subtopics.map((subtopic) => (
          <button
            type="button"
            key={subtopic.id}
            className={`subtopic-button ${
              subtopicSlug === subtopic.slug
                ? "subtopic-button-active"
                : ""
            }`}
            onClick={() =>
              openSubtopic(subtopic.slug)
            }
          >
            {subtopic.name}
          </button>
        ))}
      </nav>
    </aside>
  );
}