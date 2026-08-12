ALTER TABLE "knowledge_items"
DROP COLUMN IF EXISTS "concept_question",
DROP COLUMN IF EXISTS "concept_answer",
DROP COLUMN IF EXISTS "cloze_text";
