import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  FileText,
  Folder,
  Pencil,
  Save,
  Trash2,
  X,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

import {
  useState,
  type FormEvent,
} from "react";

import { useStudy } from "../../contexts/StudyContext";

import {
  deleteDiscipline,
  deleteSubtopic,
  deleteTopic,
  updateDiscipline,
  updateSubtopic,
  updateTopic,
  reorderTopics,
  reorderSubtopics,
} from "../../services/studyApi";

type ItemType =
  | "discipline"
  | "topic"
  | "subtopic";

interface EditingItem {
  type: ItemType;
  id: number;
  name: string;
}

interface Props {
  onMessage: (
    type: "success" | "error",
    text: string,
  ) => void;
}

export function StudyStructureManager({
  onMessage,
}: Props) {
  const {
    disciplines,
    reloadStructure,
  } = useStudy();

  const [
    openDisciplines,
    setOpenDisciplines,
  ] = useState<Set<number>>(new Set());

  const [openTopics, setOpenTopics] =
    useState<Set<number>>(new Set());

  const [editing, setEditing] =
    useState<EditingItem | null>(null);

  const [isSaving, setIsSaving] =
    useState(false);

  function toggleSet(
    setter: React.Dispatch<
      React.SetStateAction<Set<number>>
    >,
    id: number,
  ) {
    setter((current) => {
      const updated = new Set(current);

      if (updated.has(id)) {
        updated.delete(id);
      } else {
        updated.add(id);
      }

      return updated;
    });
  }

  function beginEditing(
    type: ItemType,
    id: number,
    name: string,
  ) {
    setEditing({
      type,
      id,
      name,
    });
  }

  function cancelEditing() {
    setEditing(null);
  }

  async function handleSave(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!editing) {
      return;
    }

    try {
      setIsSaving(true);

      if (
        editing.type === "discipline"
      ) {
        await updateDiscipline(
          editing.id,
          editing.name,
        );
      }

      if (editing.type === "topic") {
        await updateTopic(
          editing.id,
          editing.name,
        );
      }

      if (
        editing.type === "subtopic"
      ) {
        await updateSubtopic(
          editing.id,
          editing.name,
        );
      }

      await reloadStructure();

      setEditing(null);

      onMessage(
        "success",
        "Item atualizado com sucesso.",
      );
    } catch (error) {
      onMessage(
        "error",
        error instanceof Error
          ? error.message
          : "Não foi possível atualizar o item.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(
    type: ItemType,
    id: number,
    name: string,
  ) {
    const confirmed = window.confirm(
      `Excluir "${name}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setIsSaving(true);

      if (type === "discipline") {
        await deleteDiscipline(id);
      }

      if (type === "topic") {
        await deleteTopic(id);
      }

      if (type === "subtopic") {
        await deleteSubtopic(id);
      }

      await reloadStructure();

      onMessage(
        "success",
        "Item excluído com sucesso.",
      );
    } catch (error) {
      onMessage(
        "error",
        error instanceof Error
          ? error.message
          : "Não foi possível excluir o item.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function moveItem(
    kind: "topic" | "subtopic",
    parentId: number,
    ids: number[],
    index: number,
    direction: -1 | 1,
  ) {
    const target = index + direction;
    if (target < 0 || target >= ids.length) return;
    const ordered = [...ids];
    [ordered[index], ordered[target]] = [ordered[target]!, ordered[index]!];
    try {
      setIsSaving(true);
      if (kind === "topic") await reorderTopics(parentId, ordered);
      else await reorderSubtopics(parentId, ordered);
      await reloadStructure();
      onMessage("success", "Sequência atualizada.");
    } catch (error) {
      onMessage("error", error instanceof Error ? error.message : "Não foi possível alterar a sequência.");
    } finally { setIsSaving(false); }
  }

  function renderEditingRow(
    type: ItemType,
    id: number,
    level: number,
  ) {
    if (
      editing?.type !== type ||
      editing.id !== id
    ) {
      return null;
    }

    return (
      <form
        className={`structure-tree-row structure-tree-level-${level}`}
        onSubmit={handleSave}
      >
        <input
          className="structure-tree-input"
          value={editing.name}
          onChange={(event) =>
            setEditing({
              ...editing,
              name: event.target.value,
            })
          }
          autoFocus
          maxLength={120}
          required
        />

        <div className="structure-tree-actions">
          <button
            type="submit"
            className="structure-icon-button"
            title="Salvar"
            disabled={isSaving}
          >
            <Save size={17} />
          </button>

          <button
            type="button"
            className="structure-icon-button"
            title="Cancelar"
            onClick={cancelEditing}
          >
            <X size={17} />
          </button>
        </div>
      </form>
    );
  }

  return (
    <section className="structure-manager">
      <div className="structure-manager-header">
        <div>
          <span className="structure-manager-label">
            Conteúdo cadastrado
          </span>

          <h3>
            Disciplinas, tópicos e
            subtópicos
          </h3>
        </div>

        <span className="structure-total">
          {disciplines.length}
        </span>
      </div>

      <div className="structure-tree">
        {disciplines.map(
          (discipline) => {
            const disciplineOpen =
              openDisciplines.has(
                discipline.id,
              );

            const editingDiscipline =
              editing?.type ===
                "discipline" &&
              editing.id ===
                discipline.id;

            return (
              <div
                key={discipline.id}
                className="structure-discipline-block"
              >
                {editingDiscipline ? (
                  renderEditingRow(
                    "discipline",
                    discipline.id,
                    0,
                  )
                ) : (
                  <div className="structure-tree-row structure-tree-level-0">
                    <button
                      type="button"
                      className="structure-expand-button"
                      onClick={() =>
                        toggleSet(
                          setOpenDisciplines,
                          discipline.id,
                        )
                      }
                    >
                      {disciplineOpen ? (
                        <ChevronDown
                          size={18}
                        />
                      ) : (
                        <ChevronRight
                          size={18}
                        />
                      )}
                    </button>

                    <BookOpen
                      className="structure-item-icon"
                      size={18}
                    />

                    <div className="structure-item-content">
                      <strong>
                        {discipline.name}
                      </strong>

                      <span>
                        {
                          discipline.topics
                            .length
                        }{" "}
                        tópicos
                      </span>
                    </div>

                    <div className="structure-tree-actions">
                      <button
                        type="button"
                        className="structure-icon-button"
                        title="Editar disciplina"
                        onClick={() =>
                          beginEditing(
                            "discipline",
                            discipline.id,
                            discipline.name,
                          )
                        }
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        type="button"
                        className="structure-icon-button structure-delete-button"
                        title="Excluir disciplina"
                        disabled={
                          discipline.topics
                            .length > 0 ||
                          isSaving
                        }
                        onClick={() =>
                          handleDelete(
                            "discipline",
                            discipline.id,
                            discipline.name,
                          )
                        }
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                )}

                {disciplineOpen && (
                  <div className="structure-children">
                    {discipline.topics.map(
                      (topic, topicIndex) => {
                        const topicOpen =
                          openTopics.has(
                            topic.id,
                          );

                        const editingTopic =
                          editing?.type ===
                            "topic" &&
                          editing.id ===
                            topic.id;

                        return (
                          <div key={topic.id}>
                            {editingTopic ? (
                              renderEditingRow(
                                "topic",
                                topic.id,
                                1,
                              )
                            ) : (
                              <div className="structure-tree-row structure-tree-level-1">
                                <button
                                  type="button"
                                  className="structure-expand-button"
                                  onClick={() =>
                                    toggleSet(
                                      setOpenTopics,
                                      topic.id,
                                    )
                                  }
                                >
                                  {topicOpen ? (
                                    <ChevronDown
                                      size={17}
                                    />
                                  ) : (
                                    <ChevronRight
                                      size={17}
                                    />
                                  )}
                                </button>

                                <Folder
                                  className="structure-item-icon"
                                  size={17}
                                />

                                <div className="structure-item-content">
                                  <strong>
                                    {topic.name}
                                  </strong>

                                  <span>
                                    {
                                      topic
                                        .subtopics
                                        .length
                                    }{" "}
                                    subtópicos
                                  </span>
                                </div>

                                <div className="structure-tree-actions">
                                  <button type="button" className="structure-icon-button" title="Mover tópico para cima" disabled={topicIndex === 0 || isSaving} onClick={() => void moveItem("topic", discipline.id, discipline.topics.map((item) => item.id), topicIndex, -1)}><ArrowUp size={15} /></button>
                                  <button type="button" className="structure-icon-button" title="Mover tópico para baixo" disabled={topicIndex === discipline.topics.length - 1 || isSaving} onClick={() => void moveItem("topic", discipline.id, discipline.topics.map((item) => item.id), topicIndex, 1)}><ArrowDown size={15} /></button>
                                  <button
                                    type="button"
                                    className="structure-icon-button"
                                    title="Editar tópico"
                                    onClick={() =>
                                      beginEditing(
                                        "topic",
                                        topic.id,
                                        topic.name,
                                      )
                                    }
                                  >
                                    <Pencil
                                      size={16}
                                    />
                                  </button>

                                  <button
                                    type="button"
                                    className="structure-icon-button structure-delete-button"
                                    title="Excluir tópico"
                                    disabled={
                                      topic
                                        .subtopics
                                        .length >
                                        0 ||
                                      isSaving
                                    }
                                    onClick={() =>
                                      handleDelete(
                                        "topic",
                                        topic.id,
                                        topic.name,
                                      )
                                    }
                                  >
                                    <Trash2
                                      size={16}
                                    />
                                  </button>
                                </div>
                              </div>
                            )}

                            {topicOpen && (
                              <div className="structure-children">
                                {topic.subtopics.map(
                                  (
                                    subtopic,
                                    subtopicIndex,
                                  ) => {
                                    const editingSubtopic =
                                      editing?.type ===
                                        "subtopic" &&
                                      editing.id ===
                                        subtopic.id;

                                    return editingSubtopic ? (
                                      <div
                                        key={
                                          subtopic.id
                                        }
                                      >
                                        {renderEditingRow(
                                          "subtopic",
                                          subtopic.id,
                                          2,
                                        )}
                                      </div>
                                    ) : (
                                      <div
                                        key={
                                          subtopic.id
                                        }
                                        className="structure-tree-row structure-tree-level-2"
                                      >
                                        <span className="structure-leaf-spacer" />

                                        <FileText
                                          className="structure-item-icon"
                                          size={
                                            16
                                          }
                                        />

                                        <div className="structure-item-content">
                                          <strong>
                                            {
                                              subtopic.name
                                            }
                                          </strong>

                                          <span>
                                            Subtópico
                                          </span>
                                        </div>

                                        <div className="structure-tree-actions">
                                          <button type="button" className="structure-icon-button" title="Mover subtópico para cima" disabled={subtopicIndex === 0 || isSaving} onClick={() => void moveItem("subtopic", topic.id, topic.subtopics.map((item) => item.id), subtopicIndex, -1)}><ArrowUp size={15} /></button>
                                          <button type="button" className="structure-icon-button" title="Mover subtópico para baixo" disabled={subtopicIndex === topic.subtopics.length - 1 || isSaving} onClick={() => void moveItem("subtopic", topic.id, topic.subtopics.map((item) => item.id), subtopicIndex, 1)}><ArrowDown size={15} /></button>
                                          <button
                                            type="button"
                                            className="structure-icon-button"
                                            title="Editar subtópico"
                                            onClick={() =>
                                              beginEditing(
                                                "subtopic",
                                                subtopic.id,
                                                subtopic.name,
                                              )
                                            }
                                          >
                                            <Pencil
                                              size={
                                                16
                                              }
                                            />
                                          </button>

                                          <button
                                            type="button"
                                            className="structure-icon-button structure-delete-button"
                                            title="Excluir subtópico"
                                            disabled={
                                              isSaving
                                            }
                                            onClick={() =>
                                              handleDelete(
                                                "subtopic",
                                                subtopic.id,
                                                subtopic.name,
                                              )
                                            }
                                          >
                                            <Trash2
                                              size={
                                                16
                                              }
                                            />
                                          </button>
                                        </div>
                                      </div>
                                    );
                                  },
                                )}

                                {topic.subtopics
                                  .length ===
                                  0 && (
                                  <div className="structure-empty-child">
                                    Nenhum
                                    subtópico.
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      },
                    )}

                    {discipline.topics
                      .length === 0 && (
                      <div className="structure-empty-child">
                        Nenhum tópico.
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          },
        )}

        {disciplines.length === 0 && (
          <div className="structure-empty">
            Nenhuma disciplina cadastrada.
          </div>
        )}
      </div>
    </section>
  );
}
