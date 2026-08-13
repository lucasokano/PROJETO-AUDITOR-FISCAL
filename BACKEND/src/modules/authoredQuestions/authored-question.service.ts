import { prisma } from "../../config/prisma.js";
import { AppError } from "../../errors/AppError.js";

const GAP_PATTERN = /\{\{\s*([^{}]+?)\s*\}\}/g;
const HAS_GAP_PATTERN = /\{\{\s*[^{}]+?\s*\}\}/;
const TOPIC_HEADER = /^\[Tópico:\s*(.+)]$/i;
const SUBTOPIC_HEADER = /^\[Subtópico:\s*(.+)]$/i;

export interface ClozeImportPreviewItem {
  line: number;
  topic: string;
  subtopic: string;
  text: string;
  answers: string[];
  valid: boolean;
  message: string | null;
  willCreateTopic: boolean;
  willCreateSubtopic: boolean;
}

function slugify(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function parseClozeImport(text: string) {
  let topic = "";
  let subtopic = "";
  const items: Array<{ line: number; topic: string; subtopic: string; text: string; answers: string[]; parseError?: string }> = [];
  text.replace(/^\uFEFF/, "").split(/\r?\n/).forEach((rawLine, index) => {
    const line = rawLine.trim();
    if (!line) return;
    const topicMatch = line.match(TOPIC_HEADER);
    if (topicMatch) { topic = topicMatch[1]!.trim(); subtopic = ""; return; }
    const subtopicMatch = line.match(SUBTOPIC_HEADER);
    if (subtopicMatch) { subtopic = subtopicMatch[1]!.trim(); return; }
    const answers = Array.from(line.matchAll(GAP_PATTERN), (match) => match[1]!.trim());
    items.push({ line: index + 1, topic, subtopic, text: line, answers,
      parseError: !topic ? "Informe [Tópico: ...] antes da questão."
        : !subtopic ? "Informe [Subtópico: ...] antes da questão."
        : answers.length === 0 ? "A questão precisa de pelo menos uma lacuna {{...}}."
        : answers.some((answer) => !answer) ? "Há uma lacuna vazia." : undefined });
  });
  return items;
}

export async function previewClozeImport(input: { disciplineId: number; text: string; createMissing: boolean }) {
  const discipline = await prisma.discipline.findUnique({
    where: { id: input.disciplineId },
    include: { topics: { include: { subtopics: true } } },
  });
  if (!discipline) throw new AppError("Disciplina não encontrada.", 404);

  return parseClozeImport(input.text).map<ClozeImportPreviewItem>((item) => {
    const topic = discipline.topics.find((candidate) => candidate.name.localeCompare(item.topic, "pt-BR", { sensitivity: "base" }) === 0);
    const subtopic = topic?.subtopics.find((candidate) => candidate.name.localeCompare(item.subtopic, "pt-BR", { sensitivity: "base" }) === 0);
    const willCreateTopic = Boolean(item.topic && !topic);
    const willCreateSubtopic = Boolean(item.subtopic && (!topic || !subtopic));
    let message = item.parseError ?? null;
    if (!message && !topic && !input.createMissing) message = "Tópico não encontrado na disciplina selecionada.";
    if (!message && topic && !subtopic && !input.createMissing) message = "Subtópico não encontrado no tópico atual.";
    return { ...item, valid: !message, message, willCreateTopic, willCreateSubtopic };
  });
}

export async function importClozeQuestions(input: { disciplineId: number; text: string; createMissing: boolean }) {
  const preview = await previewClozeImport(input);
  const results: Array<ClozeImportPreviewItem & { imported: boolean }> = [];
  const topicCache = new Map<string, { id: number; name: string }>();
  const subtopicCache = new Map<string, { id: number; name: string }>();

  for (const item of preview) {
    if (!item.valid) { results.push({ ...item, imported: false }); continue; }
    try {
      const topicKey = item.topic.toLocaleLowerCase("pt-BR");
      let topic = topicCache.get(topicKey) ?? await prisma.topic.findFirst({ where: { disciplineId: input.disciplineId, name: { equals: item.topic, mode: "insensitive" } }, select: { id: true, name: true } });
      if (!topic && input.createMissing) topic = await prisma.topic.create({ data: { disciplineId: input.disciplineId, name: item.topic, slug: slugify(item.topic) }, select: { id: true, name: true } });
      if (!topic) throw new Error("Tópico não encontrado.");
      topicCache.set(topicKey, topic);

      const subtopicKey = `${topic.id}:${item.subtopic.toLocaleLowerCase("pt-BR")}`;
      let subtopic = subtopicCache.get(subtopicKey) ?? await prisma.subtopic.findFirst({ where: { topicId: topic.id, name: { equals: item.subtopic, mode: "insensitive" } }, select: { id: true, name: true } });
      if (!subtopic && input.createMissing) subtopic = await prisma.subtopic.create({ data: { topicId: topic.id, name: item.subtopic, slug: slugify(item.subtopic) }, select: { id: true, name: true } });
      if (!subtopic) throw new Error("Subtópico não encontrado.");
      subtopicCache.set(subtopicKey, subtopic);
      await prisma.clozeQuestion.create({ data: { subtopicId: subtopic.id, textWithAnswers: item.text } });
      results.push({ ...item, imported: true });
    } catch (error) {
      results.push({ ...item, imported: false, valid: false, message: error instanceof Error ? error.message : "Falha ao importar a questão." });
    }
  }
  return { created: results.filter((item) => item.imported).length, failed: results.filter((item) => !item.imported).length, items: results };
}

function requiredText(value: string, label: string) {
  const normalized = value.trim();
  if (!normalized) throw new AppError(`${label} é obrigatório.`);
  return normalized;
}

async function ensureSubtopic(subtopicId: number) {
  const subtopic = await prisma.subtopic.findUnique({ where: { id: subtopicId }, select: { id: true } });
  if (!subtopic) throw new AppError("Subtópico não encontrado.", 404);
}

function validClozeText(value: string) {
  const textWithAnswers = requiredText(value, "O texto com lacunas");
  if (!HAS_GAP_PATTERN.test(textWithAnswers)) {
    throw new AppError("Marque pelo menos uma lacuna envolvendo o gabarito com {{chaves}}.");
  }
  return textWithAnswers;
}

export async function createConceptQuestion(input: { subtopicId: number; question: string; answer: string }) {
  await ensureSubtopic(input.subtopicId);
  return prisma.conceptQuestion.create({ data: {
    subtopicId: input.subtopicId,
    question: requiredText(input.question, "A pergunta"),
    answer: requiredText(input.answer, "A resposta"),
  } });
}

export function listConceptQuestions() {
  return prisma.conceptQuestion.findMany({
    include: { subtopic: { include: { topic: { include: { discipline: true } } } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function updateConceptQuestion(id: number, input: { subtopicId: number; question: string; answer: string; isActive?: boolean }) {
  await ensureSubtopic(input.subtopicId);
  return prisma.conceptQuestion.update({ where: { id }, data: {
    subtopicId: input.subtopicId,
    question: requiredText(input.question, "A pergunta"),
    answer: requiredText(input.answer, "A resposta"),
    isActive: input.isActive,
  } });
}

export function deleteConceptQuestion(id: number) {
  return prisma.conceptQuestion.delete({ where: { id } });
}

export function listStudyConceptQuestions(subtopicId: number) {
  return prisma.conceptQuestion.findMany({
    where: { subtopicId, isActive: true },
    select: { id: true, subtopicId: true, question: true },
    orderBy: { createdAt: "asc" },
  });
}

export async function revealConceptAnswer(id: number) {
  const question = await prisma.conceptQuestion.findFirst({ where: { id, isActive: true }, select: { id: true, answer: true } });
  if (!question) throw new AppError("Questão conceitual não encontrada ou inativa.", 404);
  return { questionId: question.id, answer: question.answer, graded: false as const };
}

export async function createClozeQuestion(input: { subtopicId: number; textWithAnswers: string }) {
  await ensureSubtopic(input.subtopicId);
  return prisma.clozeQuestion.create({ data: { subtopicId: input.subtopicId, textWithAnswers: validClozeText(input.textWithAnswers) } });
}

export function listClozeQuestions() {
  return prisma.clozeQuestion.findMany({
    include: { subtopic: { include: { topic: { include: { discipline: true } } } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function updateClozeQuestion(id: number, input: { subtopicId: number; textWithAnswers: string; isActive?: boolean }) {
  await ensureSubtopic(input.subtopicId);
  return prisma.clozeQuestion.update({ where: { id }, data: {
    subtopicId: input.subtopicId,
    textWithAnswers: validClozeText(input.textWithAnswers),
    isActive: input.isActive,
  } });
}

export function deleteClozeQuestion(id: number) {
  return prisma.clozeQuestion.delete({ where: { id } });
}

export async function listStudyClozeQuestions(subtopicId: number) {
  const questions = await prisma.clozeQuestion.findMany({
    where: { subtopicId, isActive: true },
    select: { id: true, subtopicId: true, textWithAnswers: true },
    orderBy: { createdAt: "asc" },
  });
  return questions.map(({ textWithAnswers, ...question }) => ({
    ...question,
    text: textWithAnswers.replace(GAP_PATTERN, "__________"),
    gapCount: Array.from(textWithAnswers.matchAll(GAP_PATTERN)).length,
  }));
}

export async function revealClozeAnswer(id: number) {
  const question = await prisma.clozeQuestion.findFirst({ where: { id, isActive: true }, select: { id: true, textWithAnswers: true } });
  if (!question) throw new AppError("Questão de lacuna não encontrada ou inativa.", 404);
  const gaps: string[] = [];
  const answer = question.textWithAnswers.replace(GAP_PATTERN, (_match, gap: string) => {
    const normalized = gap.trim();
    gaps.push(normalized);
    return normalized;
  });
  return { questionId: question.id, answer, gaps, graded: false as const };
}
