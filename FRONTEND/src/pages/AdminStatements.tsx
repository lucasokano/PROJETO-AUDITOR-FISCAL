import {
  useMemo,
  useState,
  type FormEvent,
} from "react";

import { useStudy } from "../contexts/StudyContext";
import { createStatement } from "../services/studyApi";

export function AdminStatements() {
  const { disciplines, isLoading } =
    useStudy();

  const [disciplineId, setDisciplineId] =
    useState("");

  const [topicId, setTopicId] =
    useState("");

  const [subtopicId, setSubtopicId] =
    useState("");

  const [text, setText] = useState("");

  const [
    correctAnswer,
    setCorrectAnswer,
  ] = useState(true);

  const [isSaving, setIsSaving] =
    useState(false);

  const [error, setError] = useState<
    string | null
  >(null);

  const [success, setSuccess] = useState<
    string | null
  >(null);

  const selectedDiscipline = useMemo(
    () =>
      disciplines.find(
        (discipline) =>
          discipline.id ===
          Number(disciplineId),
      ),
    [disciplineId, disciplines],
  );

  const selectedTopic = useMemo(
    () =>
      selectedDiscipline?.topics.find(
        (topic) =>
          topic.id === Number(topicId),
      ),
    [selectedDiscipline, topicId],
  );

  function handleDisciplineChange(
    value: string,
  ) {
    setDisciplineId(value);
    setTopicId("");
    setSubtopicId("");
  }

  function handleTopicChange(
    value: string,
  ) {
    setTopicId(value);
    setSubtopicId("");
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const parsedSubtopicId =
      Number(subtopicId);

    if (
      !Number.isInteger(parsedSubtopicId) ||
      parsedSubtopicId <= 0
    ) {
      setError(
        "Selecione um subtópico.",
      );

      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      setSuccess(null);

      await createStatement({
        subtopicId: parsedSubtopicId,
        text,
        correctAnswer,
      });

      setText("");

      setSuccess(
        "Afirmação cadastrada com sucesso.",
      );
    } catch (requestError) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : "Erro ao cadastrar afirmação.";

      setError(message);
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <section className="page">
        <h2>Carregando estrutura...</h2>
      </section>
    );
  }

  return (
    <section className="page admin-page">
      <div className="admin-page-heading">
        <div>
          <span className="admin-eyebrow">
            Administração
          </span>

          <h2>Cadastrar afirmação</h2>

          <p>
            Escolha onde a afirmação será
            armazenada e informe a resposta
            correta.
          </p>
        </div>
      </div>

      <form
        className="admin-form"
        onSubmit={handleSubmit}
      >
        <div className="admin-form-grid">
          <label className="form-field">
            <span>Disciplina</span>

            <select
              value={disciplineId}
              onChange={(event) =>
                handleDisciplineChange(
                  event.target.value,
                )
              }
              required
            >
              <option value="">
                Selecione uma disciplina
              </option>

              {disciplines.map(
                (discipline) => (
                  <option
                    key={discipline.id}
                    value={discipline.id}
                  >
                    {discipline.name}
                  </option>
                ),
              )}
            </select>
          </label>

          <label className="form-field">
            <span>Tópico</span>

            <select
              value={topicId}
              onChange={(event) =>
                handleTopicChange(
                  event.target.value,
                )
              }
              disabled={!selectedDiscipline}
              required
            >
              <option value="">
                Selecione um tópico
              </option>

              {selectedDiscipline?.topics.map(
                (topic) => (
                  <option
                    key={topic.id}
                    value={topic.id}
                  >
                    {topic.name}
                  </option>
                ),
              )}
            </select>
          </label>

          <label className="form-field">
            <span>Subtópico</span>

            <select
              value={subtopicId}
              onChange={(event) =>
                setSubtopicId(
                  event.target.value,
                )
              }
              disabled={!selectedTopic}
              required
            >
              <option value="">
                Selecione um subtópico
              </option>

              {selectedTopic?.subtopics.map(
                (subtopic) => (
                  <option
                    key={subtopic.id}
                    value={subtopic.id}
                  >
                    {subtopic.name}
                  </option>
                ),
              )}
            </select>
          </label>
        </div>

        <label className="form-field">
          <span>Afirmação</span>

          <textarea
            value={text}
            onChange={(event) =>
              setText(event.target.value)
            }
            placeholder="Digite a afirmação..."
            rows={5}
            maxLength={2000}
            required
          />

          <small>
            {text.length}/2000 caracteres
          </small>
        </label>

        <fieldset className="answer-fieldset">
          <legend>Resposta correta</legend>

          <label className="answer-radio">
            <input
              type="radio"
              name="correctAnswer"
              checked={correctAnswer}
              onChange={() =>
                setCorrectAnswer(true)
              }
            />

            <span>Verdadeiro</span>
          </label>

          <label className="answer-radio">
            <input
              type="radio"
              name="correctAnswer"
              checked={!correctAnswer}
              onChange={() =>
                setCorrectAnswer(false)
              }
            />

            <span>Falso</span>
          </label>
        </fieldset>

        {error && (
          <div className="form-message form-error">
            {error}
          </div>
        )}

        {success && (
          <div className="form-message form-success">
            {success}
          </div>
        )}

        <button
          type="submit"
          className="admin-submit-button"
          disabled={isSaving}
        >
          {isSaving
            ? "Salvando..."
            : "Salvar afirmação"}
        </button>
      </form>
    </section>
  );
}