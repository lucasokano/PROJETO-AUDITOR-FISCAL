import { BookOpen } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  findDiscipline,
  findTopic,
} from "../data/studyStructure";

export function SubtopicMenu() {
  const location = useLocation();
  const navigate = useNavigate();

  const pathParts = location.pathname.split("/").filter(Boolean);

  const disciplineId =
    pathParts[0] === "disciplina" ? pathParts[1] : undefined;

  const topicId =
    pathParts[2] === "topico" ? pathParts[3] : undefined;

  const subtopicId =
    pathParts[4] === "subtopico" ? pathParts[5] : undefined;

  const discipline = findDiscipline(disciplineId);
  const topic = findTopic(disciplineId, topicId);

  if (!discipline || !topic || !disciplineId || !topicId) {
    return null;
  }

  function handleSubtopicClick(selectedSubtopicId: string) {
    navigate(
      `/disciplina/${disciplineId}/topico/${topicId}/subtopico/${selectedSubtopicId}`,
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
              subtopicId === subtopic.id
                ? "subtopic-button-active"
                : ""
            }`}
            onClick={() => handleSubtopicClick(subtopic.id)}
          >
            {subtopic.name}
          </button>
        ))}
      </nav>
    </aside>
  );
}