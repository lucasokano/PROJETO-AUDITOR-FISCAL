import type { Request, Response } from "express";
import {
  addCategory,
  addClassification,
  addGroup,
  addItem,
  editCategory,
  editGroup,
  editItem,
  getKnowledgeBySubtopic,
  removeCategory,
  removeClassification,
  removeGroup,
  removeItem,
} from "./knowledge.service.js";

interface IdParams {
  subtopicId?: string;
  groupId?: string;
  categoryId?: string;
  itemId?: string;
  classificationId?: string;
}

interface GroupBody {
  subtopicId?: unknown;
  name?: unknown;
  instruction?: unknown;
  isActive?: unknown;
}

interface CategoryBody {
  groupId?: unknown;
  name?: unknown;
  displayOrder?: unknown;
}

interface ItemBody {
  subtopicId?: unknown;
  text?: unknown;
  explanation?: unknown;
  reference?: unknown;
  isActive?: unknown;
}

interface ClassificationBody {
  itemId?: unknown;
  categoryId?: unknown;
}

function parsePositiveInteger(value: string | undefined) {
  if (!value) {
    return null;
  }

  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0
    ? parsed
    : null;
}

function isPositiveInteger(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value > 0
  );
}

function isOptionalText(value: unknown) {
  return (
    value === undefined ||
    value === null ||
    typeof value === "string"
  );
}

function hasOwn(body: object, property: string) {
  return Object.prototype.hasOwnProperty.call(body, property);
}

export async function createKnowledgeGroup(
  request: Request<Record<string, never>, unknown, GroupBody>,
  response: Response,
) {
  const { subtopicId, name, instruction } = request.body;

  if (!isPositiveInteger(subtopicId)) {
    response.status(400).json({ message: "O ID do subtópico é inválido." });
    return;
  }

  if (typeof name !== "string") {
    response.status(400).json({ message: "O nome do grupo é obrigatório." });
    return;
  }

  if (!isOptionalText(instruction)) {
    response.status(400).json({ message: "A instrução é inválida." });
    return;
  }

  const group = await addGroup({ subtopicId, name, instruction });
  response.status(201).json(group);
}

export async function updateKnowledgeGroup(
  request: Request<IdParams, unknown, GroupBody>,
  response: Response,
) {
  const groupId = parsePositiveInteger(request.params.groupId);

  if (!groupId) {
    response.status(400).json({ message: "O ID do grupo é inválido." });
    return;
  }

  const { name, instruction, isActive } = request.body;

  if (
    !hasOwn(request.body, "name") &&
    !hasOwn(request.body, "instruction") &&
    !hasOwn(request.body, "isActive")
  ) {
    response.status(400).json({ message: "Informe ao menos um campo para atualização." });
    return;
  }

  if (name !== undefined && typeof name !== "string") {
    response.status(400).json({ message: "O nome do grupo é inválido." });
    return;
  }

  if (!isOptionalText(instruction)) {
    response.status(400).json({ message: "A instrução é inválida." });
    return;
  }

  if (isActive !== undefined && typeof isActive !== "boolean") {
    response.status(400).json({ message: "O estado do grupo é inválido." });
    return;
  }

  const group = await editGroup({ groupId, name, instruction, isActive });
  response.status(200).json(group);
}

export async function deleteKnowledgeGroup(
  request: Request<IdParams>,
  response: Response,
) {
  const groupId = parsePositiveInteger(request.params.groupId);

  if (!groupId) {
    response.status(400).json({ message: "O ID do grupo é inválido." });
    return;
  }

  await removeGroup(groupId);
  response.status(204).send();
}

export async function createKnowledgeCategory(
  request: Request<Record<string, never>, unknown, CategoryBody>,
  response: Response,
) {
  const { groupId, name, displayOrder = 0 } = request.body;

  if (!isPositiveInteger(groupId)) {
    response.status(400).json({ message: "O ID do grupo é inválido." });
    return;
  }

  if (typeof name !== "string") {
    response.status(400).json({ message: "O nome da categoria é obrigatório." });
    return;
  }

  if (typeof displayOrder !== "number") {
    response.status(400).json({ message: "A ordem de exibição é inválida." });
    return;
  }

  const category = await addCategory({ groupId, name, displayOrder });
  response.status(201).json(category);
}

export async function updateKnowledgeCategory(
  request: Request<IdParams, unknown, CategoryBody>,
  response: Response,
) {
  const categoryId = parsePositiveInteger(request.params.categoryId);

  if (!categoryId) {
    response.status(400).json({ message: "O ID da categoria é inválido." });
    return;
  }

  const { name, displayOrder } = request.body;

  if (!hasOwn(request.body, "name") && !hasOwn(request.body, "displayOrder")) {
    response.status(400).json({ message: "Informe ao menos um campo para atualização." });
    return;
  }

  if (name !== undefined && typeof name !== "string") {
    response.status(400).json({ message: "O nome da categoria é inválido." });
    return;
  }

  if (displayOrder !== undefined && typeof displayOrder !== "number") {
    response.status(400).json({ message: "A ordem de exibição é inválida." });
    return;
  }

  const category = await editCategory({ categoryId, name, displayOrder });
  response.status(200).json(category);
}

export async function deleteKnowledgeCategory(
  request: Request<IdParams>,
  response: Response,
) {
  const categoryId = parsePositiveInteger(request.params.categoryId);

  if (!categoryId) {
    response.status(400).json({ message: "O ID da categoria é inválido." });
    return;
  }

  await removeCategory(categoryId);
  response.status(204).send();
}

export async function createKnowledgeItem(
  request: Request<Record<string, never>, unknown, ItemBody>,
  response: Response,
) {
  const { subtopicId, text, explanation, reference } = request.body;

  if (!isPositiveInteger(subtopicId)) {
    response.status(400).json({ message: "O ID do subtópico é inválido." });
    return;
  }

  if (typeof text !== "string") {
    response.status(400).json({ message: "O texto do item é obrigatório." });
    return;
  }

  if (!isOptionalText(explanation) || !isOptionalText(reference)) {
    response.status(400).json({ message: "A explicação ou referência é inválida." });
    return;
  }

  const item = await addItem({ subtopicId, text, explanation, reference });
  response.status(201).json(item);
}

export async function updateKnowledgeItem(
  request: Request<IdParams, unknown, ItemBody>,
  response: Response,
) {
  const itemId = parsePositiveInteger(request.params.itemId);

  if (!itemId) {
    response.status(400).json({ message: "O ID do item é inválido." });
    return;
  }

  const { subtopicId, text, explanation, reference, isActive } = request.body;
  const fields = ["subtopicId", "text", "explanation", "reference", "isActive"];

  if (!fields.some((field) => hasOwn(request.body, field))) {
    response.status(400).json({ message: "Informe ao menos um campo para atualização." });
    return;
  }

  if (subtopicId !== undefined && !isPositiveInteger(subtopicId)) {
    response.status(400).json({ message: "O ID do subtópico é inválido." });
    return;
  }

  if (text !== undefined && typeof text !== "string") {
    response.status(400).json({ message: "O texto do item é inválido." });
    return;
  }

  if (!isOptionalText(explanation) || !isOptionalText(reference)) {
    response.status(400).json({ message: "A explicação ou referência é inválida." });
    return;
  }

  if (isActive !== undefined && typeof isActive !== "boolean") {
    response.status(400).json({ message: "O estado do item é inválido." });
    return;
  }

  const item = await editItem({
    itemId,
    subtopicId,
    text,
    explanation,
    reference,
    isActive,
  });
  response.status(200).json(item);
}

export async function deleteKnowledgeItem(
  request: Request<IdParams>,
  response: Response,
) {
  const itemId = parsePositiveInteger(request.params.itemId);

  if (!itemId) {
    response.status(400).json({ message: "O ID do item é inválido." });
    return;
  }

  await removeItem(itemId);
  response.status(204).send();
}

export async function createItemClassification(
  request: Request<Record<string, never>, unknown, ClassificationBody>,
  response: Response,
) {
  const { itemId, categoryId } = request.body;

  if (!isPositiveInteger(itemId) || !isPositiveInteger(categoryId)) {
    response.status(400).json({ message: "Os IDs do item e da categoria são inválidos." });
    return;
  }

  const classification = await addClassification({ itemId, categoryId });
  response.status(201).json(classification);
}

export async function deleteItemClassification(
  request: Request<IdParams>,
  response: Response,
) {
  const classificationId = parsePositiveInteger(request.params.classificationId);

  if (!classificationId) {
    response.status(400).json({ message: "O ID da classificação é inválido." });
    return;
  }

  await removeClassification(classificationId);
  response.status(204).send();
}

export async function getSubtopicKnowledge(
  request: Request<IdParams>,
  response: Response,
) {
  const subtopicId = parsePositiveInteger(request.params.subtopicId);

  if (!subtopicId) {
    response.status(400).json({ message: "O ID do subtópico é inválido." });
    return;
  }

  const knowledge = await getKnowledgeBySubtopic(subtopicId);
  response.status(200).json(knowledge);
}
