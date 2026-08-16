import assert from "node:assert/strict";
import test from "node:test";
import { toStudyClozeQuestion } from "../authored-question.service.js";

test("questão de lacuna entrega enunciado e gabarito no mesmo payload", () => {
  const result = toStudyClozeQuestion({
    id: 1,
    subtopicId: 2,
    textWithAnswers: "A {{lei}} protege o {{direito}}.",
    isDifficult: false,
  });
  assert.equal(result.text, "A __________ protege o __________.");
  assert.equal(result.answer, "A lei protege o direito.");
  assert.deepEqual(result.answers, ["lei", "direito"]);
  assert.equal(result.gapCount, 2);
  assert.equal("textWithAnswers" in result, false);
});
