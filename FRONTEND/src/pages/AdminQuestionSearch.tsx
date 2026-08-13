import { Pencil, Save, Search, Trash2, X } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { useStudy } from "../contexts/StudyContext";
import {
  deleteClozeQuestion, deleteConceptQuestion, getClozeQuestions, getConceptQuestions,
  updateClozeQuestion, updateConceptQuestion,
} from "../services/authoredQuestionApi";
import {
  deleteExamQuestion, getExamBoards, getExamQuestions, getExams, updateExamQuestion,
} from "../services/examQuestionApi";
import { deleteStatement, getAllStatements, updateStatement } from "../services/studyApi";
import type { ClozeQuestion, ConceptQuestion } from "../types/authoredQuestion";
import type { Exam, ExamBoard, ExamQuestion } from "../types/examQuestion";
import type { Statement } from "../types/study";

type QuestionKind = "statements" | "examQuestions" | "conceptual" | "cloze";
type Editing =
  | { kind: "statements"; id: number; subtopicId: number; text: string; correctAnswer: boolean }
  | { kind: "examQuestions"; id: number; subtopicId: number; boardId: number | null; examId: number | null; text: string; explanation: string; isActive: boolean; options: Array<{ text: string; isCorrect: boolean }> }
  | { kind: "conceptual"; id: number; subtopicId: number; question: string; answer: string; isActive: boolean }
  | { kind: "cloze"; id: number; subtopicId: number; textWithAnswers: string; isActive: boolean };

const labels: Record<QuestionKind, string> = {
  statements: "Afirmações V/F", examQuestions: "Múltipla escolha", conceptual: "Conceituais", cloze: "Lacunas",
};

export function AdminQuestionSearch() {
  const { disciplines } = useStudy();
  const [kind, setKind] = useState<QuestionKind>("statements");
  const [search, setSearch] = useState("");
  const [disciplineId, setDisciplineId] = useState("");
  const [topicId, setTopicId] = useState("");
  const [subtopicId, setSubtopicId] = useState("");
  const [appliedSearch, setAppliedSearch] = useState<{ subtopicId: number; text: string } | null>(null);
  const [statements, setStatements] = useState<Statement[]>([]);
  const [examQuestions, setExamQuestions] = useState<ExamQuestion[]>([]);
  const [conceptQuestions, setConceptQuestions] = useState<ConceptQuestion[]>([]);
  const [clozeQuestions, setClozeQuestions] = useState<ClozeQuestion[]>([]);
  const [boards, setBoards] = useState<ExamBoard[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [editing, setEditing] = useState<Editing | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  const subtopics = useMemo(() => disciplines.flatMap((discipline) => discipline.topics.flatMap((topic) => topic.subtopics.map((subtopic) => ({ ...subtopic, path: `${discipline.name} / ${topic.name} / ${subtopic.name}` })))), [disciplines]);
  const selectedDiscipline = disciplines.find((item) => item.id === Number(disciplineId));
  const selectedTopic = selectedDiscipline?.topics.find((item) => item.id === Number(topicId));

  async function loadQuestions() {
    setIsLoading(true);
    try {
      const [nextStatements, nextExamQuestions, nextConcepts, nextClozes, nextBoards, nextExams] = await Promise.all([
        getAllStatements(), getExamQuestions(), getConceptQuestions(), getClozeQuestions(), getExamBoards(), getExams(),
      ]);
      setStatements(nextStatements); setExamQuestions(nextExamQuestions); setConceptQuestions(nextConcepts); setClozeQuestions(nextClozes); setBoards(nextBoards); setExams(nextExams);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Não foi possível carregar as questões."); }
    finally { setIsLoading(false); }
  }

  const normalizedSearch = appliedSearch?.text.trim().toLocaleLowerCase("pt-BR") ?? "";
  function matches(text: string, subtopicId: number, extra = "") {
    if (!appliedSearch || subtopicId !== appliedSearch.subtopicId) return false;
    const path = subtopics.find((item) => item.id === subtopicId)?.path ?? "";
    return `${text} ${path} ${extra}`.toLocaleLowerCase("pt-BR").includes(normalizedSearch);
  }
  const filteredStatements = statements.filter((item) => matches(item.text, item.subtopicId));
  const filteredExamQuestions = examQuestions.filter((item) => matches(item.text, item.subtopicId, `${item.board?.name ?? ""} ${item.exam?.name ?? ""}`));
  const filteredConcepts = conceptQuestions.filter((item) => matches(`${item.question} ${item.answer}`, item.subtopicId));
  const filteredClozes = clozeQuestions.filter((item) => matches(item.textWithAnswers, item.subtopicId));
  const resultCount = kind === "statements" ? filteredStatements.length : kind === "examQuestions" ? filteredExamQuestions.length : kind === "conceptual" ? filteredConcepts.length : filteredClozes.length;

  function context(subtopicId: number) { return subtopics.find((item) => item.id === subtopicId)?.path ?? "Estrutura não encontrada"; }
  function startStatement(item: Statement) { setEditing({ kind: "statements", id: item.id, subtopicId: item.subtopicId, text: item.text, correctAnswer: item.correctAnswer }); }
  function startExam(item: ExamQuestion) {
    const options = Array.from({ length: 5 }, (_, index) => ({ text: item.options[index]?.text ?? "", isCorrect: item.options[index]?.isCorrect ?? false }));
    setEditing({ kind: "examQuestions", id: item.id, subtopicId: item.subtopicId, boardId: item.boardId, examId: item.examId, text: item.text, explanation: item.explanation ?? "", isActive: item.isActive, options });
  }
  function startConcept(item: ConceptQuestion) { setEditing({ kind: "conceptual", id: item.id, subtopicId: item.subtopicId, question: item.question, answer: item.answer, isActive: item.isActive }); }
  function startCloze(item: ClozeQuestion) { setEditing({ kind: "cloze", id: item.id, subtopicId: item.subtopicId, textWithAnswers: item.textWithAnswers, isActive: item.isActive }); }
  async function save(event: FormEvent) {
    event.preventDefault(); if (!editing) return;
    try {
      setIsSaving(true); setMessage("");
      if (editing.kind === "statements") {
        const input = { subtopicId: editing.subtopicId, text: editing.text, correctAnswer: editing.correctAnswer };
        await updateStatement(editing.id, input);
      }
      if (editing.kind === "conceptual") {
        await updateConceptQuestion(editing.id, editing);
      }
      if (editing.kind === "cloze") {
        await updateClozeQuestion(editing.id, editing);
      }
      if (editing.kind === "examQuestions") {
        const options = editing.options.filter((option) => option.text.trim());
        const input = { ...editing, explanation: editing.explanation || null, options };
        await updateExamQuestion(editing.id, input);
      }
      await loadQuestions(); setEditing(null); setMessage("Questão atualizada com sucesso.");
    } catch (error) { setMessage((error as Error).message); }
    finally { setIsSaving(false); }
  }

  async function remove(itemKind: QuestionKind, id: number, subtopicId: number) {
    if (!window.confirm("Excluir esta questão?")) return;
    try {
      if (itemKind === "statements") await deleteStatement(id);
      if (itemKind === "examQuestions") await deleteExamQuestion(id);
      if (itemKind === "conceptual") await deleteConceptQuestion(id, subtopicId);
      if (itemKind === "cloze") await deleteClozeQuestion(id, subtopicId);
      await loadQuestions(); setMessage("Questão excluída.");
    } catch (error) { setMessage((error as Error).message); }
  }

  function actions(itemKind: QuestionKind, id: number, subtopicId: number, begin: () => void) {
    return <div className="question-search-actions"><button type="button" onClick={begin} aria-label="Editar questão"><Pencil size={14} /></button><button type="button" onClick={() => void remove(itemKind, id, subtopicId)} aria-label="Excluir questão"><Trash2 size={14} /></button></div>;
  }

  function editor() {
    if (!editing) return null;
    const availableExams = exams.filter((exam) => editing.kind !== "examQuestions" || !editing.boardId || exam.boardId === editing.boardId);
    return <form className="question-inline-editor" onSubmit={save}>
      <label><span>Subtópico</span><select value={editing.subtopicId} onChange={(event) => setEditing({ ...editing, subtopicId: Number(event.target.value) })}>{subtopics.map((item) => <option key={item.id} value={item.id}>{item.path}</option>)}</select></label>
      {editing.kind === "statements" && <><label><span>Afirmação</span><textarea rows={3} value={editing.text} onChange={(event) => setEditing({ ...editing, text: event.target.value })} required /></label><label><span>Gabarito</span><select value={String(editing.correctAnswer)} onChange={(event) => setEditing({ ...editing, correctAnswer: event.target.value === "true" })}><option value="true">Verdadeiro</option><option value="false">Falso</option></select></label></>}
      {editing.kind === "conceptual" && <><label><span>Pergunta</span><textarea rows={3} value={editing.question} onChange={(event) => setEditing({ ...editing, question: event.target.value })} required /></label><label><span>Gabarito</span><textarea rows={3} value={editing.answer} onChange={(event) => setEditing({ ...editing, answer: event.target.value })} required /></label></>}
      {editing.kind === "cloze" && <label><span>Texto com lacunas</span><textarea rows={5} value={editing.textWithAnswers} onChange={(event) => setEditing({ ...editing, textWithAnswers: event.target.value })} required /></label>}
      {editing.kind === "examQuestions" && <>
        <div className="question-inline-grid"><label><span>Banca</span><select value={editing.boardId ?? ""} onChange={(event) => setEditing({ ...editing, boardId: event.target.value ? Number(event.target.value) : null, examId: null })}><option value="">Não indicada</option>{boards.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><label><span>Prova</span><select value={editing.examId ?? ""} onChange={(event) => { const examId = event.target.value ? Number(event.target.value) : null; const exam = exams.find((item) => item.id === examId); setEditing({ ...editing, examId, boardId: exam?.boardId ?? editing.boardId }); }}><option value="">Não indicada</option>{availableExams.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label></div>
        <label><span>Enunciado</span><textarea rows={4} value={editing.text} onChange={(event) => setEditing({ ...editing, text: event.target.value })} required /></label>
        <div className="question-inline-options">{editing.options.map((option, index) => <label key={index}><input type="radio" name="inline-correct" checked={option.isCorrect} onChange={() => setEditing({ ...editing, options: editing.options.map((item, optionIndex) => ({ ...item, isCorrect: optionIndex === index })) })} /><input value={option.text} placeholder={`Alternativa ${String.fromCharCode(65 + index)}`} onChange={(event) => setEditing({ ...editing, options: editing.options.map((item, optionIndex) => optionIndex === index ? { ...item, text: event.target.value } : item) })} /></label>)}</div>
        <label><span>Comentário</span><textarea rows={2} value={editing.explanation} onChange={(event) => setEditing({ ...editing, explanation: event.target.value })} /></label>
      </>}
      {editing.kind !== "statements" && <label className="question-inline-active"><input type="checkbox" checked={editing.isActive} onChange={(event) => setEditing({ ...editing, isActive: event.target.checked })} /><span>Questão ativa</span></label>}
      <div className="question-inline-actions"><button type="submit" disabled={isSaving}><Save size={15} /> Salvar</button><button type="button" onClick={() => setEditing(null)}><X size={15} /> Cancelar</button></div>
    </form>;
  }

  return <section className="page admin-tool-page question-search-page">
    <header className="admin-tool-heading question-search-heading"><div><span>Consulta e edição</span><h1>Pesquisar questões</h1><p>Selecione a estrutura, pesquise e edite os resultados no mesmo lugar.</p></div></header>
    <div className="structure-tabs question-search-tabs" role="tablist">{(Object.keys(labels) as QuestionKind[]).map((value) => <button type="button" key={value} className={kind === value ? "structure-tab-active" : ""} onClick={() => { setKind(value); setEditing(null); }}>{labels[value]}</button>)}</div>
    <form className="question-search-filters" onSubmit={(event) => { event.preventDefault(); setAppliedSearch({ subtopicId: Number(subtopicId), text: search }); setEditing(null); void loadQuestions(); }}>
      <label><span>Disciplina</span><select value={disciplineId} onChange={(event) => { setDisciplineId(event.target.value); setTopicId(""); setSubtopicId(""); setAppliedSearch(null); }} required><option value="">Selecione</option>{disciplines.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
      <label><span>Tópico</span><select value={topicId} onChange={(event) => { setTopicId(event.target.value); setSubtopicId(""); setAppliedSearch(null); }} disabled={!selectedDiscipline} required><option value="">Selecione</option>{selectedDiscipline?.topics.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
      <label><span>Subtópico</span><select value={subtopicId} onChange={(event) => { setSubtopicId(event.target.value); setAppliedSearch(null); }} disabled={!selectedTopic} required><option value="">Selecione</option>{selectedTopic?.subtopics.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
      <div className="question-search-bar"><Search size={16} /><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Texto, banca ou prova (opcional)" /></div>
      <button type="submit" className="question-search-submit" disabled={!subtopicId || isLoading}>{isLoading ? "Pesquisando..." : "Pesquisar"}</button>
    </form>
    {appliedSearch && !isLoading && <div className="question-search-count">{resultCount} {resultCount === 1 ? "resultado" : "resultados"}</div>}
    {message && <div className="form-message">{message}</div>}
    {isLoading ? <div className="question-search-empty">Pesquisando questões...</div> : appliedSearch ? <div className="question-search-results">
      {kind === "statements" && filteredStatements.map((item) => editing?.kind === kind && editing.id === item.id ? <article className="question-search-edit-row" key={item.id}>{editor()}</article> : <article className="question-search-row" key={item.id}><div><span>{context(item.subtopicId)}</span><p>{item.text}</p></div><strong>{item.correctAnswer ? "Verdadeiro" : "Falso"}</strong>{actions(kind, item.id, item.subtopicId, () => startStatement(item))}</article>)}
      {kind === "examQuestions" && filteredExamQuestions.map((item) => editing?.kind === kind && editing.id === item.id ? <article className="question-search-edit-row" key={item.id}>{editor()}</article> : <article className="question-search-row" key={item.id}><div><span>{context(item.subtopicId)}</span><p>{item.text}</p><small>{item.board?.name ?? "Banca não indicada"}{item.exam ? ` · ${item.exam.name}` : " · Prova não indicada"}</small></div><strong>{item.options.length} alternativas</strong>{actions(kind, item.id, item.subtopicId, () => startExam(item))}</article>)}
      {kind === "conceptual" && filteredConcepts.map((item) => editing?.kind === kind && editing.id === item.id ? <article className="question-search-edit-row" key={item.id}>{editor()}</article> : <article className="question-search-row" key={item.id}><div><span>{context(item.subtopicId)}</span><p>{item.question}</p><small>Gabarito: {item.answer}</small></div><strong>{item.isActive ? "Ativa" : "Inativa"}</strong>{actions(kind, item.id, item.subtopicId, () => startConcept(item))}</article>)}
      {kind === "cloze" && filteredClozes.map((item) => editing?.kind === kind && editing.id === item.id ? <article className="question-search-edit-row" key={item.id}>{editor()}</article> : <article className="question-search-row" key={item.id}><div><span>{context(item.subtopicId)}</span><p>{item.textWithAnswers}</p></div><strong>{item.isActive ? "Ativa" : "Inativa"}</strong>{actions(kind, item.id, item.subtopicId, () => startCloze(item))}</article>)}
      {resultCount === 0 && <div className="question-search-empty">Nenhuma questão encontrada.</div>}
    </div> : <div className="question-search-empty">Escolha disciplina, tópico e subtópico para iniciar a pesquisa.</div>}
  </section>;
}
