import {
  useMemo,
  useState,
  type FormEvent,
} from "react";

import { StudyStructureManager } from "../components/admin/DisciplineManager";
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

type StructureTab =
  | "discipline"
  | "topic"
  | "subtopic"
  | "edit";

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

  const [activeTab, setActiveTab] =
    useState<StructureTab>("discipline");

  const selectedSubtopicDiscipline =
    useMemo(
      () =>
        disciplines.find(
          (discipline) =>
            discipline.id ===
            Number(
              subtopicDisciplineId,
            ),
        ),
      [
        disciplines,
        subtopicDisciplineId,
      ],
    );

  function showMessage(
    type: "success" | "error",
    text: string,
  ) {
    setMessage({
      type,
      text,
    });
  }

  function showError(error: unknown) {
    showMessage(
      "error",
      error instanceof Error
        ? error.message
        : "Não foi possível salvar.",
    );
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

      showMessage(
        "success",
        "Disciplina cadastrada.",
      );
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
      showMessage(
        "error",
        "Selecione uma disciplina.",
      );

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

      showMessage(
        "success",
        "Tópico cadastrado.",
      );
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
      showMessage(
        "error",
        "Selecione um tópico.",
      );

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

      showMessage(
        "success",
        "Subtópico cadastrado.",
      );
    } catch (error) {
      showError(error);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="admin-structure-page admin-tool-page">
      <header className="admin-structure-header admin-tool-heading">
        <span>Estrutura</span>

        <h1>Estrutura de conteúdo</h1>

        <p>
          Adicione conteúdo e organize a estrutura existente.
        </p>
      </header>

      <div className="structure-tabs" role="tablist" aria-label="Ações da estrutura">
        {([
          ["discipline", "Nova disciplina"],
          ["topic", "Novo tópico"],
          ["subtopic", "Novo subtópico"],
          ["edit", "Editar conteúdo"],
        ] as const).map(([tab, label]) => (
          <button
            type="button"
            role="tab"
            key={tab}
            aria-selected={activeTab === tab}
            className={activeTab === tab ? "structure-tab-active" : ""}
            onClick={() => {
              setActiveTab(tab);
              setMessage(null);
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {message && (
        <div
          className={`admin-message ${
            message.type === "success"
              ? "admin-message-success"
              : "admin-message-error"
          }`}
        >
          {message.text}
        </div>
      )}

      {activeTab !== "edit" && (
      <div className="admin-create-grid">
        {activeTab === "discipline" && (
        <form
          className="admin-create-card admin-create-discipline"
          onSubmit={
            handleDisciplineSubmit
          }
        >
          <div className="admin-create-number">
            1
          </div>

          <h2>Nova disciplina</h2>

          <label>
            <span>Nome</span>

            <input
              value={disciplineName}
              onChange={(event) =>
                setDisciplineName(
                  event.target.value,
                )
              }
              placeholder="Ex.: Direito Penal"
              required
              maxLength={120}
            />
          </label>

          <button
            type="submit"
            disabled={isSaving}
          >
            Adicionar
          </button>
        </form>
        )}

        {activeTab === "topic" && (
        <form
          className="admin-create-card admin-create-topic"
          onSubmit={handleTopicSubmit}
        >
          <div className="admin-create-number">
            2
          </div>

          <h2>Novo tópico</h2>

          <label>
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

          <label>
            <span>Nome</span>

            <input
              value={topicName}
              onChange={(event) =>
                setTopicName(
                  event.target.value,
                )
              }
              placeholder="Ex.: Crimes contra a pessoa"
              required
              maxLength={120}
            />
          </label>

          <button
            type="submit"
            disabled={isSaving}
          >
            Adicionar
          </button>
        </form>
        )}

        {activeTab === "subtopic" && (
        <form
          className="admin-create-card admin-create-subtopic"
          onSubmit={
            handleSubtopicSubmit
          }
        >
          <div className="admin-create-number">
            3
          </div>

          <h2>Novo subtópico</h2>

          <label>
            <span>Disciplina</span>

            <select
              value={
                subtopicDisciplineId
              }
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

          <label>
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

          <label>
            <span>Nome</span>

            <input
              value={subtopicName}
              onChange={(event) =>
                setSubtopicName(
                  event.target.value,
                )
              }
              placeholder="Ex.: Homicídio"
              required
              maxLength={120}
            />
          </label>

          <button
            type="submit"
            disabled={isSaving}
          >
            Adicionar
          </button>
        </form>
        )}
      </div>
      )}

      {activeTab === "edit" && (
        <StudyStructureManager
          onMessage={showMessage}
        />
      )}
    </section>
  );
}
