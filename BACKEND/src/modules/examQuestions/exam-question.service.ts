import { prisma } from "../../config/prisma.js";
import { AppError } from "../../errors/AppError.js";

export interface QuestionOptionInput {
  text: string;
  isCorrect: boolean;
}

export interface QuestionInput {
  subtopicId: number;
  boardId: number | null;
  examId: number | null;
  text: string;
  explanation?: string | null;
  isActive?: boolean;
  options: QuestionOptionInput[];
}

const questionInclude = {
  board: true,
  exam: { include: { board: true } },
  subtopic: { include: { topic: { include: { discipline: true } } } },
  options: { orderBy: { displayOrder: "asc" as const } },
};

function cleanRequired(value: string, label: string) {
  const text = value.trim();
  if (!text) throw new AppError(`${label} é obrigatório.`);
  return text;
}

async function validateQuestion(input: QuestionInput) {
  const text = cleanRequired(input.text, "O enunciado");
  const options = input.options.map((option) => ({
    text: cleanRequired(option.text, "O texto da alternativa"),
    isCorrect: option.isCorrect,
  }));
  if (options.length < 2) throw new AppError("Informe pelo menos duas alternativas.");
  if (options.length > 5) throw new AppError("Informe no máximo cinco alternativas.");
  if (options.filter((option) => option.isCorrect).length !== 1) {
    throw new AppError("A questão deve possuir exatamente uma alternativa correta.");
  }
  let boardId = input.boardId;
  if (input.examId) {
    const exam = await prisma.exam.findUnique({ where: { id: input.examId } });
    if (!exam) throw new AppError("A prova informada não existe.", 404);
    if (boardId && boardId !== exam.boardId) {
      throw new AppError("A prova não pertence à banca selecionada.");
    }
    boardId = exam.boardId;
  }
  return { ...input, text, options, boardId };
}

export function listBoards() {
  return prisma.examBoard.findMany({ orderBy: { name: "asc" } });
}

export function createBoard(name: string) {
  return prisma.examBoard.create({ data: { name: cleanRequired(name, "O nome da banca") } });
}

export function updateBoard(id: number, name: string, isActive?: boolean) {
  return prisma.examBoard.update({ where: { id }, data: { name: cleanRequired(name, "O nome da banca"), isActive } });
}

export async function deleteBoard(id: number) {
  const references = await prisma.examBoard.findUnique({
    where: { id },
    select: { _count: { select: { exams: true, questions: true } } },
  });
  if (!references) throw new AppError("Banca não encontrada.", 404);
  if (references._count.exams || references._count.questions) {
    throw new AppError("A banca possui provas ou questões e não pode ser excluída.", 409);
  }
  await prisma.examBoard.delete({ where: { id } });
}

export function listExams() {
  return prisma.exam.findMany({ include: { board: true }, orderBy: [{ year: "desc" }, { name: "asc" }] });
}

export function createExam(input: { boardId: number; name: string; year?: number | null }) {
  return prisma.exam.create({
    data: { boardId: input.boardId, name: cleanRequired(input.name, "O nome da prova"), year: input.year },
    include: { board: true },
  });
}

export function updateExam(id: number, input: { boardId: number; name: string; year?: number | null; isActive?: boolean }) {
  return prisma.exam.update({
    where: { id },
    data: { boardId: input.boardId, name: cleanRequired(input.name, "O nome da prova"), year: input.year, isActive: input.isActive },
    include: { board: true },
  });
}

export async function deleteExam(id: number) {
  await prisma.exam.delete({ where: { id } });
}

export function listQuestions() {
  return prisma.examQuestion.findMany({ include: questionInclude, orderBy: { createdAt: "desc" } });
}

export function listStudyQuestions(subtopicId: number) {
  return prisma.examQuestion.findMany({
    where: { subtopicId, isActive: true },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      subtopicId: true,
      text: true,
      board: { select: { id: true, name: true } },
      exam: { select: { id: true, name: true, year: true } },
      options: {
        orderBy: { displayOrder: "asc" },
        select: { id: true, text: true, displayOrder: true },
      },
    },
  });
}

export async function gradeStudyQuestion(questionId: number, selectedOptionId: number) {
  const question = await prisma.examQuestion.findFirst({
    where: { id: questionId, isActive: true },
    select: {
      explanation: true,
      options: { select: { id: true, isCorrect: true } },
    },
  });
  if (!question) throw new AppError("Questão não encontrada ou inativa.", 404);
  const selected = question.options.find((option) => option.id === selectedOptionId);
  if (!selected) throw new AppError("A alternativa não pertence a esta questão.");
  const correct = question.options.find((option) => option.isCorrect);
  if (!correct) throw new AppError("A questão não possui gabarito válido.", 409);
  return {
    questionId,
    selectedOptionId,
    correctOptionId: correct.id,
    isCorrect: selected.isCorrect,
    explanation: question.explanation,
  };
}

export async function createQuestion(input: QuestionInput) {
  const valid = await validateQuestion(input);
  return prisma.examQuestion.create({
    data: {
      subtopicId: valid.subtopicId,
      boardId: valid.boardId,
      examId: valid.examId,
      text: valid.text,
      explanation: valid.explanation?.trim() || null,
      isActive: valid.isActive,
      options: { create: valid.options.map((option, displayOrder) => ({ ...option, displayOrder })) },
    },
    include: questionInclude,
  });
}

export async function updateQuestion(id: number, input: QuestionInput) {
  const valid = await validateQuestion(input);
  return prisma.$transaction(async (transaction) => {
    await transaction.examQuestionOption.deleteMany({ where: { questionId: id } });
    return transaction.examQuestion.update({
      where: { id },
      data: {
        subtopicId: valid.subtopicId,
        boardId: valid.boardId,
        examId: valid.examId,
        text: valid.text,
        explanation: valid.explanation?.trim() || null,
        isActive: valid.isActive,
        options: { create: valid.options.map((option, displayOrder) => ({ ...option, displayOrder })) },
      },
      include: questionInclude,
    });
  });
}

export async function deleteQuestion(id: number) {
  await prisma.examQuestion.delete({ where: { id } });
}
