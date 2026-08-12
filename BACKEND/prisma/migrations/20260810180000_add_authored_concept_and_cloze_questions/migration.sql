CREATE TABLE "concept_questions" (
    "id" SERIAL NOT NULL,
    "subtopic_id" INTEGER NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "concept_questions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "cloze_questions" (
    "id" SERIAL NOT NULL,
    "subtopic_id" INTEGER NOT NULL,
    "text_with_answers" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cloze_questions_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "concept_questions_subtopic_id_idx" ON "concept_questions"("subtopic_id");
CREATE INDEX "concept_questions_subtopic_id_is_active_idx" ON "concept_questions"("subtopic_id", "is_active");
CREATE INDEX "cloze_questions_subtopic_id_idx" ON "cloze_questions"("subtopic_id");
CREATE INDEX "cloze_questions_subtopic_id_is_active_idx" ON "cloze_questions"("subtopic_id", "is_active");

ALTER TABLE "concept_questions" ADD CONSTRAINT "concept_questions_subtopic_id_fkey"
FOREIGN KEY ("subtopic_id") REFERENCES "subtopics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "cloze_questions" ADD CONSTRAINT "cloze_questions_subtopic_id_fkey"
FOREIGN KEY ("subtopic_id") REFERENCES "subtopics"("id") ON DELETE CASCADE ON UPDATE CASCADE;
