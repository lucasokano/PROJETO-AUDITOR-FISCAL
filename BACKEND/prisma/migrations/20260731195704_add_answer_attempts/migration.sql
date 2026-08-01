-- CreateTable
CREATE TABLE "answer_attempts" (
    "id" SERIAL NOT NULL,
    "statement_id" INTEGER NOT NULL,
    "selected_answer" BOOLEAN NOT NULL,
    "is_correct" BOOLEAN NOT NULL,
    "answered_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "answer_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "answer_attempts_statement_id_idx" ON "answer_attempts"("statement_id");

-- CreateIndex
CREATE INDEX "answer_attempts_answered_at_idx" ON "answer_attempts"("answered_at");

-- AddForeignKey
ALTER TABLE "answer_attempts" ADD CONSTRAINT "answer_attempts_statement_id_fkey" FOREIGN KEY ("statement_id") REFERENCES "statements"("id") ON DELETE CASCADE ON UPDATE CASCADE;
