import { useEffect, useState, type ReactNode } from "react";
import { Eye } from "lucide-react";
import {
  getCachedStudyClozeQuestions, getCachedStudyConceptQuestions,
  getStudyClozeQuestions, getStudyConceptQuestions, revealClozeAnswer, revealConceptAnswer,
} from "../../services/authoredQuestionApi";
import type {
  AuthoredQuestionKind, ClozeAnswerResult, ConceptAnswerResult, StudyClozeQuestion, StudyConceptQuestion,
} from "../../types/authoredQuestion";

interface Props {
  kind: AuthoredQuestionKind;
  subtopicId: number;
  onProgressChange: (progress: { total: number; answered: number }) => void;
}

function highlightedClozeAnswer(answer: string, gaps: string[]): ReactNode[] {
  const parts: ReactNode[] = [];
  let cursor = 0;

  gaps.forEach((gap, index) => {
    const position = answer.indexOf(gap, cursor);
    if (position < 0) return;
    if (position > cursor) parts.push(answer.slice(cursor, position));
    parts.push(<strong className="authored-cloze-gap" key={`${position}-${index}`}>{gap}</strong>);
    cursor = position + gap.length;
  });

  if (cursor < answer.length) parts.push(answer.slice(cursor));
  return parts;
}

export function AuthoredUngradedSession({ kind, subtopicId, onProgressChange }: Props) {
  const cachedQuestions = kind === "conceptual" ? getCachedStudyConceptQuestions(subtopicId) : getCachedStudyClozeQuestions(subtopicId);
  const [questions, setQuestions] = useState<Array<StudyConceptQuestion | StudyClozeQuestion>>(cachedQuestions ?? []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [result, setResult] = useState<ConceptAnswerResult | ClozeAnswerResult | null>(null);
  const [isLoading, setIsLoading] = useState(!cachedQuestions);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const cached = kind === "conceptual" ? getCachedStudyConceptQuestions(subtopicId) : getCachedStudyClozeQuestions(subtopicId);
    setIsLoading(!cached); setQuestions(cached ?? []); setCurrentIndex(0); setResult(null); setError("");
    const load = kind === "conceptual" ? getStudyConceptQuestions(subtopicId) : getStudyClozeQuestions(subtopicId);
    void load.then((items) => {
      if (!cancelled) { setQuestions(items); onProgressChange({ total: items.length, answered: 0 }); }
    }).catch((requestError: Error) => { if (!cancelled) setError(requestError.message); })
      .finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, [kind, subtopicId, onProgressChange]);

  const current = questions[currentIndex];

  async function reveal() {
    if (!current || result) return;
    try {
      setIsSubmitting(true); setError("");
      const revealed = kind === "conceptual" ? await revealConceptAnswer(current.id) : await revealClozeAnswer(current.id);
      setResult(revealed);
      onProgressChange({ total: questions.length, answered: currentIndex + 1 });
    } catch (requestError) { setError((requestError as Error).message); }
    finally { setIsSubmitting(false); }
  }

  function next() { setCurrentIndex((index) => index + 1); setResult(null); }
  function restart() { setCurrentIndex(0); setResult(null); onProgressChange({ total: questions.length, answered: 0 }); }

  const title = kind === "conceptual" ? "Questão conceitual" : "Questão de lacuna";
  if (isLoading) return <div className="real-question-state">Carregando questões...</div>;
  if (error && !current) return <div className="real-question-state real-question-error">{error}</div>;
  if (!questions.length) return <div className="real-question-state"><h3>{title}</h3><p>Nenhuma questão disponível neste subtópico.</p></div>;
  if (!current) return <div className="real-question-state"><h3>Sessão concluída</h3><p>Você respondeu {questions.length} questões.</p><button type="button" className="restart-button" onClick={restart}>Responder novamente</button></div>;

  const isCloze = "gapCount" in current;
  const prompt = isCloze && result && "gaps" in result
    ? highlightedClozeAnswer(result.answer, result.gaps)
    : "question" in current ? current.question : current.text;

  return (
    <section className="real-question-session authored-ungraded-session">
      <header><span>{title} {currentIndex + 1} de {questions.length}</span>{isCloze && <small>{current.gapCount} lacuna(s)</small>}</header>
      <p className={`real-question-text ${isCloze && result ? "authored-cloze-revealed" : ""}`}>{prompt}</p>
      {error && <div className="form-message form-error">{error}</div>}
      {result && !isCloze && <div className="authored-answer-key"><span>Gabarito</span><p>{result.answer}</p></div>}
      <footer>
        {result ? (
          <button type="button" className="authored-session-action authored-next-button" onClick={next}>{currentIndex + 1 === questions.length ? "Concluir" : "Próximo"}</button>
        ) : (
          <button type="button" className="authored-session-action authored-reveal-button" disabled={isSubmitting} onClick={() => void reveal()} aria-label={isSubmitting ? "Carregando gabarito" : "Mostrar gabarito"} title="Mostrar gabarito">
            <Eye size={18} aria-hidden="true" />
          </button>
        )}
      </footer>
    </section>
  );
}
