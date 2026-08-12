import { prisma } from "../../config/prisma.js";
import { AppError } from "../../errors/AppError.js";

const GAP_PATTERN = /\{\{\s*([^{}]+?)\s*\}\}/g;
const HAS_GAP_PATTERN = /\{\{\s*[^{}]+?\s*\}\}/;

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
