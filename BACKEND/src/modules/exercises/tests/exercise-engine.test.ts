import assert from "node:assert/strict";
import test from "node:test";
import { getEligibleTypes } from "../exercise.eligibility.js";
import { gradePendingExercise } from "../exercise.grader.js";
import { clearExerciseStoreForTests, consumePendingExercise, savePendingExercise } from "../exercise.store.js";
import { ExerciseType, type ExerciseSource, type GeneratedExercise, type SubmittedAnswer } from "../exercise.types.js";
import { generateClassifyBatch } from "../generators/classify-batch.generator.js";
import { generateClassifyOne } from "../generators/classify-one.generator.js";
import { generateMultipleSelect } from "../generators/multiple-select.generator.js";
import { generateSingleChoice } from "../generators/single-choice.generator.js";
import { generateTrueFalse } from "../generators/true-false.generator.js";

const categories = [{ id: 1, name: "A" }, { id: 2, name: "B" }, { id: 3, name: "C" }];
const source: ExerciseSource = { id: 10, name: "Grupo", instruction: null, categories, subtopic: { knowledgeItems: [
  { id: 1, text: "A1", explanation: "EA1", reference: "RA1", classifications: [{ category: categories[0]! }] },
  { id: 2, text: "A2", explanation: "EA2", reference: null, classifications: [{ category: categories[0]! }] },
  { id: 3, text: "A3", explanation: null, reference: null, classifications: [{ category: categories[0]! }] },
  { id: 4, text: "B1", explanation: "EB1", reference: "RB1", classifications: [{ category: categories[1]! }] },
  { id: 5, text: "B2", explanation: null, reference: null, classifications: [{ category: categories[1]! }] },
  { id: 6, text: "C1", explanation: null, reference: null, classifications: [{ category: categories[2]! }] },
] } };
const context = (id: string) => ({ exerciseId: id, subtopicId: 20, expiresAt: Date.now() + 60_000 });

test("elegibilidade informa os cinco tipos quando os dados permitem", () => {
  assert.deepEqual(new Set(getEligibleTypes(source)), new Set(Object.values(ExerciseType)));
});

test("CLASSIFY_ONE preserva opções embaralhadas sem expor gabarito", () => {
  const generated = generateClassifyOne(source, context("one"));
  assert.equal(generated.presented.type, ExerciseType.CLASSIFY_ONE);
  assert.equal("correctAnswer" in generated.presented.payload, false);
  const pending = generated.pending.type === ExerciseType.CLASSIFY_ONE ? generated.pending : assert.fail();
  const result = gradePendingExercise(pending, { exerciseId: "one", type: ExerciseType.CLASSIFY_ONE, answer: { categoryId: pending.answerKey.correctAnswer.id } });
  assert.equal(result.isCorrect, true);
});

test("CLASSIFY_BATCH não repete itens e calcula score individual", () => {
  const generated = generateClassifyBatch(source, { ...context("batch"), itemCount: 4 });
  const pending = generated.pending.type === ExerciseType.CLASSIFY_BATCH ? generated.pending : assert.fail();
  assert.equal(new Set(pending.knowledgeItemIds).size, pending.knowledgeItemIds.length);
  const assignments = pending.answerKey.items.map((item, index) => ({ itemId: item.id, categoryId: index === 0 ? categories.find((category) => category.id !== item.correctCategory.id)!.id : item.correctCategory.id }));
  const result = gradePendingExercise(pending, { exerciseId: "batch", type: ExerciseType.CLASSIFY_BATCH, answer: { assignments } });
  assert.equal(result.type, ExerciseType.CLASSIFY_BATCH); if (result.type !== ExerciseType.CLASSIFY_BATCH) return;
  assert.equal(result.correctCount, result.totalCount - 1); assert.equal(result.score, result.correctCount / result.totalCount);
  assert.throws(() => gradePendingExercise(pending, { exerciseId: "batch", type: ExerciseType.CLASSIFY_BATCH, answer: { assignments: assignments.slice(1) } }));
  assert.throws(() => gradePendingExercise(pending, { exerciseId: "batch", type: ExerciseType.CLASSIFY_BATCH, answer: { assignments: [{ ...assignments[0]!, itemId: 999 }, ...assignments.slice(1)] } }));
});

test("CLASSIFY_BATCH aceita um item e mantém todas as categorias como colunas", () => {
  const singleItemSource: ExerciseSource = {
    ...source,
    subtopic: { knowledgeItems: source.subtopic.knowledgeItems.slice(0, 1) },
  };
  assert.equal(getEligibleTypes(singleItemSource).includes(ExerciseType.CLASSIFY_BATCH), true);
  const generated = generateClassifyBatch(singleItemSource, { ...context("batch-one"), itemCount: 8 });
  assert.equal(generated.presented.type, ExerciseType.CLASSIFY_BATCH);
  if (generated.presented.type !== ExerciseType.CLASSIFY_BATCH || generated.pending.type !== ExerciseType.CLASSIFY_BATCH) return;
  assert.equal(generated.presented.payload.items.length, 1);
  assert.deepEqual(generated.presented.payload.categories.map((category) => category.id), categories.map((category) => category.id));
  const onlyItem = generated.pending.answerKey.items[0]!;
  const result = gradePendingExercise(generated.pending, { exerciseId: "batch-one", type: ExerciseType.CLASSIFY_BATCH, answer: { assignments: [{ itemId: onlyItem.id, categoryId: onlyItem.correctCategory.id }] } });
  assert.equal(result.isCorrect, true);
});

test("CLASSIFY_BATCH permite todos os itens na mesma categoria sem repetir para completar o lote", () => {
  const sameCategorySource: ExerciseSource = {
    ...source,
    categories: categories.slice(0, 2),
    subtopic: { knowledgeItems: source.subtopic.knowledgeItems.slice(0, 3) },
  };
  assert.equal(getEligibleTypes(sameCategorySource).includes(ExerciseType.CLASSIFY_BATCH), true);
  const generated = generateClassifyBatch(sameCategorySource, { ...context("batch-same"), itemCount: 8 });
  assert.equal(generated.pending.type, ExerciseType.CLASSIFY_BATCH);
  if (generated.pending.type !== ExerciseType.CLASSIFY_BATCH) return;
  assert.equal(generated.pending.knowledgeItemIds.length, 3);
  assert.equal(new Set(generated.pending.knowledgeItemIds).size, 3);
  assert.equal(new Set(generated.pending.answerKey.items.map((item) => item.correctCategory.id)).size, 1);
});

test("CLASSIFY_BATCH continua inelegível com uma única categoria", () => {
  const oneCategorySource: ExerciseSource = {
    ...source,
    categories: categories.slice(0, 1),
    subtopic: { knowledgeItems: source.subtopic.knowledgeItems.slice(0, 1) },
  };
  assert.equal(getEligibleTypes(oneCategorySource).includes(ExerciseType.CLASSIFY_BATCH), false);
});

test("TRUE_FALSE gera versões verdadeira e falsa sem campo de gabarito", () => {
  const truth = generateTrueFalse(source, { ...context("tf-t"), forceTruth: true });
  const falsehood = generateTrueFalse(source, { ...context("tf-f"), forceTruth: false });
  assert.equal("correctAnswer" in truth.presented.payload, false);
  assert.notEqual(truth.pending.type === ExerciseType.TRUE_FALSE && truth.pending.answerKey.correctAnswer, false);
  assert.equal(falsehood.pending.type === ExerciseType.TRUE_FALSE && falsehood.pending.answerKey.correctAnswer, false);
  const oneCategory = { ...source, categories: [categories[0]!], subtopic: { knowledgeItems: source.subtopic.knowledgeItems.slice(0, 1) } };
  assert.equal(getEligibleTypes(oneCategory).includes(ExerciseType.TRUE_FALSE), false);
});

test("SINGLE_CHOICE tem uma correta, opções únicas e distratores de outras categorias", () => {
  const generated = generateSingleChoice(source, context("single"));
  const pending = generated.pending.type === ExerciseType.SINGLE_CHOICE ? generated.pending : assert.fail();
  assert.equal(new Set(pending.answerKey.optionIds).size, pending.answerKey.optionIds.length);
  assert.equal(pending.answerKey.optionIds.filter((id) => id === pending.answerKey.correctItem.itemId).length, 1);
  assert.equal("correctItem" in generated.presented.payload, false);
});

test("MULTIPLE_SELECT corrige omissões, falsos positivos e resultados individuais", () => {
  const generated = generateMultipleSelect(source, { ...context("multi"), optionCount: 6 });
  const pending = generated.pending.type === ExerciseType.MULTIPLE_SELECT ? generated.pending : assert.fail();
  const correctIds = pending.answerKey.correctItemIds;
  const distractor = pending.answerKey.optionIds.find((id) => !correctIds.includes(id))!;
  assert.ok(correctIds.length >= 2); assert.ok(distractor); assert.equal(new Set(pending.answerKey.optionIds).size, pending.answerKey.optionIds.length);
  const selected = [correctIds[0]!, distractor];
  const result = gradePendingExercise(pending, { exerciseId: "multi", type: ExerciseType.MULTIPLE_SELECT, answer: { selectedItemIds: selected } });
  assert.equal(result.type, ExerciseType.MULTIPLE_SELECT); if (result.type !== ExerciseType.MULTIPLE_SELECT) return;
  assert.deepEqual(result.incorrectlySelectedItemIds, [distractor]); assert.ok(result.missedItemIds.length > 0); assert.equal(result.items.length, pending.answerKey.optionIds.length);
  assert.equal(result.score, Math.max(0, (1 - 1) / correctIds.length));
  assert.throws(() => gradePendingExercise(pending, { exerciseId: "multi", type: ExerciseType.MULTIPLE_SELECT, answer: { selectedItemIds: [999] } }));
  assert.throws(() => gradePendingExercise(pending, { exerciseId: "multi", type: ExerciseType.MULTIPLE_SELECT, answer: { selectedItemIds: [correctIds[0]!, correctIds[0]!] } }));
  assert.equal("correctItemIds" in generated.presented.payload, false);
});

test("store rejeita exercício expirado e permite consumo único", () => {
  clearExerciseStoreForTests();
  const generated = generateClassifyOne(source, context("store")); savePendingExercise(generated.pending);
  assert.ok(consumePendingExercise("store")); assert.equal(consumePendingExercise("store"), undefined);
  const expired = generateClassifyOne(source, { ...context("expired"), expiresAt: Date.now() - 1 }); savePendingExercise(expired.pending);
  assert.equal(consumePendingExercise("expired"), undefined);
});
