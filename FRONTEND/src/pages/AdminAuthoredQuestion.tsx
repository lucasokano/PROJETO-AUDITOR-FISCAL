import { useState, type FormEvent } from "react";
import { useStudy } from "../contexts/StudyContext";
import { createClozeQuestion, createConceptQuestion } from "../services/authoredQuestionApi";
import type { AuthoredQuestionKind } from "../types/authoredQuestion";

export function AdminAuthoredQuestion({ kind }: { kind: AuthoredQuestionKind }) {
  const { disciplines } = useStudy();
  const [disciplineId, setDisciplineId] = useState("");
  const [topicId, setTopicId] = useState("");
  const [subtopicId, setSubtopicId] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [clozeText, setClozeText] = useState("");
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

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
        await createClozeQuestion({ subtopicId: Number(subtopicId), textWithAnswers: clozeText });
        setClozeText("");
      }
      setMessage("Questão adicionada com sucesso.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Não foi possível adicionar a questão.");
    } finally { setIsSaving(false); }
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
      <form className="exam-question-form authored-question-form" onSubmit={submit}>
        <div className="exam-question-context">
          <label><span>Disciplina</span><select value={disciplineId} onChange={(event) => { setDisciplineId(event.target.value); setTopicId(""); setSubtopicId(""); }} required><option value="">Selecione</option>{disciplines.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
          <label><span>Tópico</span><select value={topicId} onChange={(event) => { setTopicId(event.target.value); setSubtopicId(""); }} required disabled={!discipline}><option value="">Selecione</option>{discipline?.topics.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
          <label><span>Subtópico</span><select value={subtopicId} onChange={(event) => setSubtopicId(event.target.value)} required disabled={!topic}><option value="">Selecione</option>{topic?.subtopics.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
        </div>

        {isConceptual ? <>
          <label><span>Pergunta</span><textarea rows={4} value={question} onChange={(event) => setQuestion(event.target.value)} required /></label>
          <label><span>Resposta / gabarito</span><textarea rows={4} value={answer} onChange={(event) => setAnswer(event.target.value)} required /></label>
        </> : <label><span>Texto com gabarito nas lacunas</span><textarea rows={7} value={clozeText} onChange={(event) => setClozeText(event.target.value)} placeholder="O poder de {{polícia}} limita direitos em benefício do {{interesse público}}." required /></label>}

        <button className="admin-submit-button" disabled={isSaving}>{isSaving ? "Adicionando..." : "Adicionar"}</button>
      </form>
    </section>
  );
}
