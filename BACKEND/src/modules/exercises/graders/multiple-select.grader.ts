import { AppError } from "../../../errors/AppError.js";
import { ExerciseType, type MultipleSelectResult, type PendingExercise } from "../exercise.types.js";
import { clamp } from "../exercise.utils.js";
type Pending = Extract<PendingExercise, { type: ExerciseType.MULTIPLE_SELECT }>;
export function gradeMultipleSelect(pending: Pending, selectedItemIds: number[]): MultipleSelectResult {
  if (new Set(selectedItemIds).size !== selectedItemIds.length) throw new AppError("A seleção contém itens duplicados.", 400);
  if (selectedItemIds.some((id) => !pending.answerKey.optionIds.includes(id))) throw new AppError("A seleção contém item externo ao exercício.", 400);
  const correct = new Set(pending.answerKey.correctItemIds);
  const selected = new Set(selectedItemIds);
  const truePositives = selectedItemIds.filter((id) => correct.has(id)).length;
  const incorrectlySelectedItemIds = selectedItemIds.filter((id) => !correct.has(id));
  const missedItemIds = pending.answerKey.correctItemIds.filter((id) => !selected.has(id));
  const score = clamp((truePositives - incorrectlySelectedItemIds.length) / correct.size);
  const items = pending.answerKey.items.map((item) => {
    const shouldBeSelected = correct.has(item.id); const wasSelected = selected.has(item.id);
    return { itemId: item.id, label: item.text, shouldBeSelected, wasSelected, isCorrect: shouldBeSelected === wasSelected, explanation: item.explanation, reference: item.reference };
  });
  return { exerciseId: pending.exerciseId, type: ExerciseType.MULTIPLE_SELECT, isCorrect: incorrectlySelectedItemIds.length === 0 && missedItemIds.length === 0, score, selectedItemIds, correctItemIds: pending.answerKey.correctItemIds, incorrectlySelectedItemIds, missedItemIds, items };
}
