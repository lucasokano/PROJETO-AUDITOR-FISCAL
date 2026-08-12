import { useEffect, useState } from "react";
import { answerStudyExamQuestion, getCachedStudyExamQuestions, getStudyExamQuestions } from "../../services/examQuestionApi";
import type { StudyExamQuestion, StudyExamQuestionResult } from "../../types/examQuestion";

export interface RealQuestionProgress { total: number; answered: number; correct: number; }

interface Props {
  subtopicId: number;
  onProgressChange: (progress: RealQuestionProgress) => void;
}

export function RealMultipleChoiceSession({ subtopicId, onProgressChange }: Props) {
  const cachedQuestions = getCachedStudyExamQuestions(subtopicId);
  const [questions, setQuestions] = useState<StudyExamQuestion[]>(cachedQuestions ?? []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null);
  const [results, setResults] = useState<StudyExamQuestionResult[]>([]);
  const [result, setResult] = useState<StudyExamQuestionResult | null>(null);
  const [isLoading, setIsLoading] = useState(!cachedQuestions);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const cached = getCachedStudyExamQuestions(subtopicId);
    setIsLoading(!cached); setError(""); setQuestions(cached ?? []); setResults([]); setCurrentIndex(0); setResult(null);
    void getStudyExamQuestions(subtopicId).then((items) => {
      if (!cancelled) { setQuestions(items); onProgressChange({ total: items.length, answered: 0, correct: 0 }); }
    }).catch((requestError: Error) => { if (!cancelled) setError(requestError.message); })
      .finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, [subtopicId, onProgressChange]);

  const question = questions[currentIndex];

  async function submit() {
    if (!question || !selectedOptionId || result) return;
    try {
      setIsSubmitting(true); setError("");
      const nextResult = await answerStudyExamQuestion(question.id, selectedOptionId);
      const nextResults = [...results, nextResult];
      setResult(nextResult); setResults(nextResults);
      onProgressChange({ total: questions.length, answered: nextResults.length, correct: nextResults.filter((item) => item.isCorrect).length });
    } catch (requestError) { setError((requestError as Error).message); }
    finally { setIsSubmitting(false); }
  }

  function next() { setCurrentIndex((index) => index + 1); setSelectedOptionId(null); setResult(null); }
  function restart() { setCurrentIndex(0); setSelectedOptionId(null); setResult(null); setResults([]); onProgressChange({ total: questions.length, answered: 0, correct: 0 }); }

  if (isLoading) return <div className="real-question-state">Carregando questões...</div>;
  if (error && !question) return <div className="real-question-state real-question-error">{error}</div>;
  if (!questions.length) return <div className="real-question-state"><h3>Questões de prova</h3><p>Nenhuma questão disponível neste subtópico.</p></div>;
  if (!question) return <div className="real-question-state"><h3>Sessão concluída</h3><p>Você respondeu {results.length} questões e acertou {results.filter((item) => item.isCorrect).length}.</p><button type="button" className="restart-button" onClick={restart}>Responder novamente</button></div>;

  return (
    <section className="real-question-session">
      <header><span>Questão {currentIndex + 1} de {questions.length}</span><small>{question.board?.name ?? "Banca não indicada"}{question.exam ? ` · ${question.exam.name}${question.exam.year ? ` · ${question.exam.year}` : ""}` : ""}</small></header>
      <p className="real-question-text">{question.text}</p>
      <div className="real-question-options">
        {question.options.map((option, index) => {
          const isCorrect = result?.correctOptionId === option.id;
          const isWrong = result?.selectedOptionId === option.id && !result.isCorrect;
          return <button type="button" key={option.id} disabled={Boolean(result)} className={`${selectedOptionId === option.id ? "real-option-selected" : ""} ${isCorrect ? "real-option-correct" : ""} ${isWrong ? "real-option-wrong" : ""}`} onClick={() => setSelectedOptionId(option.id)}><strong>{String.fromCharCode(65 + index)}</strong><span>{option.text}</span></button>;
        })}
      </div>
      {error && <div className="form-message form-error">{error}</div>}
      {result && <div className={`real-question-feedback ${result.isCorrect ? "is-correct" : "is-wrong"}`}><strong>{result.isCorrect ? "Resposta correta" : "Resposta incorreta"}</strong>{result.explanation && <p>{result.explanation}</p>}</div>}
      <footer>{result ? <button type="button" className="admin-submit-button" onClick={next}>{currentIndex + 1 === questions.length ? "Ver resultado" : "Próxima questão"}</button> : <button type="button" className="admin-submit-button" disabled={!selectedOptionId || isSubmitting} onClick={() => void submit()}>{isSubmitting ? "Corrigindo..." : "Responder"}</button>}</footer>
    </section>
  );
}
