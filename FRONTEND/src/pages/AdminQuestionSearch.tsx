import { Search, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { deleteExamQuestion, getExamQuestions } from "../services/examQuestionApi";
import { deleteStatement, getAllStatements } from "../services/studyApi";
import type { ExamQuestion } from "../types/examQuestion";
import type { Statement } from "../types/study";

type QuestionKind = "statements" | "examQuestions";

export function AdminQuestionSearch() {
  const [kind, setKind] = useState<QuestionKind>("statements");
  const [search, setSearch] = useState("");
  const [statements, setStatements] = useState<Statement[]>([]);
  const [examQuestions, setExamQuestions] = useState<ExamQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");

  async function loadQuestions() {
    setIsLoading(true);
    try {
      const [nextStatements, nextExamQuestions] = await Promise.all([
        getAllStatements(),
        getExamQuestions(),
      ]);
      setStatements(nextStatements);
      setExamQuestions(nextExamQuestions);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Não foi possível carregar as questões.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => { void loadQuestions(); }, []);

  const normalizedSearch = search.trim().toLocaleLowerCase("pt-BR");
  const filteredStatements = useMemo(() => statements.filter((statement) => {
    const path = `${statement.subtopic?.topic.discipline.name ?? ""} ${statement.subtopic?.topic.name ?? ""} ${statement.subtopic?.name ?? ""}`;
    return `${statement.text} ${path}`.toLocaleLowerCase("pt-BR").includes(normalizedSearch);
  }), [normalizedSearch, statements]);
  const filteredExamQuestions = useMemo(() => examQuestions.filter((question) => {
    const path = `${question.subtopic.topic.discipline.name} ${question.subtopic.topic.name} ${question.subtopic.name}`;
    const origin = `${question.board?.name ?? "banca não indicada"} ${question.exam?.name ?? "prova não indicada"}`;
    return `${question.text} ${path} ${origin}`.toLocaleLowerCase("pt-BR").includes(normalizedSearch);
  }), [examQuestions, normalizedSearch]);

  async function removeStatement(statement: Statement) {
    if (!window.confirm("Excluir esta afirmação?")) return;
    try { await deleteStatement(statement.id); setStatements((items) => items.filter((item) => item.id !== statement.id)); }
    catch (error) { setMessage((error as Error).message); }
  }

  async function removeExamQuestion(question: ExamQuestion) {
    if (!window.confirm("Excluir esta questão?")) return;
    try { await deleteExamQuestion(question.id); setExamQuestions((items) => items.filter((item) => item.id !== question.id)); }
    catch (error) { setMessage((error as Error).message); }
  }

  const resultCount = kind === "statements" ? filteredStatements.length : filteredExamQuestions.length;

  return (
    <section className="page admin-tool-page question-search-page">
      <header className="admin-tool-heading question-search-heading">
        <div><span>Consulta</span><h1>Pesquisar questões</h1><p>Localize conteúdo V/F e questões de bancas em um único lugar.</p></div>
      </header>

      <div className="structure-tabs question-search-tabs" role="tablist">
        <button type="button" className={kind === "statements" ? "structure-tab-active" : ""} onClick={() => setKind("statements")}>Afirmações V/F</button>
        <button type="button" className={kind === "examQuestions" ? "structure-tab-active" : ""} onClick={() => setKind("examQuestions")}>Questões de bancas</button>
      </div>

      <div className="question-search-bar">
        <Search size={16} aria-hidden="true" />
        <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Pesquisar por texto, estrutura, banca ou prova" autoFocus />
        <span>{resultCount} {resultCount === 1 ? "resultado" : "resultados"}</span>
      </div>

      {message && <div className="form-message form-error">{message}</div>}
      {isLoading ? <div className="question-search-empty">Carregando questões...</div> : (
        <div className="question-search-results">
          {kind === "statements" && filteredStatements.map((statement) => (
            <article className="question-search-row" key={statement.id}>
              <div><span>{statement.subtopic?.topic.discipline.name} / {statement.subtopic?.topic.name} / {statement.subtopic?.name}</span><p>{statement.text}</p></div>
              <strong className={statement.correctAnswer ? "answer-true" : "answer-false"}>{statement.correctAnswer ? "Verdadeiro" : "Falso"}</strong>
              <button type="button" onClick={() => void removeStatement(statement)} aria-label="Excluir afirmação"><Trash2 size={14} /></button>
            </article>
          ))}
          {kind === "examQuestions" && filteredExamQuestions.map((question) => (
            <article className="question-search-row" key={question.id}>
              <div><span>{question.subtopic.topic.discipline.name} / {question.subtopic.topic.name} / {question.subtopic.name}</span><p>{question.text}</p><small>{question.board?.name ?? "Banca não indicada"}{question.exam ? ` · ${question.exam.name}` : " · Prova não indicada"}</small></div>
              <strong>{question.options.length} alternativas</strong>
              <button type="button" onClick={() => void removeExamQuestion(question)} aria-label="Excluir questão"><Trash2 size={14} /></button>
            </article>
          ))}
          {resultCount === 0 && <div className="question-search-empty">Nenhuma questão encontrada.</div>}
        </div>
      )}
    </section>
  );
}
