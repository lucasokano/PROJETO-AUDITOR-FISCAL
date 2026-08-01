-- CreateTable
CREATE TABLE "statement_progress" (
    "id" SERIAL NOT NULL,
    "statement_id" INTEGER NOT NULL,
    "total_attempts" INTEGER NOT NULL DEFAULT 0,
    "correct_attempts" INTEGER NOT NULL DEFAULT 0,
    "incorrect_attempts" INTEGER NOT NULL DEFAULT 0,
    "consecutive_correct" INTEGER NOT NULL DEFAULT 0,
    "last_result" BOOLEAN,
    "last_answered_at" TIMESTAMP(3),
    "next_review_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "statement_progress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "statement_progress_statement_id_key" ON "statement_progress"("statement_id");

-- CreateIndex
CREATE INDEX "statement_progress_next_review_at_idx" ON "statement_progress"("next_review_at");

-- CreateIndex
CREATE INDEX "statement_progress_last_result_idx" ON "statement_progress"("last_result");

-- CreateIndex
CREATE INDEX "answer_attempts_is_correct_idx" ON "answer_attempts"("is_correct");

-- AddForeignKey
ALTER TABLE "statement_progress" ADD CONSTRAINT "statement_progress_statement_id_fkey" FOREIGN KEY ("statement_id") REFERENCES "statements"("id") ON DELETE CASCADE ON UPDATE CASCADE;
