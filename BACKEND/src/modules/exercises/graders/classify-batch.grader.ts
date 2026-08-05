import { AppError } from "../../../errors/AppError.js";
import { ExerciseType, type ClassifyBatchResult, type PendingExercise } from "../exercise.types.js";

type Pending = Extract<PendingExercise, { type: ExerciseType.CLASSIFY_BATCH }>;
export function gradeClassifyBatch(pending: Pending, assignments: Array<{ itemId: number; categoryId: number }>): ClassifyBatchResult {
  const itemIds = assignments.map((value) => value.itemId);
  if (new Set(itemIds).size !== itemIds.length) throw new AppError("Um item não pode ser classificado mais de uma vez.", 400);
  if (assignments.length !== pending.knowledgeItemIds.length || pending.knowledgeItemIds.some((id) => !itemIds.includes(id))) throw new AppError("Todos os itens do exercício devem ser classificados.", 400);
  if (assignments.some((entry) => !pending.knowledgeItemIds.includes(entry.itemId) || !pending.answerKey.categoryIds.includes(entry.categoryId))) throw new AppError("A resposta contém item ou categoria externa ao exercício.", 400);
  const categories = pending.payload.categories;
  const items = pending.answerKey.items.map((item) => {
    const selectedId = assignments.find((entry) => entry.itemId === item.id)!.categoryId;
    const selectedCategory = categories.find((category) => category.id === selectedId)!;
    return { itemId: item.id, label: item.text, selectedCategory, correctCategory: item.correctCategory, isCorrect: selectedId === item.correctCategory.id, explanation: item.explanation, reference: item.reference };
  });
  const correctCount = items.filter((item) => item.isCorrect).length;
  return { exerciseId: pending.exerciseId, type: ExerciseType.CLASSIFY_BATCH, isCorrect: correctCount === items.length, correctCount, totalCount: items.length, score: correctCount / items.length, items };
}
