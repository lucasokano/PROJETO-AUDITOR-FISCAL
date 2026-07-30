import {
  useMemo,
  useState,
  type FormEvent,
} from "react";

import { useStudy } from "../contexts/StudyContext";

import {
  createDiscipline,
  createSubtopic,
  createTopic,
} from "../services/studyApi";

type FormMessage = {
  type: "success" | "error";
  text: string;
};

export function AdminStructure() {
  const {
    disciplines,
    reloadStructure,
  } = useStudy();

  const [
    disciplineName,
    setDisciplineName,
  ] = useState("");

  const [topicName, setTopicName] =
    useState("");

  const [
    subtopicName,
    setSubtopicName,
  ] = useState("");

  const [
    selectedDisciplineId,
    setSelectedDisciplineId,
  ] = useState("");

  const [
    subtopicDisciplineId,
    setSubtopicDisciplineId,
  ] = useState("");

  const [
    selectedTopicId,
    setSelectedTopicId,
  ] = useState("");

  const [isSaving, setIsSaving] =
    useState(false);

  const [message, setMessage] =
    useState<FormMessage | null>(null);

  const selectedSubtopicDiscipline =
    useMemo(
      () =>
        disciplines.find(
          (discipline) =>
            discipline.id ===
            Number(subtopicDisciplineId),
        ),
      [
        disciplines,
        subtopicDisciplineId,
      ],
    );

  function showError(error: unknown) {
    setMessage({
      type: "error",
      text:
        error instanceof Error
          ? error.message
          : "Não foi possível salvar.",
    });
  }

  async function handleDisciplineSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    try {
      setIsSaving(true);
      setMessage(null);

      await createDiscipline({
        name: disciplineName,
      });

      await reloadStructure();

      setDisciplineName("");

      setMessage({
        type: "success",
        text:
          "Disciplina cadastrada com sucesso.",
      });
    } catch (error) {
      showError(error);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleTopicSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const disciplineId = Number(
      selectedDisciplineId,
    );

    if (!disciplineId) {
      setMessage({
        type: "error",
        text: "Selecione uma disciplina.",
      });

      return;
    }

    try {
      setIsSaving(true);
      setMessage(null);

      await createTopic({
        disciplineId,
        name: topicName,
      });

      await reloadStructure();

      setTopicName("");

      setMessage({
        type: "success",
        text:
          "Tópico cadastrado com sucesso.",
      });
    } catch (error) {
      showError(error);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSubtopicSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const topicId = Number(
      selectedTopicId,
    );

    if (!topicId) {
      setMessage({
        type: "error",
        text: "Selecione um tópico.",
      });

      return;
    }

    try {
      setIsSaving(true);
      setMessage(null);

      await createSubtopic({
        topicId,
        name: subtopicName,
      });

      await reloadStructure();

      setSubtopicName("");

      setMessage({
        type: "success",
        text:
          "Subtópico cadastrado com sucesso.",
      });
    } catch (error) {
      showError(error);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="page admin-page">
      <div className="admin-page-heading">
        <div>
          <span className="admin-eyebrow">
            Administração
          </span>

          <h2>Estrutura de estudos</h2>

          <p>
            Cadastre disciplinas, tópicos e
            subtópicos.
          </p>
        </div>
      </div>

      {message && (
        <div
          className={`form-message ${
            message.type === "success"
              ? "form-success"
              : "form-error"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="structure-admin-grid">
        <form
          className="structure-admin-card"
          onSubmit={
            handleDisciplineSubmit
          }
        >
          <span className="admin-card-number">
            1
          </span>

          <h3>Nova disciplina</h3>

          <p>
            Crie o nível principal da
            organização.
          </p>

          <label className="form-field">
            <span>Nome</span>

            <input
              value={disciplineName}
              onChange={(event) =>
                setDisciplineName(
                  event.target.value,
                )
              }
              placeholder="Ex.: Direito Tributário"
              maxLength={120}
              required
            />
          </label>

          <button
            className="admin-submit-button"
            disabled={isSaving}
          >
            Criar disciplina
          </button>
        </form>

        <form
          className="structure-admin-card"
          onSubmit={handleTopicSubmit}
        >
          <span className="admin-card-number">
            2
          </span>

          <h3>Novo tópico</h3>

          <p>
            Vincule o tópico a uma
            disciplina existente.
          </p>

          <label className="form-field">
            <span>Disciplina</span>

            <select
              value={selectedDisciplineId}
              onChange={(event) =>
                setSelectedDisciplineId(
                  event.target.value,
                )
              }
              required
            >
              <option value="">
                Selecione
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
            <span>Nome</span>

            <input
              value={topicName}
              onChange={(event) =>
                setTopicName(
                  event.target.value,
                )
              }
              placeholder="Ex.: Sistema Tributário"
              maxLength={120}
              required
            />
          </label>

          <button
            className="admin-submit-button"
            disabled={isSaving}
          >
            Criar tópico
          </button>
        </form>

        <form
          className="structure-admin-card"
          onSubmit={
            handleSubtopicSubmit
          }
        >
          <span className="admin-card-number">
            3
          </span>

          <h3>Novo subtópico</h3>

          <p>
            Vincule o subtópico a um
            tópico existente.
          </p>

          <label className="form-field">
            <span>Disciplina</span>

            <select
              value={subtopicDisciplineId}
              onChange={(event) => {
                setSubtopicDisciplineId(
                  event.target.value,
                );

                setSelectedTopicId("");
              }}
              required
            >
              <option value="">
                Selecione
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
              value={selectedTopicId}
              onChange={(event) =>
                setSelectedTopicId(
                  event.target.value,
                )
              }
              disabled={
                !selectedSubtopicDiscipline
              }
              required
            >
              <option value="">
                Selecione
              </option>

              {selectedSubtopicDiscipline
                ?.topics.map((topic) => (
                  <option
                    key={topic.id}
                    value={topic.id}
                  >
                    {topic.name}
                  </option>
                ))}
            </select>
          </label>

          <label className="form-field">
            <span>Nome</span>

            <input
              value={subtopicName}
              onChange={(event) =>
                setSubtopicName(
                  event.target.value,
                )
              }
              placeholder="Ex.: Imunidades tributárias"
              maxLength={120}
              required
            />
          </label>

          <button
            className="admin-submit-button"
            disabled={isSaving}
          >
            Criar subtópico
          </button>
        </form>
      </div>
    </section>
  );
}