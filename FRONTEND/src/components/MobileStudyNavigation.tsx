import { X } from "lucide-react";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useStudy } from "../contexts/StudyContext";
import { useAuth } from "../contexts/AuthContext";

interface MobileStudyNavigationProps { onClose: () => void; }

export function MobileStudyNavigation({ onClose }: MobileStudyNavigationProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { disciplines } = useStudy();
  const { logout } = useAuth();
  const parts = location.pathname.split("/").filter(Boolean);
  const disciplineSlug = parts[0] === "disciplina" ? parts[1] ?? "" : "";
  const topicSlug = parts[2] === "topico" ? parts[3] ?? "" : "";
  const subtopicSlug = parts[4] === "subtopico" ? parts[5] ?? "" : "";
  const discipline = disciplines.find((item) => item.slug === disciplineSlug);
  const topic = discipline?.topics.find((item) => item.slug === topicSlug);
  const requestedMode = new URLSearchParams(location.search).get("exercise") ?? "true-false";
  const exerciseMode = ["exam", "conceptual", "cloze"].includes(requestedMode) ? requestedMode : "true-false";

  function withExerciseMode(path: string) {
    return exerciseMode === "true-false" ? path : `${path}?exercise=${exerciseMode}`;
  }

  function selectDiscipline(slug: string) {
    const selected = disciplines.find((item) => item.slug === slug);
    const selectedTopic = selected?.topics[0];
    if (!selected || !selectedTopic) return;
    const selectedSubtopic = selectedTopic.subtopics[0];
    navigate(withExerciseMode(selectedSubtopic ? `/disciplina/${selected.slug}/topico/${selectedTopic.slug}/subtopico/${selectedSubtopic.slug}` : `/disciplina/${selected.slug}/topico/${selectedTopic.slug}`));
  }

  function selectTopic(slug: string) {
    const selectedTopic = discipline?.topics.find((item) => item.slug === slug);
    if (!discipline || !selectedTopic) return;
    const selectedSubtopic = selectedTopic.subtopics[0];
    navigate(withExerciseMode(selectedSubtopic ? `/disciplina/${discipline.slug}/topico/${selectedTopic.slug}/subtopico/${selectedSubtopic.slug}` : `/disciplina/${discipline.slug}/topico/${selectedTopic.slug}`));
  }

  function selectSubtopic(slug: string) {
    if (!discipline || !topic || !slug) return;
    navigate(withExerciseMode(`/disciplina/${discipline.slug}/topico/${topic.slug}/subtopico/${slug}`));
    onClose();
  }

  function selectExerciseMode(mode: string) {
    navigate(`${location.pathname}${mode === "true-false" ? "" : `?exercise=${mode}`}`);
    onClose();
  }

  return (
    <aside className="mobile-study-navigation">
      <button type="button" className="mobile-navigation-close" onClick={onClose} aria-label="Fechar navegação"><X size={22} /></button>
      <label><span>Disciplina</span><select value={disciplineSlug} onChange={(event) => selectDiscipline(event.target.value)}><option value="">Selecione</option>{disciplines.map((item) => <option key={item.id} value={item.slug}>{item.name}</option>)}</select></label>
      <label><span>Tópico</span><select value={topicSlug} disabled={!discipline} onChange={(event) => selectTopic(event.target.value)}><option value="">Selecione</option>{discipline?.topics.map((item) => <option key={item.id} value={item.slug}>{item.name}</option>)}</select></label>
      <label><span>Subtópico</span><select value={subtopicSlug} disabled={!topic} onChange={(event) => selectSubtopic(event.target.value)}><option value="">Selecione</option>{topic?.subtopics.map((item) => <option key={item.id} value={item.slug}>{item.name}</option>)}</select></label>
      <label><span>Tipo de questão</span><select value={exerciseMode} disabled={!subtopicSlug} onChange={(event) => selectExerciseMode(event.target.value)}><option value="true-false">Afirmações V/F</option><option value="exam">Questões de prova</option><option value="conceptual">Conceitual</option><option value="cloze">Lacunas</option></select></label>
      <button type="button" className="mobile-navigation-logout" onClick={() => void logout().then(() => navigate("/login", { replace: true }))}>Sair</button>
    </aside>
  );
}

export function MobileStudyRedirect() {
  const location = useLocation();
  const navigate = useNavigate();
  const { disciplines, isLoading } = useStudy();

  useEffect(() => {
    if (isLoading || location.pathname !== "/") return;
    const discipline = disciplines.find((item) => item.topics.some((topic) => topic.subtopics.length > 0));
    const topic = discipline?.topics.find((item) => item.subtopics.length > 0);
    const subtopic = topic?.subtopics[0];
    if (discipline && topic && subtopic) navigate(`/disciplina/${discipline.slug}/topico/${topic.slug}/subtopico/${subtopic.slug}`, { replace: true });
  }, [disciplines, isLoading, location.pathname, navigate]);

  return null;
}
