import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ArrowLeftRight, Eye } from "lucide-react";
import {
  changeClozeDifficulty, getCachedStudyConceptQuestions,
  getStudyConceptQuestions, revealConceptAnswer,
} from "../../services/authoredQuestionApi";
import { loadMoreOfflineClozeQuestions, loadOfflineClozeSession, synchronizeClozeSubtopic } from "../../services/offlineSync";
import type {
  AuthoredQuestionKind, ConceptAnswerResult, StudyClozeQuestion, StudyConceptQuestion,
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
  const cachedQuestions = kind === "conceptual" ? getCachedStudyConceptQuestions(subtopicId) : null;
  const [questions, setQuestions] = useState<Array<StudyConceptQuestion | StudyClozeQuestion>>(cachedQuestions ?? []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [result, setResult] = useState<ConceptAnswerResult | null>(null);
  const [isClozeRevealed, setIsClozeRevealed] = useState(false);
  const [isLoading, setIsLoading] = useState(!cachedQuestions);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clozeDifficulty, setClozeDifficulty] = useState<"easy" | "difficult">("easy");
  const [easyTotal, setEasyTotal] = useState(0);
  const [difficultTotal, setDifficultTotal] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loadingMoreRef = useRef(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setCurrentIndex(0); setResult(null); setIsClozeRevealed(false); setError("");

    if (kind === "conceptual") {
      const cached = getCachedStudyConceptQuestions(subtopicId);
      setIsLoading(!cached); setQuestions(cached ?? []);
      void getStudyConceptQuestions(subtopicId).then((items) => {
        if (!cancelled) { setQuestions(items); onProgressChange({ total: items.length, answered: 0 }); }
      }).catch((requestError: Error) => { if (!cancelled) setError(requestError.message); })
        .finally(() => { if (!cancelled) setIsLoading(false); });
    } else {
      setIsLoading(true); setQuestions([]);
      void loadOfflineClozeSession(subtopicId).then(async (localSession) => {
        if (cancelled) return;
        const hasLocalItems = localSession.questions.length > 0;
        if (hasLocalItems) {
          setQuestions(localSession.questions);
          setEasyTotal(localSession.easyTotal);
          setDifficultTotal(localSession.difficultTotal);
          onProgressChange({ total: localSession.easyTotal, answered: 0 });
          setIsLoading(false);
        }
        try {
          await synchronizeClozeSubtopic(subtopicId);
          if (!hasLocalItems && !cancelled) {
            const synchronizedSession = await loadOfflineClozeSession(subtopicId);
            setQuestions(synchronizedSession.questions);
            setEasyTotal(synchronizedSession.easyTotal);
            setDifficultTotal(synchronizedSession.difficultTotal);
            onProgressChange({ total: synchronizedSession.easyTotal, answered: 0 });
          }
        } catch (requestError) {
          if (!hasLocalItems && !cancelled) setError(requestError instanceof Error ? requestError.message : "Conteúdo offline indisponível.");
        } finally {
          if (!cancelled) setIsLoading(false);
        }
      }).catch((requestError: Error) => { if (!cancelled) { setError(requestError.message); setIsLoading(false); } });
    }
    return () => { cancelled = true; };
  }, [kind, subtopicId, onProgressChange]);

  const visibleQuestions = useMemo(() => kind === "cloze"
    ? (questions as StudyClozeQuestion[]).filter((question) => question.isDifficult === (clozeDifficulty === "difficult"))
    : questions, [kind, questions, clozeDifficulty]);
  const current = visibleQuestions[currentIndex];
  const easyCount = kind === "cloze" ? easyTotal : 0;
  const difficultCount = kind === "cloze" ? difficultTotal : 0;
  const activeTotal = clozeDifficulty === "difficult" ? difficultCount : easyCount;

  const loadMoreClozeQuestions = useCallback(async () => {
    if (kind !== "cloze" || loadingMoreRef.current || visibleQuestions.length >= activeTotal) return 0;
    loadingMoreRef.current = true;
    setIsLoadingMore(true);
    try {
      const page = await loadMoreOfflineClozeQuestions(subtopicId, clozeDifficulty === "difficult", visibleQuestions.length);
      setQuestions((items) => {
        const knownIds = new Set(items.map((item) => item.id));
        return [...items, ...page.items.filter((item) => !knownIds.has(item.id))];
      });
      return page.items.length;
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Não foi possível carregar o próximo lote.");
      return 0;
    } finally {
      loadingMoreRef.current = false;
      setIsLoadingMore(false);
    }
  }, [kind, visibleQuestions.length, activeTotal, subtopicId, clozeDifficulty]);

  function selectDifficulty(difficulty: "easy" | "difficult") {
    setClozeDifficulty(difficulty);
    setCurrentIndex(0);
    setResult(null);
    setIsClozeRevealed(false);
    onProgressChange({ total: difficulty === "difficult" ? difficultCount : easyCount, answered: 0 });
  }

  async function moveCurrentCloze() {
    if (!current || !("isDifficult" in current) || isSubmitting) return;
    try {
      setIsSubmitting(true);
      setError("");
      const updated = await changeClozeDifficulty(current.id, !current.isDifficult);
      setQuestions((items) => items.map((item) => item.id === current.id && "isDifficult" in item
        ? { ...item, isDifficult: updated.isDifficult }
        : item));
      if (current.isDifficult) { setDifficultTotal((total) => Math.max(0, total - 1)); setEasyTotal((total) => total + 1); }
      else { setEasyTotal((total) => Math.max(0, total - 1)); setDifficultTotal((total) => total + 1); }
      setResult(null);
      setIsClozeRevealed(false);
      if (currentIndex > 0 && currentIndex === visibleQuestions.length - 1) setCurrentIndex(currentIndex - 1);
      const remaining = Math.max(0, activeTotal - 1);
      onProgressChange({ total: remaining, answered: Math.min(currentIndex, remaining) });
    } catch (requestError) {
      setError((requestError as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function reveal() {
    if (!current || result || isClozeRevealed) return;
    if (kind === "cloze") {
      setIsClozeRevealed(true);
      onProgressChange({ total: activeTotal, answered: currentIndex + 1 });
      if (visibleQuestions.length < activeTotal && currentIndex >= Math.max(0, visibleQuestions.length - 5)) {
        void loadMoreClozeQuestions();
      }
      return;
    }
    try {
      setIsSubmitting(true); setError("");
      const revealed = await revealConceptAnswer(current.id);
      setResult(revealed);
      onProgressChange({ total: visibleQuestions.length, answered: currentIndex + 1 });
    } catch (requestError) { setError((requestError as Error).message); }
    finally { setIsSubmitting(false); }
  }

  async function next() {
    if (kind === "cloze" && currentIndex + 1 >= visibleQuestions.length && visibleQuestions.length < activeTotal) {
      const loaded = await loadMoreClozeQuestions();
      if (!loaded) return;
    }
    setCurrentIndex((index) => index + 1); setResult(null); setIsClozeRevealed(false);
  }
  function restart() { setCurrentIndex(0); setResult(null); setIsClozeRevealed(false); onProgressChange({ total: kind === "cloze" ? activeTotal : visibleQuestions.length, answered: 0 }); }

  const title = kind === "conceptual" ? "Questão conceitual" : "Questão de lacuna";
  const difficultyTabs = kind === "cloze" && (
    <div className="cloze-difficulty-tabs" aria-label="Dificuldade das questões">
      <button type="button" className={clozeDifficulty === "easy" ? "is-active" : ""} onClick={() => selectDifficulty("easy")}>Fáceis <span>{easyCount}</span></button>
      <button type="button" className={clozeDifficulty === "difficult" ? "is-active" : ""} onClick={() => selectDifficulty("difficult")}>Difíceis <span>{difficultCount}</span></button>
    </div>
  );
  if (isLoading) return <div className="real-question-state">Carregando questões...</div>;
  if (error && !current) return <div className="real-question-state real-question-error">{error}</div>;
  if (!questions.length) return <div className="real-question-state"><h3>{title}</h3><p>Nenhuma questão disponível neste subtópico.</p></div>;
  if (!visibleQuestions.length) return <section className="real-question-session authored-ungraded-session">{difficultyTabs}<div className="real-question-state"><h3>Lista vazia</h3><p>Não há questões {clozeDifficulty === "easy" ? "fáceis" : "difíceis"} neste subtópico.</p></div></section>;
  if (!current) return <section className="real-question-session authored-ungraded-session">{difficultyTabs}<div className="real-question-state"><h3>Sessão concluída</h3><p>Você respondeu {visibleQuestions.length} questões.</p><button type="button" className="restart-button" onClick={restart}>Responder novamente</button></div></section>;

  const isCloze = "gapCount" in current;
  const prompt = isCloze && isClozeRevealed
    ? highlightedClozeAnswer(current.answer, current.answers)
    : "question" in current ? current.question : current.text;

  return (
    <section className="real-question-session authored-ungraded-session">
      {difficultyTabs}
      <header>
        <span>{title} {currentIndex + 1} de {kind === "cloze" ? activeTotal : visibleQuestions.length}</span>
        {isCloze && <div className="cloze-question-tools"><small>{current.gapCount} lacuna(s)</small><button type="button" disabled={isSubmitting} onClick={() => void moveCurrentCloze()}><ArrowLeftRight size={15} aria-hidden="true" />Mover para {current.isDifficult ? "fáceis" : "difíceis"}</button></div>}
      </header>
      <p className={`real-question-text ${isCloze && isClozeRevealed ? "authored-cloze-revealed" : ""}`}>{prompt}</p>
      {error && <div className="form-message form-error">{error}</div>}
      {result && !isCloze && <div className="authored-answer-key"><span>Gabarito</span><p>{result.answer}</p></div>}
      <footer>
        {result || isClozeRevealed ? (
          <button type="button" className="authored-session-action authored-next-button" disabled={isLoadingMore} onClick={() => void next()}>{currentIndex + 1 === (kind === "cloze" ? activeTotal : visibleQuestions.length) ? "Concluir" : "Próximo"}</button>
        ) : (
          <button type="button" className="authored-session-action authored-reveal-button" disabled={isSubmitting} onClick={() => void reveal()} aria-label={isSubmitting ? "Carregando gabarito" : "Mostrar gabarito"} title="Mostrar gabarito">
            <Eye size={18} aria-hidden="true" />
          </button>
        )}
      </footer>
    </section>
  );
}
