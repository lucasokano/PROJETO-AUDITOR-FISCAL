import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
} from "react";

import { useStudy } from "../contexts/StudyContext";

import {
  createStatement,
  createStatementsBulk,
  deleteStatement,
  getAllStatements,
  updateStatement,
} from "../services/studyApi";

import type {
  BulkStatementItem,
  Statement,
} from "../types/study";

type FormMode =
  | "individual"
  | "bulk"
  | null;

type AnswerFilter =
  | "all"
  | "true"
  | "false";

interface BulkPreviewItem
  extends BulkStatementItem {
  lineNumber: number;
}

interface BulkPreviewError {
  lineNumber: number;
  message: string;
  content: string;
}

interface ParsedBulkInput {
  statements: BulkPreviewItem[];
  errors: BulkPreviewError[];
}

function getRequestError(
  error: unknown,
  fallback: string,
) {
  return error instanceof Error
    ? error.message
    : fallback;
}

function parseBulkText(
  content: string,
): ParsedBulkInput {
  const statements: BulkPreviewItem[] = [];
  const errors: BulkPreviewError[] = [];

  const lines = content.split(/\r?\n/);

  lines.forEach((originalLine, index) => {
    const lineNumber = index + 1;
    const line = originalLine.trim();

    if (!line) {
      return;
    }

    const separatorIndex =
      line.lastIndexOf("/");

    if (separatorIndex === -1) {
      errors.push({
        lineNumber,
        content: originalLine,
        message:
          "A linha deve terminar com / V ou / F.",
      });

      return;
    }

    const statementText = line
      .slice(0, separatorIndex)
      .trim();

    const answer = line
      .slice(separatorIndex + 1)
      .trim()
      .toUpperCase();

    if (statementText.length < 3) {
      errors.push({
        lineNumber,
        content: originalLine,
        message:
          "O enunciado deve possuir pelo menos 3 caracteres.",
      });

      return;
    }

    if (statementText.length > 2000) {
      errors.push({
        lineNumber,
        content: originalLine,
        message:
          "O enunciado deve possuir no máximo 2000 caracteres.",
      });

      return;
    }

    if (answer !== "V" && answer !== "F") {
      errors.push({
        lineNumber,
        content: originalLine,
        message:
          "A resposta deve ser V ou F.",
      });

      return;
    }

    statements.push({
      lineNumber,
      text: statementText,
      correctAnswer: answer === "V",
    });
  });

  return {
    statements,
    errors,
  };
}

export function AdminStatements() {
  const { disciplines, isLoading } =
    useStudy();

  const [statements, setStatements] =
    useState<Statement[]>([]);

  const [
    isLoadingStatements,
    setIsLoadingStatements,
  ] = useState(true);

  const [formMode, setFormMode] =
    useState<FormMode>(null);

  const [
    formDisciplineId,
    setFormDisciplineId,
  ] = useState("");

  const [formTopicId, setFormTopicId] =
    useState("");

  const [
    formSubtopicId,
    setFormSubtopicId,
  ] = useState("");

  const [text, setText] = useState("");

  const [
    correctAnswer,
    setCorrectAnswer,
  ] = useState(true);

  const [bulkText, setBulkText] =
    useState("");

  const [
    editingStatementId,
    setEditingStatementId,
  ] = useState<number | null>(null);

  const [isSaving, setIsSaving] =
    useState(false);

  const [
    deletingStatementId,
    setDeletingStatementId,
  ] = useState<number | null>(null);

  const [error, setError] = useState<
    string | null
  >(null);

  const [success, setSuccess] = useState<
    string | null
  >(null);

  const [search, setSearch] =
    useState("");

  const [
    filterDisciplineId,
    setFilterDisciplineId,
  ] = useState("");

  const [
    filterTopicId,
    setFilterTopicId,
  ] = useState("");

  const [
    filterSubtopicId,
    setFilterSubtopicId,
  ] = useState("");

  const [
    answerFilter,
    setAnswerFilter,
  ] = useState<AnswerFilter>("all");

  const selectedFormDiscipline =
    useMemo(
      () =>
        disciplines.find(
          (discipline) =>
            discipline.id ===
            Number(formDisciplineId),
        ),
      [disciplines, formDisciplineId],
    );

  const selectedFormTopic = useMemo(
    () =>
      selectedFormDiscipline?.topics.find(
        (topic) =>
          topic.id ===
          Number(formTopicId),
      ),
    [
      formTopicId,
      selectedFormDiscipline,
    ],
  );

  const selectedFilterDiscipline =
    useMemo(
      () =>
        disciplines.find(
          (discipline) =>
            discipline.id ===
            Number(filterDisciplineId),
        ),
      [
        disciplines,
        filterDisciplineId,
      ],
    );

  const selectedFilterTopic = useMemo(
    () =>
      selectedFilterDiscipline?.topics.find(
        (topic) =>
          topic.id ===
          Number(filterTopicId),
      ),
    [
      filterTopicId,
      selectedFilterDiscipline,
    ],
  );

  const bulkPreview = useMemo(
    () => parseBulkText(bulkText),
    [bulkText],
  );

  const filteredStatements =
    useMemo(() => {
      const normalizedSearch = search
        .trim()
        .toLocaleLowerCase("pt-BR");

      return statements.filter(
        (statement) => {
          const hierarchy =
            getStatementHierarchy(
              statement,
            );

          if (
            normalizedSearch &&
            !statement.text
              .toLocaleLowerCase("pt-BR")
              .includes(normalizedSearch)
          ) {
            return false;
          }

          if (
            filterDisciplineId &&
            hierarchy.disciplineId !==
              Number(filterDisciplineId)
          ) {
            return false;
          }

          if (
            filterTopicId &&
            hierarchy.topicId !==
              Number(filterTopicId)
          ) {
            return false;
          }

          if (
            filterSubtopicId &&
            statement.subtopicId !==
              Number(filterSubtopicId)
          ) {
            return false;
          }

          if (
            answerFilter === "true" &&
            !statement.correctAnswer
          ) {
            return false;
          }

          if (
            answerFilter === "false" &&
            statement.correctAnswer
          ) {
            return false;
          }

          return true;
        },
      );
    }, [
      answerFilter,
      filterDisciplineId,
      filterSubtopicId,
      filterTopicId,
      search,
      statements,
    ]);

  useEffect(() => {
    void loadStatements();
  }, []);

  function getStatementHierarchy(
    statement: Statement,
  ) {
    if (statement.subtopic) {
      return {
        disciplineId:
          statement.subtopic.topic
            .discipline.id,
        disciplineName:
          statement.subtopic.topic
            .discipline.name,
        topicId:
          statement.subtopic.topic.id,
        topicName:
          statement.subtopic.topic.name,
        subtopicId:
          statement.subtopic.id,
        subtopicName:
          statement.subtopic.name,
      };
    }

    for (const discipline of disciplines) {
      for (const topic of discipline.topics) {
        const subtopic =
          topic.subtopics.find(
            (item) =>
              item.id ===
              statement.subtopicId,
          );

        if (subtopic) {
          return {
            disciplineId: discipline.id,
            disciplineName:
              discipline.name,
            topicId: topic.id,
            topicName: topic.name,
            subtopicId: subtopic.id,
            subtopicName: subtopic.name,
          };
        }
      }
    }

    return {
      disciplineId: 0,
      disciplineName:
        "Disciplina não encontrada",
      topicId: 0,
      topicName: "Tópico não encontrado",
      subtopicId: statement.subtopicId,
      subtopicName:
        "Subtópico não encontrado",
    };
  }

  async function loadStatements() {
    try {
      setIsLoadingStatements(true);
      setError(null);

      const data =
        await getAllStatements();

      setStatements(data);
    } catch (requestError) {
      setError(
        getRequestError(
          requestError,
          "Erro ao carregar afirmações.",
        ),
      );
    } finally {
      setIsLoadingStatements(false);
    }
  }

  function clearMessages() {
    setError(null);
    setSuccess(null);
  }

  function resetForm() {
    setFormDisciplineId("");
    setFormTopicId("");
    setFormSubtopicId("");
    setText("");
    setCorrectAnswer(true);
    setBulkText("");
    setEditingStatementId(null);
  }

  function closeForm() {
    resetForm();
    setFormMode(null);
    clearMessages();
  }

  function openIndividualForm() {
    resetForm();
    clearMessages();
    setFormMode("individual");
  }

  function openBulkForm() {
    resetForm();
    clearMessages();
    setFormMode("bulk");
  }

  function handleFormDisciplineChange(
    value: string,
  ) {
    setFormDisciplineId(value);
    setFormTopicId("");
    setFormSubtopicId("");
  }

  function handleFormTopicChange(
    value: string,
  ) {
    setFormTopicId(value);
    setFormSubtopicId("");
  }

  function handleFilterDisciplineChange(
    value: string,
  ) {
    setFilterDisciplineId(value);
    setFilterTopicId("");
    setFilterSubtopicId("");
  }

  function handleFilterTopicChange(
    value: string,
  ) {
    setFilterTopicId(value);
    setFilterSubtopicId("");
  }

  function clearFilters() {
    setSearch("");
    setFilterDisciplineId("");
    setFilterTopicId("");
    setFilterSubtopicId("");
    setAnswerFilter("all");
  }

  function validateSelectedSubtopic() {
    const parsedSubtopicId =
      Number(formSubtopicId);

    if (
      !Number.isInteger(parsedSubtopicId) ||
      parsedSubtopicId <= 0
    ) {
      setError(
        "Selecione um subtópico.",
      );

      return null;
    }

    return parsedSubtopicId;
  }

  async function handleIndividualSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const parsedSubtopicId =
      validateSelectedSubtopic();

    if (!parsedSubtopicId) {
      return;
    }

    const normalizedText = text.trim();

    if (normalizedText.length < 3) {
      setError(
        "A afirmação deve possuir pelo menos 3 caracteres.",
      );

      return;
    }

    try {
      setIsSaving(true);
      clearMessages();

      if (editingStatementId) {
        await updateStatement(
          editingStatementId,
          {
            subtopicId:
              parsedSubtopicId,
            text: normalizedText,
            correctAnswer,
          },
        );

        setSuccess(
          "Afirmação atualizada com sucesso.",
        );
      } else {
        await createStatement({
          subtopicId:
            parsedSubtopicId,
          text: normalizedText,
          correctAnswer,
        });

        setSuccess(
          "Afirmação cadastrada com sucesso.",
        );
      }

      await loadStatements();

      resetForm();
      setFormMode(null);
    } catch (requestError) {
      setError(
        getRequestError(
          requestError,
          editingStatementId
            ? "Erro ao atualizar afirmação."
            : "Erro ao cadastrar afirmação.",
        ),
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleBulkSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const parsedSubtopicId =
      validateSelectedSubtopic();

    if (!parsedSubtopicId) {
      return;
    }

    if (
      bulkPreview.statements.length === 0
    ) {
      setError(
        "Informe pelo menos uma afirmação válida.",
      );

      return;
    }

    if (bulkPreview.errors.length > 0) {
      setError(
        "Corrija as linhas inválidas antes de importar.",
      );

      return;
    }

    try {
      setIsSaving(true);
      clearMessages();

      await createStatementsBulk({
        subtopicId: parsedSubtopicId,
        statements:
          bulkPreview.statements.map(
            (statement) => ({
              text: statement.text,
              correctAnswer:
                statement.correctAnswer,
            }),
          ),
      });

      const createdCount =
        bulkPreview.statements.length;

      await loadStatements();

      resetForm();
      setFormMode(null);

      setSuccess(
        `${createdCount} afirmação${
          createdCount === 1 ? "" : "ões"
        } cadastrada${
          createdCount === 1 ? "" : "s"
        } com sucesso.`,
      );
    } catch (requestError) {
      setError(
        getRequestError(
          requestError,
          "Erro ao importar afirmações.",
        ),
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleTxtFile(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file =
      event.target.files?.[0];

    event.target.value = "";

    if (!file) {
      return;
    }

    if (
      !file.name
        .toLocaleLowerCase()
        .endsWith(".txt")
    ) {
      setError(
        "Selecione um arquivo com extensão .txt.",
      );

      return;
    }

    try {
      const content = await file.text();

      setBulkText(content);
      clearMessages();
    } catch {
      setError(
        "Não foi possível ler o arquivo.",
      );
    }
  }

  function handleEditStatement(
    statement: Statement,
  ) {
    const hierarchy =
      getStatementHierarchy(statement);

    setFormDisciplineId(
      String(hierarchy.disciplineId),
    );

    setFormTopicId(
      String(hierarchy.topicId),
    );

    setFormSubtopicId(
      String(statement.subtopicId),
    );

    setText(statement.text);

    setCorrectAnswer(
      statement.correctAnswer,
    );

    setEditingStatementId(statement.id);
    setFormMode("individual");
    clearMessages();

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function handleDeleteStatement(
    statement: Statement,
  ) {
    const confirmed = window.confirm(
      "Excluir esta afirmação? Esta ação não poderá ser desfeita.",
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingStatementId(
        statement.id,
      );

      clearMessages();

      await deleteStatement(statement.id);

      setStatements((current) =>
        current.filter(
          (item) =>
            item.id !== statement.id,
        ),
      );

      setSuccess(
        "Afirmação excluída com sucesso.",
      );
    } catch (requestError) {
      setError(
        getRequestError(
          requestError,
          "Erro ao excluir afirmação.",
        ),
      );
    } finally {
      setDeletingStatementId(null);
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
    <section className="page admin-page statements-page">
      <header className="statements-header">
        <div>         
          <h2>Gerenciar afirmações</h2>         
        </div>

        <div className="statements-header-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={openIndividualForm}
          >
            Nova afirmação
          </button>

          <button
            type="button"
            className="admin-submit-button"
            onClick={openBulkForm}
          >
            Importar em bloco
          </button>
        </div>
      </header>

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

      {formMode && (
        <section className={`statement-editor ${formMode === "bulk" ? "statement-editor-modal" : ""}`}>
          <div className="statement-editor-header">
            <div>
              <h3>
                {formMode === "bulk"
                  ? "Importar afirmações"
                  : editingStatementId
                    ? "Editar afirmação"
                    : "Nova afirmação"}
              </h3>

              <p>
                {formMode === "bulk"
                  ? "Todas as linhas serão cadastradas no mesmo subtópico."
                  : "Selecione a classificação e informe a resposta correta."}
              </p>
            </div>

            <button
              type="button"
              className="icon-button"
              onClick={closeForm}
              aria-label="Fechar formulário"
            >
              ×
            </button>
          </div>

          <form
            className="admin-form"
            onSubmit={
              formMode === "bulk"
                ? handleBulkSubmit
                : handleIndividualSubmit
            }
          >
            <div className="admin-form-grid">
              <label className="form-field">
                <span>Disciplina</span>

                <select
                  value={
                    formDisciplineId
                  }
                  onChange={(event) =>
                    handleFormDisciplineChange(
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
                  value={formTopicId}
                  onChange={(event) =>
                    handleFormTopicChange(
                      event.target.value,
                    )
                  }
                  disabled={
                    !selectedFormDiscipline
                  }
                  required
                >
                  <option value="">
                    Selecione um tópico
                  </option>

                  {selectedFormDiscipline?.topics.map(
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
                  value={formSubtopicId}
                  onChange={(event) =>
                    setFormSubtopicId(
                      event.target.value,
                    )
                  }
                  disabled={
                    !selectedFormTopic
                  }
                  required
                >
                  <option value="">
                    Selecione um subtópico
                  </option>

                  {selectedFormTopic?.subtopics.map(
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

            {formMode === "individual" ? (
              <>
                <label className="form-field">
                  <span>Afirmação</span>

                  <textarea
                    value={text}
                    onChange={(event) =>
                      setText(
                        event.target.value,
                      )
                    }
                    placeholder="Digite a afirmação..."
                    rows={5}
                    maxLength={2000}
                    required
                  />

                  <small>
                    {text.length}/2000
                    caracteres
                  </small>
                </label>

                <fieldset className="answer-fieldset">
                  <legend>
                    Resposta correta
                  </legend>

                  <label className="answer-radio">
                    <input
                      type="radio"
                      name="correctAnswer"
                      checked={
                        correctAnswer
                      }
                      onChange={() =>
                        setCorrectAnswer(
                          true,
                        )
                      }
                    />

                    <span>Verdadeiro</span>
                  </label>

                  <label className="answer-radio">
                    <input
                      type="radio"
                      name="correctAnswer"
                      checked={
                        !correctAnswer
                      }
                      onChange={() =>
                        setCorrectAnswer(
                          false,
                        )
                      }
                    />

                    <span>Falso</span>
                  </label>
                </fieldset>
              </>
            ) : (
              <>
                <div className="bulk-instructions">
                  <strong>
                    Formato de cada linha:
                  </strong>

                  <code>
                    Enunciado / V
                  </code>

                  <code>
                    Enunciado / F
                  </code>
                </div>

                <label className="txt-file-input">
                  <span>
                    Carregar arquivo .txt
                  </span>

                  <input
                    type="file"
                    accept=".txt,text/plain"
                    onChange={
                      handleTxtFile
                    }
                  />
                </label>

                <label className="form-field">
                  <span>
                    Afirmações em bloco
                  </span>

                  <textarea
                    value={bulkText}
                    onChange={(event) =>
                      setBulkText(
                        event.target.value,
                      )
                    }
                    placeholder={
                      "A Constituição é a norma superior do ordenamento / V\nTodo crime admite tentativa / F"
                    }
                    rows={12}
                    required
                  />
                </label>

                <div className="bulk-summary">
                  <span className="bulk-valid-count">
                    {
                      bulkPreview.statements
                        .length
                    }{" "}
                    válida
                    {bulkPreview.statements
                      .length === 1
                      ? ""
                      : "s"}
                  </span>

                  <span
                    className={
                      bulkPreview.errors
                        .length > 0
                        ? "bulk-error-count"
                        : ""
                    }
                  >
                    {
                      bulkPreview.errors
                        .length
                    }{" "}
                    inválida
                    {bulkPreview.errors
                      .length === 1
                      ? ""
                      : "s"}
                  </span>
                </div>

                {bulkPreview.errors.length >
                  0 && (
                  <div className="bulk-errors">
                    <h4>
                      Linhas com erro
                    </h4>

                    {bulkPreview.errors.map(
                      (item) => (
                        <div
                          key={
                            item.lineNumber
                          }
                          className="bulk-error-item"
                        >
                          <strong>
                            Linha{" "}
                            {item.lineNumber}:
                          </strong>

                          <span>
                            {item.message}
                          </span>

                          <small>
                            {item.content}
                          </small>
                        </div>
                      ),
                    )}
                  </div>
                )}

                {bulkPreview.statements
                  .length > 0 && (
                  <div className="bulk-preview">
                    <h4>
                      Prévia da importação
                    </h4>

                    {bulkPreview.statements.map(
                      (item) => (
                        <article
                          key={
                            item.lineNumber
                          }
                          className="bulk-preview-item"
                        >
                          <span
                            className={
                              item.correctAnswer
                                ? "answer-badge answer-true"
                                : "answer-badge answer-false"
                            }
                          >
                            {item.correctAnswer
                              ? "V"
                              : "F"}
                          </span>

                          <p>
                            {item.text}
                          </p>
                        </article>
                      ),
                    )}
                  </div>
                )}
              </>
            )}

            <div className="statement-form-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={closeForm}
                disabled={isSaving}
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="admin-submit-button"
                disabled={
                  isSaving ||
                  (formMode === "bulk" &&
                    (bulkPreview
                      .statements.length ===
                      0 ||
                      bulkPreview.errors
                        .length > 0))
                }
              >
                {isSaving
                  ? "Salvando..."
                  : formMode === "bulk"
                    ? `Importar ${bulkPreview.statements.length} afirmações`
                    : editingStatementId
                      ? "Salvar alterações"
                      : "Salvar afirmação"}
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="statement-filters">
        <div className="statement-search">
          <label className="form-field">
            <span>Pesquisar</span>

            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value,
                )
              }
              placeholder="Buscar pelo texto da afirmação..."
            />
          </label>
        </div>

        <div className="statement-filter-grid">
          <label className="form-field">
            <span>Disciplina</span>

            <select
              value={filterDisciplineId}
              onChange={(event) =>
                handleFilterDisciplineChange(
                  event.target.value,
                )
              }
            >
              <option value="">
                Todas
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
              value={filterTopicId}
              onChange={(event) =>
                handleFilterTopicChange(
                  event.target.value,
                )
              }
              disabled={
                !selectedFilterDiscipline
              }
            >
              <option value="">
                Todos
              </option>

              {selectedFilterDiscipline?.topics.map(
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
              value={filterSubtopicId}
              onChange={(event) =>
                setFilterSubtopicId(
                  event.target.value,
                )
              }
              disabled={
                !selectedFilterTopic
              }
            >
              <option value="">
                Todos
              </option>

              {selectedFilterTopic?.subtopics.map(
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

          <label className="form-field">
            <span>Resposta</span>

            <select
              value={answerFilter}
              onChange={(event) =>
                setAnswerFilter(
                  event.target
                    .value as AnswerFilter,
                )
              }
            >
              <option value="all">
                Todas
              </option>

              <option value="true">
                Verdadeiro
              </option>

              <option value="false">
                Falso
              </option>
            </select>
          </label>
        </div>

        <div className="statement-filter-footer">
          <span>
            {filteredStatements.length} de{" "}
            {statements.length} afirmações
          </span>

          <button
            type="button"
            className="text-button"
            onClick={clearFilters}
          >
            Limpar filtros
          </button>
        </div>
      </section>

      <section className="statement-list-section">
        {isLoadingStatements ? (
          <div className="statement-empty-state">
            Carregando afirmações...
          </div>
        ) : filteredStatements.length ===
          0 ? (
          <div className="statement-empty-state">
            <h3>
              Nenhuma afirmação encontrada
            </h3>

            <p>
              Ajuste os filtros ou cadastre
              uma nova afirmação.
            </p>
          </div>
        ) : (
          <div className="statement-list">
            {filteredStatements.map(
              (statement) => {
                const hierarchy =
                  getStatementHierarchy(
                    statement,
                  );

                return (
                  <article
                    key={statement.id}
                    className="statement-card"
                  >
                    <div className="statement-card-main">
                      <div className="statement-path">
                        <span>
                          {
                            hierarchy.disciplineName
                          }
                        </span>

                        <span>›</span>

                        <span>
                          {
                            hierarchy.topicName
                          }
                        </span>

                        <span>›</span>

                        <strong>
                          {
                            hierarchy.subtopicName
                          }
                        </strong>
                      </div>

                      <p className="statement-text">
                        {statement.text}
                      </p>
                    </div>

                    <div className="statement-card-side">
                      <span
                        className={
                          statement.correctAnswer
                            ? "answer-badge answer-true"
                            : "answer-badge answer-false"
                        }
                      >
                        {statement.correctAnswer
                          ? "Verdadeiro"
                          : "Falso"}
                      </span>

                      <div className="statement-card-actions">
                        <button
                          type="button"
                          className="text-button"
                          onClick={() =>
                            handleEditStatement(
                              statement,
                            )
                          }
                        >
                          Editar
                        </button>

                        <button
                          type="button"
                          className="danger-text-button"
                          disabled={
                            deletingStatementId ===
                            statement.id
                          }
                          onClick={() =>
                            void handleDeleteStatement(
                              statement,
                            )
                          }
                        >
                          {deletingStatementId ===
                          statement.id
                            ? "Excluindo..."
                            : "Excluir"}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              },
            )}
          </div>
        )}
      </section>
    </section>
  );
}
