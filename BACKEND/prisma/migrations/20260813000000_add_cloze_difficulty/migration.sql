ALTER TABLE "cloze_questions"
ADD COLUMN "is_difficult" BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX "cloze_questions_subtopic_id_is_difficult_idx"
ON "cloze_questions"("subtopic_id", "is_difficult");
