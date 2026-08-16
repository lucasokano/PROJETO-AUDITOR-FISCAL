import { useState, type FormEvent } from "react";
import { useStudy } from "../contexts/StudyContext";
import { createClozeQuestion, createConceptQuestion, importClozeQuestions, previewClozeImport } from "../services/authoredQuestionApi";
import type { AuthoredQuestionKind, ClozeImportPreviewItem } from "../types/authoredQuestion";

export function AdminAuthoredQuestion({ kind }: { kind: AuthoredQuestionKind }) {
  const { disciplines, reloadStructure } = useStudy();
  const [disciplineId, setDisciplineId] = useState("");
  const [topicId, setTopicId] = useState("");
  const [subtopicId, setSubtopicId] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [clozeText, setClozeText] = useState("");
  const [isDifficult, setIsDifficult] = useState(false);
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [mode, setMode] = useState<"single" | "bulk">("single");
  const [bulkText, setBulkText] = useState("");
  const [createMissing, setCreateMissing] = useState(false);
  const [preview, setPreview] = useState<ClozeImportPreviewItem[] | null>(null);

  const discipline = disciplines.find((item) => item.id === Number(disciplineId));
  const topic = discipline?.topics.find((item) => item.id === Number(topicId));
  const isConceptual = kind === "conceptual";

  async function submit(event: FormEvent) {
    event.preventDefault();
    try {
      setIsSaving(true); setMessage("");
      if (isConceptual) {
        await createConceptQuestion({ subtopicId: Number(subtopicId), question, answer });
        setQuestion(""); setAnswer("");
      } else {
        await createClozeQuestion({ subtopicId: Number(subtopicId), textWithAnswers: clozeText, isDifficult });
        setClozeText(""); setIsDifficult(false);
      }
      setMessage("Questão adicionada com sucesso.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Não foi possível adicionar a questão.");
    } finally { setIsSaving(false); }
  }

  async function generatePreview(event: FormEvent) {
    event.preventDefault();
    try {
      setIsSaving(true); setMessage("");
      const result = await previewClozeImport({ disciplineId: Number(disciplineId), text: bulkText, createMissing });
      setPreview(result.items);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Não foi possível analisar o arquivo."); }
    finally { setIsSaving(false); }
  }

  async function confirmImport() {
    try {
      setIsSaving(true); setMessage("");
      const result = await importClozeQuestions({ disciplineId: Number(disciplineId), text: bulkText, createMissing });
      if (createMissing && result.created > 0) await reloadStructure();
      setPreview(result.items);
      setMessage(`${result.created} questão(ões) importada(s). ${result.failed} registro(s) ignorado(s).`);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Não foi possível importar o lote."); }
    finally { setIsSaving(false); }
  }

  return (
    <section className="page admin-tool-page authored-question-admin">
      <header className="admin-tool-heading">
        <div>
          <span>Questões autorais</span>
          <h1>{isConceptual ? "Adicionar conceitual" : "Adicionar lacuna"}</h1>
          <p>{isConceptual ? "Cadastre uma pergunta e o pequeno texto que será revelado como gabarito." : "Marque com {{chaves}} cada palavra ou trecho que deve ficar oculto."}</p>
        </div>
      </header>

      {message && <div className="form-message" role="status">{message}</div>}
      {!isConceptual && <div className="structure-tabs authored-import-tabs"><button type="button" className={mode === "single" ? "structure-tab-active" : ""} onClick={() => { setMode("single"); setPreview(null); }}>Questão unitária</button><button type="button" className={mode === "bulk" ? "structure-tab-active" : ""} onClick={() => setMode("bulk")}>Importar TXT</button></div>}
      {!isConceptual && mode === "bulk" ? <>
        <form className="exam-question-form authored-question-form cloze-import-form" onSubmit={generatePreview}>
          <label><span>Disciplina</span><select value={disciplineId} onChange={(event) => { setDisciplineId(event.target.value); setPreview(null); }} required><option value="">Selecione</option>{disciplines.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
          <label><span>Arquivo TXT</span><input type="file" accept=".txt,text/plain" onChange={(event) => { const file = event.target.files?.[0]; if (file) void file.text().then((text) => { setBulkText(text); setPreview(null); }); }} /></label>
          <label><span>Conteúdo</span><textarea rows={12} value={bulkText} onChange={(event) => { setBulkText(event.target.value); setPreview(null); }} placeholder={'[Tópico: Poder Legislativo]\n[Subtópico: Câmara dos Deputados]\nA Câmara é eleita pelo sistema {{proporcional}}.'} required /></label>
          <label className="cloze-import-create"><input type="checkbox" checked={createMissing} onChange={(event) => { setCreateMissing(event.target.checked); setPreview(null); }} /><span>Criar automaticamente tópicos e subtópicos ausentes</span></label>
          <button className="admin-submit-button" disabled={isSaving || !disciplineId || !bulkText.trim()}>{isSaving ? "Analisando..." : "Gerar preview"}</button>
        </form>
        {preview && <section className="cloze-import-preview"><header><div><span>Preview</span><strong>{preview.filter((item) => item.valid).length} válidas · {preview.filter((item) => !item.valid).length} inválidas</strong></div><button type="button" className="admin-submit-button" disabled={isSaving || !preview.some((item) => item.valid)} onClick={() => void confirmImport()}>Confirmar importação</button></header><div className="cloze-import-table">{preview.map((item) => <article key={`${item.line}-${item.text}`} className={item.valid ? "is-valid" : "is-invalid"}><div><span>Linha {item.line} · {item.topic || "Sem tópico"} / {item.subtopic || "Sem subtópico"}</span><p>{item.text}</p><small>Respostas: {item.answers.length ? item.answers.join(" · ") : "nenhuma"}</small>{(item.willCreateTopic || item.willCreateSubtopic) && <small>Será criada estrutura ausente.</small>}</div><strong>{item.valid ? "Válida" : item.message}</strong></article>)}</div></section>}
      </> :
      <form className="exam-question-form authored-question-form" onSubmit={submit}>
        <div className="exam-question-context">
          <label><span>Disciplina</span><select value={disciplineId} onChange={(event) => { setDisciplineId(event.target.value); setTopicId(""); setSubtopicId(""); }} required><option value="">Selecione</option>{disciplines.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
          <label><span>Tópico</span><select value={topicId} onChange={(event) => { setTopicId(event.target.value); setSubtopicId(""); }} required disabled={!discipline}><option value="">Selecione</option>{discipline?.topics.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
          <label><span>Subtópico</span><select value={subtopicId} onChange={(event) => setSubtopicId(event.target.value)} required disabled={!topic}><option value="">Selecione</option>{topic?.subtopics.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
        </div>

        {isConceptual ? <>
          <label><span>Pergunta</span><textarea rows={4} value={question} onChange={(event) => setQuestion(event.target.value)} required /></label>
          <label><span>Resposta / gabarito</span><textarea rows={4} value={answer} onChange={(event) => setAnswer(event.target.value)} required /></label>
        </> : <><label><span>Texto com gabarito nas lacunas</span><textarea rows={7} value={clozeText} onChange={(event) => setClozeText(event.target.value)} placeholder="O poder de {{polícia}} limita direitos em benefício do {{interesse público}}." required /></label><label><span>Dificuldade</span><select value={isDifficult ? "difficult" : "easy"} onChange={(event) => setIsDifficult(event.target.value === "difficult")}><option value="easy">Fácil</option><option value="difficult">Difícil</option></select></label></>}

        <button className="admin-submit-button" disabled={isSaving}>{isSaving ? "Adicionando..." : "Adicionar"}</button>
      </form>
      }
    </section>
  );
}
