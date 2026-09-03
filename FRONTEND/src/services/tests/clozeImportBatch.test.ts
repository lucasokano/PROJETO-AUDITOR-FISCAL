/// <reference types="node" />

import assert from "node:assert/strict";
import test from "node:test";
import { createClozeImportBatches } from "../clozeImportBatch.ts";

test("divide arquivos com mais de cem questões e preserva o contexto", () => {
  const questions = Array.from({ length: 205 }, (_, index) => `Questão ${index + 1} com {{resposta}}.`);
  const source = `[Tópico: Constitucional]\n[Subtópico: Direitos]\n${questions.join("\n")}`;
  const batches = createClozeImportBatches(source);

  assert.deepEqual(batches.map((batch) => batch.sourceLines.length), [100, 100, 5]);
  assert.ok(batches.every((batch) => batch.text.startsWith("[Tópico: Constitucional]\n[Subtópico: Direitos]")));
  assert.deepEqual(batches[2]?.sourceLines, [203, 204, 205, 206, 207]);
});

test("mantém os números originais e o contexto de cada questão", () => {
  const source = "Questão sem contexto {{A}}.\n\n[Tópico: T1]\n[Subtópico: S1]\nQuestão válida {{B}}.";
  const [batch] = createClozeImportBatches(source);

  assert.deepEqual(batch?.sourceLines, [1, 5]);
  assert.equal(batch?.text, "Questão sem contexto {{A}}.\n[Tópico: T1]\n[Subtópico: S1]\nQuestão válida {{B}}.");
});
