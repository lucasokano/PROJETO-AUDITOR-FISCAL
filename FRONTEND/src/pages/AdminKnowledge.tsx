import {
  ArrowDown,
  ArrowUp,
  Pencil,
  Plus,
  Search,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type MouseEvent,
} from "react";
import { useStudy } from "../contexts/StudyContext";
import {
  createKnowledgeCategory,
  createKnowledgeClassification,
  createKnowledgeGroup,
  createKnowledgeItem,
  deleteKnowledgeCategory,
  deleteKnowledgeClassification,
  deleteKnowledgeGroup,
  deleteKnowledgeItem,
  getSubtopicKnowledge,
  importKnowledgeItems,
  updateKnowledgeCategory,
  updateKnowledgeGroup,
  updateKnowledgeItem,
} from "../services/knowledgeApi";
import type {
  KnowledgeCategory,
  KnowledgeGroup,
  KnowledgeImportItem,
  KnowledgeImportReport,
  KnowledgeItem,
  SubtopicKnowledge,
} from "../types/knowledge";

type Message = {
  type: "success" | "error";
  text: string;
};

interface ImportResult extends KnowledgeImportReport {
  invalidLines: number[];
}

const emptyGroupDraft = {
  id: null as number | null,
  name: "",
  instruction: "",
};

const emptyCategoryDraft = {
  id: null as number | null,
  name: "",
  displayOrder: 0,
};

const emptyItemDraft = {
  id: null as number | null,
  text: "",
  explanation: "",
  reference: "",
};

function getErrorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "Não foi possível concluir a operação.";
}

export function AdminKnowledge() {
  const { disciplines, isLoading: isStructureLoading, error: structureError } =
    useStudy();
  const [disciplineId, setDisciplineId] = useState("");
  const [topicId, setTopicId] = useState("");
  const [subtopicId, setSubtopicId] = useState("");
  const [knowledge, setKnowledge] = useState<SubtopicKnowledge | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [groupDraft, setGroupDraft] = useState(emptyGroupDraft);
  const [categoryDraft, setCategoryDraft] = useState(emptyCategoryDraft);
  const [itemDraft, setItemDraft] = useState(emptyItemDraft);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState<Message | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isItemEditorOpen, setIsItemEditorOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importGroupId, setImportGroupId] = useState("");
  const [importText, setImportText] = useState("");
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  const discipline = disciplines.find(
    (item) => item.id === Number(disciplineId),
  );
  const topic = discipline?.topics.find(
    (item) => item.id === Number(topicId),
  );
  const selectedGroup = knowledge?.groups.find(
    (group) => group.id === selectedGroupId,
  );
  const selectedItem = knowledge?.items.find(
    (item) => item.id === selectedItemId,
  );

  const filteredItems = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase("pt-BR");
    const items = knowledge?.items ?? [];

    if (!normalizedSearch) {
      return [...items].sort((a, b) => a.text.localeCompare(b.text, "pt-BR"));
    }

    return items
      .filter((item) =>
        item.text.toLocaleLowerCase("pt-BR").includes(normalizedSearch),
      )
      .sort((a, b) => a.text.localeCompare(b.text, "pt-BR"));
  }, [knowledge?.items, search]);

  const loadKnowledge = useCallback(async () => {
    const numericSubtopicId = Number(subtopicId);

    if (!numericSubtopicId) {
      setKnowledge(null);
      return;
    }

    try {
      setIsLoading(true);
      setMessage(null);
      const result = await getSubtopicKnowledge(numericSubtopicId);
      setKnowledge(result);
      setSelectedGroupId((current) =>
        result.groups.some((group) => group.id === current)
          ? current
          : (result.groups[0]?.id ?? null),
      );
      setSelectedItemId((current) =>
        result.items.some((item) => item.id === current) ? current : null,
      );
    } catch (error) {
      setKnowledge(null);
      setMessage({ type: "error", text: getErrorMessage(error) });
    } finally {
      setIsLoading(false);
    }
  }, [subtopicId]);

  useEffect(() => {
    void loadKnowledge();
  }, [loadKnowledge]);

  async function executeMutation(
    action: () => Promise<unknown>,
    successMessage: string,
  ) {
    try {
      setIsSaving(true);
      setMessage(null);
      await action();
      await loadKnowledge();
      setMessage({ type: "success", text: successMessage });
      return true;
    } catch (error) {
      setMessage({ type: "error", text: getErrorMessage(error) });
      return false;
    } finally {
      setIsSaving(false);
    }
  }

  async function handleGroupSubmit(event: FormEvent) {
    event.preventDefault();
    const numericSubtopicId = Number(subtopicId);

    const saved = await executeMutation(
      () =>
        groupDraft.id
          ? updateKnowledgeGroup(groupDraft.id, {
              name: groupDraft.name,
              instruction: groupDraft.instruction || null,
            })
          : createKnowledgeGroup({
              subtopicId: numericSubtopicId,
              name: groupDraft.name,
              instruction: groupDraft.instruction || null,
            }),
      groupDraft.id ? "Grupo atualizado." : "Grupo criado.",
    );

    if (saved) setGroupDraft(emptyGroupDraft);
  }

  function editGroup(group: KnowledgeGroup, event: MouseEvent) {
    event.stopPropagation();
    setSelectedGroupId(group.id);
    setGroupDraft({
      id: group.id,
      name: group.name,
      instruction: group.instruction ?? "",
    });
  }

  async function removeGroup(group: KnowledgeGroup, event: MouseEvent) {
    event.stopPropagation();
    if (!window.confirm(`Excluir o grupo "${group.name}"?`)) return;
    await executeMutation(() => deleteKnowledgeGroup(group.id), "Grupo excluído.");
  }

  async function toggleGroup(group: KnowledgeGroup, event: MouseEvent) {
    event.stopPropagation();
    await executeMutation(
      () => updateKnowledgeGroup(group.id, { isActive: !group.isActive }),
      group.isActive ? "Grupo desativado." : "Grupo ativado.",
    );
  }

  async function handleCategorySubmit(event: FormEvent) {
    event.preventDefault();
    if (!selectedGroup) return;

    const saved = await executeMutation(
      () =>
        categoryDraft.id
          ? updateKnowledgeCategory(categoryDraft.id, {
              name: categoryDraft.name,
              displayOrder: categoryDraft.displayOrder,
            })
          : createKnowledgeCategory({
              groupId: selectedGroup.id,
              name: categoryDraft.name,
              displayOrder: selectedGroup.categories.length,
            }),
      categoryDraft.id ? "Categoria atualizada." : "Categoria criada.",
    );

    if (saved) setCategoryDraft(emptyCategoryDraft);
  }

  async function removeCategory(category: KnowledgeCategory) {
    if (!window.confirm(`Excluir a categoria "${category.name}"?`)) return;
    await executeMutation(
      () => deleteKnowledgeCategory(category.id),
      "Categoria excluída.",
    );
  }

  async function moveCategory(index: number, direction: -1 | 1) {
    if (!selectedGroup) return;
    const destination = index + direction;
    if (destination < 0 || destination >= selectedGroup.categories.length) return;
    const reordered = [...selectedGroup.categories];
    const [category] = reordered.splice(index, 1);
    if (!category) return;
    reordered.splice(destination, 0, category);

    await executeMutation(
      () =>
        Promise.all(
          reordered.map((item, order) =>
            updateKnowledgeCategory(item.id, { displayOrder: order }),
          ),
        ),
      "Ordem das categorias atualizada.",
    );
  }

  async function handleItemSubmit(event: FormEvent) {
    event.preventDefault();
    const numericSubtopicId = Number(subtopicId);

    const saved = await executeMutation(
      () =>
        itemDraft.id
          ? updateKnowledgeItem(itemDraft.id, {
              text: itemDraft.text,
              explanation: itemDraft.explanation || null,
              reference: itemDraft.reference || null,
            })
          : createKnowledgeItem({
              subtopicId: numericSubtopicId,
              text: itemDraft.text,
              explanation: itemDraft.explanation || null,
              reference: itemDraft.reference || null,
            }),
      itemDraft.id ? "Item atualizado." : "Item criado.",
    );

    if (saved) setItemDraft(emptyItemDraft);
  }

  function editItem(item: KnowledgeItem, event: MouseEvent) {
    event.stopPropagation();
    setSelectedItemId(item.id);
    setItemDraft({
      id: item.id,
      text: item.text,
      explanation: item.explanation ?? "",
      reference: item.reference ?? "",
    });
    setIsItemEditorOpen(true);
  }

  async function removeItem(item: KnowledgeItem, event: MouseEvent) {
    event.stopPropagation();
    if (!window.confirm(`Excluir o item "${item.text}"?`)) return;
    await executeMutation(() => deleteKnowledgeItem(item.id), "Item excluído.");
  }

  async function toggleItem(item: KnowledgeItem, event: MouseEvent) {
    event.stopPropagation();
    await executeMutation(
      () => updateKnowledgeItem(item.id, { isActive: !item.isActive }),
      item.isActive ? "Item desativado." : "Item ativado.",
    );
  }

  async function toggleClassification(categoryId: number) {
    if (!selectedItem) return;
    const existing = selectedItem.classifications.find(
      (classification) => classification.categoryId === categoryId,
    );

    await executeMutation(
      () =>
        existing
          ? deleteKnowledgeClassification(existing.id)
          : createKnowledgeClassification({
              itemId: selectedItem.id,
              categoryId,
            }),
      existing ? "Classificação removida." : "Classificação adicionada.",
    );
  }

  function openImport() {
    setImportGroupId(String(selectedGroupId ?? knowledge?.groups[0]?.id ?? ""));
    setImportText("");
    setImportResult(null);
    setIsImportOpen(true);
  }

  async function handleImport(event: FormEvent) {
    event.preventDefault();
    const validItems: KnowledgeImportItem[] = [];
    const invalidLines: number[] = [];

    importText.split(/\r?\n/).forEach((line, index) => {
      if (!line.trim()) return;
      const parts = line.split(";").map((part) => part.trim());
      const text = parts[0] ?? "";
      const categoryName = parts[1] ?? "";

      if (
        text.length < 2 ||
        text.length > 2000 ||
        categoryName.length < 1 ||
        categoryName.length > 160 ||
        parts.length > 3
      ) {
        invalidLines.push(index + 1);
        return;
      }

      validItems.push({
        line: index + 1,
        text,
        categoryName,
        reference: parts[2] || null,
      });
    });

    if (validItems.length === 0) {
      setImportResult({
        created: 0,
        updated: 0,
        ignored: 0,
        missingCategories: [],
        invalidLines,
      });
      return;
    }

    try {
      setIsSaving(true);
      setMessage(null);
      const result = await importKnowledgeItems({
        subtopicId: Number(subtopicId),
        groupId: Number(importGroupId),
        items: validItems,
      });
      setImportResult({ ...result, invalidLines });
      await loadKnowledge();
      setMessage({ type: "success", text: "Importação processada." });
    } catch (error) {
      setMessage({ type: "error", text: getErrorMessage(error) });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="page knowledge-admin-page">
      <header className="knowledge-admin-heading">
        <div>
          <span>Administração</span>
          <h2>Conhecimento estruturado</h2>
          <p>Gerencie dimensões, categorias, itens e suas classificações.</p>
        </div>
      </header>

      {message && <div className={`knowledge-message knowledge-message-${message.type}`}>{message.text}</div>}
      {structureError && <div className="knowledge-message knowledge-message-error">{structureError}</div>}

      <section className="knowledge-structure-panel">
        <label>
          <span>Disciplina</span>
          <select value={disciplineId} disabled={isStructureLoading} onChange={(event) => {
            setDisciplineId(event.target.value);
            setTopicId("");
            setSubtopicId("");
          }}>
            <option value="">Selecione</option>
            {disciplines.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
        </label>
        <label>
          <span>Tópico</span>
          <select value={topicId} disabled={!discipline} onChange={(event) => {
            setTopicId(event.target.value);
            setSubtopicId("");
          }}>
            <option value="">Selecione</option>
            {discipline?.topics.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
        </label>
        <label>
          <span>Subtópico</span>
          <select value={subtopicId} disabled={!topic} onChange={(event) => {
            setSubtopicId(event.target.value);
            setGroupDraft(emptyGroupDraft);
            setCategoryDraft(emptyCategoryDraft);
            setItemDraft(emptyItemDraft);
            setSelectedItemId(null);
          }}>
            <option value="">Selecione</option>
            {topic?.subtopics.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
        </label>
      </section>

      {!subtopicId ? (
        <div className="knowledge-empty">Selecione um subtópico para administrar o conhecimento estruturado.</div>
      ) : isLoading ? (
        <div className="knowledge-empty">Carregando conhecimento...</div>
      ) : knowledge && (
        <>
          <div className="knowledge-top-grid">
            <section className="knowledge-panel">
              <div className="knowledge-panel-title"><div><span>Dimensões</span><h3>Grupos</h3></div><strong>{knowledge.groups.length}</strong></div>
              <form className="knowledge-compact-form" onSubmit={handleGroupSubmit}>
                <input value={groupDraft.name} onChange={(event) => setGroupDraft({ ...groupDraft, name: event.target.value })} placeholder="Nome do grupo" maxLength={160} required />
                <textarea value={groupDraft.instruction} onChange={(event) => setGroupDraft({ ...groupDraft, instruction: event.target.value })} placeholder="Instrução opcional" rows={2} />
                <div className="knowledge-form-actions">
                  <button type="submit" disabled={isSaving}>{isSaving ? "Salvando..." : groupDraft.id ? "Salvar grupo" : "Criar grupo"}</button>
                  {groupDraft.id && <button type="button" className="knowledge-secondary-button" onClick={() => setGroupDraft(emptyGroupDraft)}>Cancelar</button>}
                </div>
              </form>
              <div className="knowledge-list">
                {knowledge.groups.map((group) => (
                  <div key={group.id} className={`knowledge-list-row ${selectedGroupId === group.id ? "knowledge-list-row-active" : ""}`} onClick={() => { setSelectedGroupId(group.id); setCategoryDraft(emptyCategoryDraft); }}>
                    <span><strong>{group.name}</strong><small>{group.isActive ? "Ativo" : "Inativo"}</small></span>
                    <span className="knowledge-row-actions">
                      <button type="button" title={group.isActive ? "Desativar" : "Ativar"} onClick={(event) => void toggleGroup(group, event)}>{group.isActive ? "Ativo" : "Inativo"}</button>
                      <button type="button" title="Editar" onClick={(event) => editGroup(group, event)}><Pencil size={15} /></button>
                      <button type="button" title="Excluir" onClick={(event) => void removeGroup(group, event)}><Trash2 size={15} /></button>
                    </span>
                  </div>
                ))}
                {!knowledge.groups.length && <div className="knowledge-list-empty">Nenhum grupo cadastrado.</div>}
              </div>
            </section>

            <section className="knowledge-panel">
              <div className="knowledge-panel-title"><div><span>Grupo selecionado</span><h3>Categorias</h3></div><strong>{selectedGroup?.categories.length ?? 0}</strong></div>
              {selectedGroup ? <>
                <form className="knowledge-compact-form knowledge-category-form" onSubmit={handleCategorySubmit}>
                  <input value={categoryDraft.name} onChange={(event) => setCategoryDraft({ ...categoryDraft, name: event.target.value })} placeholder="Nome da categoria" maxLength={160} required />
                  {categoryDraft.id && <input type="number" min={0} value={categoryDraft.displayOrder} onChange={(event) => setCategoryDraft({ ...categoryDraft, displayOrder: Number(event.target.value) })} aria-label="Ordem" />}
                  <div className="knowledge-form-actions">
                    <button type="submit" disabled={isSaving}>{categoryDraft.id ? "Salvar categoria" : "Criar categoria"}</button>
                    {categoryDraft.id && <button type="button" className="knowledge-secondary-button" onClick={() => setCategoryDraft(emptyCategoryDraft)}>Cancelar</button>}
                  </div>
                </form>
                <div className="knowledge-list">
                  {selectedGroup.categories.map((category, index) => (
                    <div className="knowledge-category-row" key={category.id}>
                      <span><strong>{category.name}</strong><small>Ordem {category.displayOrder}</small></span>
                      <div className="knowledge-row-actions">
                        <button type="button" disabled={index === 0 || isSaving} title="Subir" onClick={() => void moveCategory(index, -1)}><ArrowUp size={15} /></button>
                        <button type="button" disabled={index === selectedGroup.categories.length - 1 || isSaving} title="Descer" onClick={() => void moveCategory(index, 1)}><ArrowDown size={15} /></button>
                        <button type="button" title="Editar" onClick={() => setCategoryDraft({ id: category.id, name: category.name, displayOrder: category.displayOrder })}><Pencil size={15} /></button>
                        <button type="button" title="Excluir" onClick={() => void removeCategory(category)}><Trash2 size={15} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </> : <div className="knowledge-list-empty">Selecione ou crie um grupo.</div>}
            </section>
          </div>

          <section className="knowledge-panel knowledge-items-panel">
            <div className="knowledge-items-toolbar">
              <div><span>Conteúdo</span><h3>Itens de conhecimento</h3></div>
              <div className="knowledge-toolbar-actions">
                <button type="button" onClick={() => { setItemDraft(emptyItemDraft); setIsItemEditorOpen(true); }}><Plus size={16} /> Novo item</button>
                <button type="button" className="knowledge-secondary-button" onClick={openImport}><Upload size={16} /> Importar</button>
                <label className="knowledge-search"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Pesquisar itens" aria-label="Pesquisar itens" /></label>
              </div>
            </div>
            {isItemEditorOpen && <form className="knowledge-item-form knowledge-item-editor" onSubmit={handleItemSubmit}>
              <label><span>Texto</span><textarea value={itemDraft.text} onChange={(event) => setItemDraft({ ...itemDraft, text: event.target.value })} rows={2} maxLength={2000} required /></label>
              <label><span>Explicação</span><textarea value={itemDraft.explanation} onChange={(event) => setItemDraft({ ...itemDraft, explanation: event.target.value })} rows={2} /></label>
              <label><span>Referência</span><input value={itemDraft.reference} onChange={(event) => setItemDraft({ ...itemDraft, reference: event.target.value })} /></label>
              <div className="knowledge-form-actions"><button type="submit" disabled={isSaving}><Plus size={15} /> {itemDraft.id ? "Salvar item" : "Criar item"}</button><button type="button" className="knowledge-secondary-button" onClick={() => { setItemDraft(emptyItemDraft); setIsItemEditorOpen(false); }}>Cancelar</button></div>
            </form>}
            <div className="knowledge-table-wrap">
              <table className="knowledge-table">
                <thead><tr><th>Texto</th><th>Referência</th><th>Status</th><th>Classificações</th><th>Ações</th></tr></thead>
                <tbody>
                  {filteredItems.map((item) => (
                    <tr key={item.id} className={selectedItemId === item.id ? "knowledge-table-row-active" : ""} onClick={() => setSelectedItemId(item.id)}>
                      <td>{item.text}</td><td>{item.reference || "—"}</td><td><span className={`knowledge-status ${item.isActive ? "knowledge-status-active" : ""}`}>{item.isActive ? "Ativo" : "Inativo"}</span></td><td>{item.classifications.length}</td>
                      <td><div className="knowledge-row-actions"><button type="button" onClick={(event) => void toggleItem(item, event)}>{item.isActive ? "Desativar" : "Ativar"}</button><button type="button" title="Editar" onClick={(event) => editItem(item, event)}><Pencil size={15} /></button><button type="button" title="Excluir" onClick={(event) => void removeItem(item, event)}><Trash2 size={15} /></button></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!filteredItems.length && <div className="knowledge-list-empty">Nenhum item encontrado.</div>}
            </div>
          </section>

          <section className="knowledge-panel knowledge-classification-panel">
            <div className="knowledge-panel-title"><div><span>Item selecionado</span><h3>Classificações</h3></div></div>
            {selectedItem ? <><p className="knowledge-selected-item">{selectedItem.text}</p><div className="knowledge-classification-grid">{knowledge.groups.map((group) => <fieldset key={group.id}><legend>{group.name}</legend>{group.categories.map((category) => { const checked = selectedItem.classifications.some((entry) => entry.categoryId === category.id); return <label key={category.id}><input type="checkbox" checked={checked} disabled={isSaving} onChange={() => void toggleClassification(category.id)} /><span>{category.name}</span></label>; })}{!group.categories.length && <small>Nenhuma categoria.</small>}</fieldset>)}</div></> : <div className="knowledge-list-empty">Selecione um item na tabela para administrar suas classificações.</div>}
          </section>
        </>
      )}

      {isImportOpen && <div className="knowledge-modal-backdrop" role="presentation"><section className="knowledge-modal" role="dialog" aria-modal="true" aria-labelledby="knowledge-import-title"><header><div><span>Importação em lote</span><h3 id="knowledge-import-title">Importar itens</h3></div><button type="button" title="Fechar" onClick={() => setIsImportOpen(false)}><X size={20} /></button></header>{message?.type === "error" && <div className="knowledge-message knowledge-message-error">{message.text}</div>}<form onSubmit={handleImport}><label><span>Grupo</span><select value={importGroupId} onChange={(event) => setImportGroupId(event.target.value)} required><option value="">Selecione</option>{knowledge?.groups.map((group) => <option key={group.id} value={group.id}>{group.name}</option>)}</select></label><label><span>Texto para importação</span><textarea rows={12} value={importText} onChange={(event) => setImportText(event.target.value)} placeholder="Direito penal;Privativa da União;CF art.22 I" required /></label><p className="knowledge-import-hint">Uma linha por item: texto ; categoria ; referência</p><div className="knowledge-form-actions"><button type="submit" disabled={isSaving}>{isSaving ? "Importando..." : "Processar importação"}</button><button type="button" className="knowledge-secondary-button" onClick={() => setIsImportOpen(false)}>Fechar</button></div></form>{importResult && <div className="knowledge-import-report"><h4>Relatório</h4><dl><div><dt>Itens criados</dt><dd>{importResult.created}</dd></div><div><dt>Itens atualizados</dt><dd>{importResult.updated}</dd></div><div><dt>Itens ignorados</dt><dd>{importResult.ignored}</dd></div><div><dt>Categorias inexistentes</dt><dd>{importResult.missingCategories.length}</dd></div><div><dt>Linhas inválidas</dt><dd>{importResult.invalidLines.length}</dd></div></dl>{importResult.missingCategories.length > 0 && <p>Categorias ausentes: {importResult.missingCategories.map((item) => `linha ${item.line} (${item.category})`).join(", ")}</p>}{importResult.invalidLines.length > 0 && <p>Linhas inválidas: {importResult.invalidLines.join(", ")}</p>}</div>}</section></div>}
    </section>
  );
}
