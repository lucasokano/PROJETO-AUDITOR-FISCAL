import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useStudy } from "../../contexts/StudyContext";
import {
  createExam, createExamBoard, createExamQuestion, deleteExam, deleteExamBoard,
  deleteExamQuestion, getExamBoards, getExamQuestions, getExams,
} from "../../services/examQuestionApi";
import type { Exam, ExamBoard, ExamQuestion } from "../../types/examQuestion";

export type ExamAdminMode = "questions" | "boards" | "exams";
const emptyOptions = () => Array.from({ length: 5 }, (_, index) => ({ text: "", isCorrect: index === 0 }));

interface ExamQuestionAdminProps {
  mode: ExamAdminMode;
}

export function ExamQuestionAdmin({ mode }: ExamQuestionAdminProps) {
  const { disciplines } = useStudy();
  const tab = mode;
  const [boards, setBoards] = useState<ExamBoard[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [message, setMessage] = useState("");
  const [boardName, setBoardName] = useState("");
  const [examBoardId, setExamBoardId] = useState("");
  const [examName, setExamName] = useState("");
  const [examYear, setExamYear] = useState("");
  const [disciplineId, setDisciplineId] = useState("");
  const [topicId, setTopicId] = useState("");
  const [subtopicId, setSubtopicId] = useState("");
  const [boardId, setBoardId] = useState("");
  const [examId, setExamId] = useState("");
  const [text, setText] = useState("");
  const [explanation, setExplanation] = useState("");
  const [options, setOptions] = useState(emptyOptions);

  const discipline = disciplines.find((item) => item.id === Number(disciplineId));
  const topic = discipline?.topics.find((item) => item.id === Number(topicId));
  const availableExams = useMemo(() => exams.filter((exam) => !boardId || exam.boardId === Number(boardId)), [exams, boardId]);

  async function reload() {
    const [nextBoards, nextExams, nextQuestions] = await Promise.all([getExamBoards(), getExams(), getExamQuestions()]);
    setBoards(nextBoards); setExams(nextExams); setQuestions(nextQuestions);
  }
  useEffect(() => { void reload().catch((error: Error) => setMessage(error.message)); }, []);

  async function submitBoard(event: FormEvent) {
    event.preventDefault();
    try { await createExamBoard(boardName); setBoardName(""); await reload(); setMessage("Banca cadastrada."); } catch (error) { setMessage((error as Error).message); }
  }
  async function submitExam(event: FormEvent) {
    event.preventDefault();
    try {
      await createExam({ boardId: Number(examBoardId), name: examName, year: examYear ? Number(examYear) : null });
      setExamName(""); setExamYear(""); await reload(); setMessage("Prova cadastrada.");
    } catch (error) { setMessage((error as Error).message); }
  }
  async function submitQuestion(event: FormEvent) {
    event.preventDefault();
    try {
      await createExamQuestion({
        subtopicId: Number(subtopicId), boardId: boardId ? Number(boardId) : null,
        examId: examId ? Number(examId) : null, text, explanation: explanation || null, options,
      });
      setText(""); setExplanation(""); setOptions(emptyOptions()); await reload(); setMessage("Questão cadastrada.");
    } catch (error) { setMessage((error as Error).message); }
  }

  return (
    <section className="exam-question-admin">
      {message && <div className="form-message">{message}</div>}

      {tab === "boards" && <><form className="exam-admin-inline-form" onSubmit={submitBoard}><label><span>Nome da banca</span><input value={boardName} onChange={(e) => setBoardName(e.target.value)} required /></label><button>Adicionar</button></form><div className="exam-admin-list">{boards.map((board) => <div key={board.id}><span>{board.name}</span><button type="button" onClick={() => void deleteExamBoard(board.id).then(reload).catch((e: Error) => setMessage(e.message))}>Excluir</button></div>)}</div></>}

      {tab === "exams" && <><form className="exam-admin-inline-form" onSubmit={submitExam}><label><span>Banca</span><select value={examBoardId} onChange={(e) => setExamBoardId(e.target.value)} required><option value="">Selecione</option>{boards.map((board) => <option key={board.id} value={board.id}>{board.name}</option>)}</select></label><label><span>Prova</span><input value={examName} onChange={(e) => setExamName(e.target.value)} required /></label><label><span>Ano</span><input type="number" value={examYear} onChange={(e) => setExamYear(e.target.value)} /></label><button>Adicionar</button></form><div className="exam-admin-list">{exams.map((exam) => <div key={exam.id}><span><strong>{exam.name}</strong> · {exam.board.name}{exam.year ? ` · ${exam.year}` : ""}</span><button type="button" onClick={() => void deleteExam(exam.id).then(reload).catch((e: Error) => setMessage(e.message))}>Excluir</button></div>)}</div></>}

      {tab === "questions" && <><form className="exam-question-form" onSubmit={submitQuestion}><div className="exam-question-context"><label><span>Disciplina</span><select value={disciplineId} onChange={(e) => { setDisciplineId(e.target.value); setTopicId(""); setSubtopicId(""); }} required><option value="">Selecione</option>{disciplines.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><label><span>Tópico</span><select value={topicId} onChange={(e) => { setTopicId(e.target.value); setSubtopicId(""); }} required disabled={!discipline}><option value="">Selecione</option>{discipline?.topics.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><label><span>Subtópico</span><select value={subtopicId} onChange={(e) => setSubtopicId(e.target.value)} required disabled={!topic}><option value="">Selecione</option>{topic?.subtopics.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><label><span>Banca</span><select value={boardId} onChange={(e) => { setBoardId(e.target.value); setExamId(""); }}><option value="">Não indicada</option>{boards.map((board) => <option key={board.id} value={board.id}>{board.name}</option>)}</select></label><label><span>Prova</span><select value={examId} onChange={(e) => { setExamId(e.target.value); const exam = exams.find((item) => item.id === Number(e.target.value)); if (exam) setBoardId(String(exam.boardId)); }}><option value="">Não indicada</option>{availableExams.map((exam) => <option key={exam.id} value={exam.id}>{exam.name}{exam.year ? ` (${exam.year})` : ""}</option>)}</select></label></div><label><span>Enunciado</span><textarea value={text} onChange={(e) => setText(e.target.value)} required rows={4} /></label><div className="exam-options">{options.map((option, index) => <label key={index}><input type="radio" name="correct-option" checked={option.isCorrect} onChange={() => setOptions(options.map((item, itemIndex) => ({ ...item, isCorrect: itemIndex === index })))} /><input value={option.text} placeholder={`Alternativa ${String.fromCharCode(65 + index)}`} onChange={(e) => setOptions(options.map((item, itemIndex) => itemIndex === index ? { ...item, text: e.target.value } : item))} required /></label>)}</div><div className="exam-option-actions"><button type="button" disabled={options.length >= 5} onClick={() => setOptions([...options, { text: "", isCorrect: false }])}>Adicionar alternativa</button><button type="button" disabled={options.length <= 2} onClick={() => { const next = options.slice(0, -1); if (!next.some((item) => item.isCorrect)) next[0] = { ...next[0]!, isCorrect: true }; setOptions(next); }}>Remover última</button><span>{options.length}/5 alternativas</span></div><label><span>Comentário (opcional)</span><textarea value={explanation} onChange={(e) => setExplanation(e.target.value)} rows={2} /></label><button className="admin-submit-button">Adicionar</button></form><div className="exam-admin-list exam-question-list">{questions.map((question) => <div key={question.id}><span><strong>{question.board?.name ?? "Banca não indicada"}</strong> · {question.text}</span><button type="button" onClick={() => void deleteExamQuestion(question.id).then(reload).catch((e: Error) => setMessage(e.message))}>Excluir</button></div>)}</div></>}
    </section>
  );
}
