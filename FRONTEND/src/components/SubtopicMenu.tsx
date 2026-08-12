import {
  BookOpen,
  Boxes,
  Building2,
  CirclePlus,
  FilePlus2,
  ListChecks,
  Network,
  Search,
  Settings,
  MessageSquareText,
  TextCursorInput,
} from "lucide-react";

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

  const adminTools = [
    {
      label: "Estrutura de conteúdo",
      path: "/admin/structure",
      icon: Network,
    },
    {
      label: "Adicionar V/F",
      path: "/admin/questions/true-false",
      icon: ListChecks,
    },
    {
      label: "Adicionar múltipla escolha",
      path: "/admin/questions/multiple-choice",
      icon: CirclePlus,
    },
    {
      label: "Adicionar conceitual",
      path: "/admin/questions/conceptual",
      icon: MessageSquareText,
    },
    {
      label: "Adicionar lacuna",
      path: "/admin/questions/cloze",
      icon: TextCursorInput,
    },
    {
      label: "Adicionar Prova",
      path: "/admin/exams/new",
      icon: FilePlus2,
    },
    {
      label: "Cadastrar Banca",
      path: "/admin/boards/new",
      icon: Building2,
    },
    {
      label: "Pesquisar questões",
      path: "/admin/questions/search",
      icon: Search,
    },
    {
      label: "Conhecimento estruturado",
      path: "/admin/knowledge",
      icon: Boxes,
    },
  ];

  if (location.pathname.startsWith("/admin")) {
    return (
      <aside className="subtopic-sidebar">
        <div className="subtopic-sidebar-header">
          <span className="subtopic-header-icon" aria-hidden="true">
            <Settings size={16} />
          </span>

          <div>
            <span className="subtopic-discipline-name">
              Administração
            </span>

            <strong>Ferramentas</strong>
          </div>
        </div>

        <nav className="subtopic-navigation" aria-label="Funcionalidades administrativas">
          <div className="subtopic-navigation-heading">
            <span>Funcionalidades</span>
            <strong>{adminTools.length}</strong>
          </div>

          {adminTools.map((tool) => {
            const Icon = tool.icon;

            return (
              <button
                type="button"
                key={tool.path}
                className={`subtopic-button admin-tool-button ${
                  location.pathname === tool.path
                    ? "subtopic-button-active"
                    : ""
                }`}
                onClick={() => navigate(tool.path)}
              >
                <Icon size={15} aria-hidden="true" />
                <span>{tool.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>
    );
  }

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
        <span className="subtopic-header-icon" aria-hidden="true">
          <BookOpen size={16} />
        </span>

        <div>
          <span className="subtopic-discipline-name">
            {discipline.name}
          </span>

          <strong>{topic.name}</strong>
        </div>
      </div>

      <nav className="subtopic-navigation">
        <div className="subtopic-navigation-heading">
          <span>Subtópicos</span>
          <strong>{topic.subtopics.length}</strong>
        </div>

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
