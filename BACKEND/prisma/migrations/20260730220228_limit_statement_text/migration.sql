/*
  Warnings:

  - You are about to alter the column `text` on the `statements` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(2000)`.

*/
-- AlterTable
ALTER TABLE "statements" ALTER COLUMN "text" SET DATA TYPE VARCHAR(2000);

-- CreateIndex
CREATE INDEX "statements_subtopic_id_is_active_idx" ON "statements"("subtopic_id", "is_active");
