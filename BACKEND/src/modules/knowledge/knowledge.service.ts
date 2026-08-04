import { AppError } from "../../errors/AppError.js";
import {
  createCategory,
  createClassification,
  createGroup,
  createItem,
  deleteCategory,
  deleteClassification,
  deleteGroup,
  deleteItem,
  findCategoryByGroupAndName,
  findCategoryById,
  findCategoryIdentity,
  findClassificationById,
  findClassificationByPair,
  findGroupById,
  findGroupBySubtopicAndName,
  findItemById,
  findItemIdentity,
  findKnowledgeBySubtopicId,
  findSubtopicById,
  updateCategory,
  updateGroup,
  updateItem,
} from "./knowledge.repository.js";

interface CreateGroupInput {
  subtopicId: number;
  name: string;
  instruction?: string | null;
}

interface UpdateGroupInput {
  groupId: number;
  name?: string;
  instruction?: string | null;
  isActive?: boolean;
}

interface CreateCategoryInput {
  groupId: number;
  name: string;
  displayOrder: number;
}

interface UpdateCategoryInput {
  categoryId: number;
  name?: string;
  displayOrder?: number;
}

interface CreateItemInput {
  subtopicId: number;
  text: string;
  explanation?: string | null;
  reference?: string | null;
}

interface UpdateItemInput {
  itemId: number;
  subtopicId?: number;
  text?: string;
  explanation?: string | null;
  reference?: string | null;
  isActive?: boolean;
}

function normalizeText(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function normalizeOptionalText(
  value: string | null | undefined,
) {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return null;
  }

  const normalized = value.trim();
  return normalized.length === 0 ? null : normalized;
}

function validateName(
  value: string,
  minimumLength: number,
) {
  const name = normalizeText(value);

  if (
    name.length < minimumLength ||
    name.length > 160
  ) {
    throw new AppError(
      `O nome deve possuir entre ${minimumLength} e 160 caracteres.`,
      400,
    );
  }

  return name;
}

function validateItemText(value: string) {
  const text = value.trim();

  if (text.length < 2 || text.length > 2000) {
    throw new AppError(
      "O texto deve possuir entre 2 e 2000 caracteres.",
      400,
    );
  }

  return text;
}

function validateDisplayOrder(value: number) {
  if (!Number.isInteger(value) || value < 0) {
    throw new AppError(
      "A ordem de exibição deve ser um inteiro não negativo.",
      400,
    );
  }

  return value;
}

function isUniqueConstraintError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  );
}

async function ensureSubtopicExists(subtopicId: number) {
  const subtopic = await findSubtopicById(subtopicId);

  if (!subtopic) {
    throw new AppError("Subtópico não encontrado.", 404);
  }
}

export async function addGroup(input: CreateGroupInput) {
  await ensureSubtopicExists(input.subtopicId);
  const name = validateName(input.name, 2);

  if (
    await findGroupBySubtopicAndName(
      input.subtopicId,
      name,
    )
  ) {
    throw new AppError(
      "Já existe um grupo com esse nome no subtópico.",
      409,
    );
  }

  try {
    return await createGroup({
      subtopicId: input.subtopicId,
      name,
      instruction:
        normalizeOptionalText(input.instruction) ?? null,
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      throw new AppError(
        "Já existe um grupo com esse nome no subtópico.",
        409,
      );
    }

    throw error;
  }
}

export async function editGroup(input: UpdateGroupInput) {
  const group = await findGroupById(input.groupId);

  if (!group) {
    throw new AppError("Grupo não encontrado.", 404);
  }

  const name = input.name === undefined
    ? undefined
    : validateName(input.name, 2);

  if (name !== undefined) {
    const duplicate = await findGroupBySubtopicAndName(
      group.subtopicId,
      name,
    );

    if (duplicate && duplicate.id !== input.groupId) {
      throw new AppError(
        "Já existe um grupo com esse nome no subtópico.",
        409,
      );
    }
  }

  try {
    return await updateGroup(input.groupId, {
      name,
      instruction: normalizeOptionalText(input.instruction),
      isActive: input.isActive,
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      throw new AppError(
        "Já existe um grupo com esse nome no subtópico.",
        409,
      );
    }

    throw error;
  }
}

export async function removeGroup(groupId: number) {
  const group = await findGroupById(groupId);

  if (!group) {
    throw new AppError("Grupo não encontrado.", 404);
  }

  if (group._count.categories > 0) {
    throw new AppError(
      "Remova as categorias antes de excluir o grupo.",
      409,
    );
  }

  await deleteGroup(groupId);
}

export async function addCategory(
  input: CreateCategoryInput,
) {
  const group = await findGroupById(input.groupId);

  if (!group) {
    throw new AppError("Grupo não encontrado.", 404);
  }

  const name = validateName(input.name, 1);
  const displayOrder = validateDisplayOrder(
    input.displayOrder,
  );

  if (
    await findCategoryByGroupAndName(input.groupId, name)
  ) {
    throw new AppError(
      "Já existe uma categoria com esse nome no grupo.",
      409,
    );
  }

  try {
    return await createCategory({
      groupId: input.groupId,
      name,
      displayOrder,
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      throw new AppError(
        "Já existe uma categoria com esse nome no grupo.",
        409,
      );
    }

    throw error;
  }
}

export async function editCategory(
  input: UpdateCategoryInput,
) {
  const category = await findCategoryById(input.categoryId);

  if (!category) {
    throw new AppError("Categoria não encontrada.", 404);
  }

  const name = input.name === undefined
    ? undefined
    : validateName(input.name, 1);

  if (name !== undefined) {
    const duplicate = await findCategoryByGroupAndName(
      category.groupId,
      name,
    );

    if (duplicate && duplicate.id !== input.categoryId) {
      throw new AppError(
        "Já existe uma categoria com esse nome no grupo.",
        409,
      );
    }
  }

  const displayOrder = input.displayOrder === undefined
    ? undefined
    : validateDisplayOrder(input.displayOrder);

  try {
    return await updateCategory(input.categoryId, {
      name,
      displayOrder,
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      throw new AppError(
        "Já existe uma categoria com esse nome no grupo.",
        409,
      );
    }

    throw error;
  }
}

export async function removeCategory(categoryId: number) {
  const category = await findCategoryById(categoryId);

  if (!category) {
    throw new AppError("Categoria não encontrada.", 404);
  }

  if (category._count.classifications > 0) {
    throw new AppError(
      "Remova as classificações antes de excluir a categoria.",
      409,
    );
  }

  await deleteCategory(categoryId);
}

export async function addItem(input: CreateItemInput) {
  await ensureSubtopicExists(input.subtopicId);

  return createItem({
    subtopicId: input.subtopicId,
    text: validateItemText(input.text),
    explanation:
      normalizeOptionalText(input.explanation) ?? null,
    reference:
      normalizeOptionalText(input.reference) ?? null,
  });
}

export async function editItem(input: UpdateItemInput) {
  const item = await findItemById(input.itemId);

  if (!item) {
    throw new AppError("Item de conhecimento não encontrado.", 404);
  }

  if (
    input.subtopicId !== undefined &&
    input.subtopicId !== item.subtopicId
  ) {
    await ensureSubtopicExists(input.subtopicId);

    const hasIncompatibleClassification =
      item.classifications.some(
        (classification) =>
          classification.category.group.subtopicId !==
          input.subtopicId,
      );

    if (hasIncompatibleClassification) {
      throw new AppError(
        "O item possui classificações incompatíveis com o novo subtópico.",
        409,
      );
    }
  }

  return updateItem(input.itemId, {
    subtopicId: input.subtopicId,
    text: input.text === undefined
      ? undefined
      : validateItemText(input.text),
    explanation: normalizeOptionalText(input.explanation),
    reference: normalizeOptionalText(input.reference),
    isActive: input.isActive,
  });
}

export async function removeItem(itemId: number) {
  const item = await findItemById(itemId);

  if (!item) {
    throw new AppError("Item de conhecimento não encontrado.", 404);
  }

  if ((item.progress?.totalAttempts ?? 0) > 0) {
    throw new AppError(
      "O item possui histórico de tentativas e não pode ser excluído.",
      409,
    );
  }

  await deleteItem(itemId);
}

export async function addClassification(input: {
  itemId: number;
  categoryId: number;
}) {
  const [item, category] = await Promise.all([
    findItemIdentity(input.itemId),
    findCategoryIdentity(input.categoryId),
  ]);

  if (!item) {
    throw new AppError("Item de conhecimento não encontrado.", 404);
  }

  if (!category) {
    throw new AppError("Categoria não encontrada.", 404);
  }

  if (item.subtopicId !== category.group.subtopicId) {
    throw new AppError(
      "A categoria não pertence ao subtópico do item.",
      409,
    );
  }

  if (
    await findClassificationByPair(
      input.itemId,
      input.categoryId,
    )
  ) {
    throw new AppError(
      "O item já possui essa classificação.",
      409,
    );
  }

  try {
    return await createClassification(input);
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      throw new AppError(
        "O item já possui essa classificação.",
        409,
      );
    }

    throw error;
  }
}

export async function removeClassification(
  classificationId: number,
) {
  if (!(await findClassificationById(classificationId))) {
    throw new AppError("Classificação não encontrada.", 404);
  }

  await deleteClassification(classificationId);
}

export async function getKnowledgeBySubtopic(
  subtopicId: number,
) {
  const result = await findKnowledgeBySubtopicId(subtopicId);

  if (!result) {
    throw new AppError("Subtópico não encontrado.", 404);
  }

  return {
    subtopicId: result.id,
    groups: result.classificationGroups,
    items: result.knowledgeItems.map((item) => ({
      id: item.id,
      text: item.text,
      explanation: item.explanation,
      reference: item.reference,
      isActive: item.isActive,
      classifications: item.classifications.map(
        (classification) => ({
          id: classification.id,
          categoryId: classification.categoryId,
          categoryName: classification.category.name,
          groupId: classification.category.group.id,
          groupName: classification.category.group.name,
        }),
      ),
    })),
  };
}
