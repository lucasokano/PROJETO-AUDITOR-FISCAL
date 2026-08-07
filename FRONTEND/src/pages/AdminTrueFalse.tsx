import { useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { useStudy } from "../contexts/StudyContext";
import { createStatement, createStatementsBulk } from "../services/studyApi";

type Mode = "single" | "bulk";

function parseBulk(content: string) {
  const valid: Array<{ text: string; correctAnswer: boolean }> = [];
  const errors: number[] = [];
  content.split(/\r?\n/).forEach((source, index) => {
    const line = source.trim();
    if (!line) return;
    const match = line.match(/^(.*?)\s*\/\s*([vVfF])$/);
    if (!match || !match[1]?.trim()) { errors.push(index + 1); return; }
    valid.push({ text: match[1].trim(), correctAnswer: match[2]?.toUpperCase() === "V" });
  });
  return { valid, errors };
}

export function AdminTrueFalse() {
  const { disciplines } = useStudy();
  const [mode, setMode] = useState<Mode>("single");
  const [disciplineId, setDisciplineId] = useState("");
  const [topicId, setTopicId] = useState("");
  const [subtopicId, setSubtopicId] = useState("");
  const [text, setText] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState(true);
  const [bulkText, setBulkText] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const discipline = disciplines.find((item) => item.id === Number(disciplineId));
  const topic = discipline?.topics.find((item) => item.id === Number(topicId));
  const preview = useMemo(() => parseBulk(bulkText), [bulkText]);

  function changeMode(nextMode: Mode) { setMode(nextMode); setMessage(null); }
  function getSubtopicId() {
    const id = Number(subtopicId);
    if (!id) { setMessage({ type: "error", text: "Selecione um subtópico." }); return null; }
    return id;
  }

  async function submitSingle(event: FormEvent) {
    event.preventDefault();
    const id = getSubtopicId(); if (!id) return;
    try {
      setIsSaving(true); setMessage(null);
      await createStatement({ subtopicId: id, text, correctAnswer });
      setText(""); setMessage({ type: "success", text: "Afirmação adicionada." });
    } catch (error) { setMessage({ type: "error", text: (error as Error).message }); }
    finally { setIsSaving(false); }
  }

  async function submitBulk(event: FormEvent) {
    event.preventDefault();
    const id = getSubtopicId(); if (!id) return;
    if (!preview.valid.length || preview.errors.length) {
      setMessage({ type: "error", text: preview.errors.length ? "Corrija as linhas inválidas antes de adicionar." : "Informe pelo menos uma afirmação." }); return;
    }
    try {
      setIsSaving(true); setMessage(null);
      await createStatementsBulk({ subtopicId: id, statements: preview.valid });
      setBulkText(""); setMessage({ type: "success", text: `${preview.valid.length} afirmações adicionadas.` });
    } catch (error) { setMessage({ type: "error", text: (error as Error).message }); }
    finally { setIsSaving(false); }
  }

  async function loadFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) setBulkText(await file.text());
    event.target.value = "";
  }

  return (
    <section className="page admin-tool-page true-false-page">
      <header className="admin-tool-heading"><div><span className="admin-form-eyebrow">Afirmações</span><h1>Adicionar V/F</h1><p>Cadastre uma afirmação ou importe várias no mesmo subtópico.</p></div></header>

      <div className="structure-tabs true-false-tabs" role="tablist">
        <button type="button" className={mode === "single" ? "structure-tab-active" : ""} onClick={() => changeMode("single")}>Adicionar unitária</button>
        <button type="button" className={mode === "bulk" ? "structure-tab-active" : ""} onClick={() => changeMode("bulk")}>Adicionar em bloco</button>
      </div>

      {message && <div className={`form-message ${message.type === "success" ? "form-success" : "form-error"}`}>{message.text}</div>}

      <section className="statement-editor true-false-editor">
        <form className="admin-form" onSubmit={mode === "single" ? submitSingle : submitBulk}>
          <div className="true-false-context">
            <label className="form-field"><span>Disciplina</span><select value={disciplineId} onChange={(event) => { setDisciplineId(event.target.value); setTopicId(""); setSubtopicId(""); }} required><option value="">Selecione</option>{disciplines.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
            <label className="form-field"><span>Tópico</span><select value={topicId} onChange={(event) => { setTopicId(event.target.value); setSubtopicId(""); }} disabled={!discipline} required><option value="">Selecione</option>{discipline?.topics.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
            <label className="form-field"><span>Subtópico</span><select value={subtopicId} onChange={(event) => setSubtopicId(event.target.value)} disabled={!topic} required><option value="">Selecione</option>{topic?.subtopics.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
          </div>

          {mode === "single" ? <>
            <label className="form-field"><span>Afirmação</span><textarea value={text} onChange={(event) => setText(event.target.value)} rows={5} maxLength={2000} required placeholder="Digite o enunciado" /></label>
            <fieldset className="true-false-answer"><legend>Gabarito</legend><label><input type="radio" checked={correctAnswer} onChange={() => setCorrectAnswer(true)} /> Verdadeiro</label><label><input type="radio" checked={!correctAnswer} onChange={() => setCorrectAnswer(false)} /> Falso</label></fieldset>
          </> : <>
            <div className="true-false-bulk-help"><span>Uma afirmação por linha, terminando em</span><code>/ V</code><code>/ F</code><label>Carregar .txt<input type="file" accept=".txt,text/plain" onChange={(event) => void loadFile(event)} /></label></div>
            <label className="form-field"><span>Afirmações</span><textarea value={bulkText} onChange={(event) => setBulkText(event.target.value)} rows={12} required placeholder={"A Constituição é a norma superior / V\nTodo crime admite tentativa / F"} /></label>
            <div className="true-false-bulk-status"><span>{preview.valid.length} válidas</span><span className={preview.errors.length ? "has-errors" : ""}>{preview.errors.length} inválidas</span>{preview.errors.length > 0 && <small>Linhas: {preview.errors.join(", ")}</small>}</div>
          </>}

          <button type="submit" className="admin-submit-button" disabled={isSaving}>{isSaving ? "Adicionando..." : "Adicionar"}</button>
        </form>
      </section>
    </section>
  );
}
