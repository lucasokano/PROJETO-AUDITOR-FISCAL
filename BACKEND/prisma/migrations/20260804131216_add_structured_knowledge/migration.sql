-- CreateTable
CREATE TABLE "knowledge_items" (
    "id" SERIAL NOT NULL,
    "subtopic_id" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "explanation" TEXT,
    "reference" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "knowledge_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "classification_groups" (
    "id" SERIAL NOT NULL,
    "subtopic_id" INTEGER NOT NULL,
    "name" VARCHAR(160) NOT NULL,
    "instruction" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "classification_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "classification_categories" (
    "id" SERIAL NOT NULL,
    "group_id" INTEGER NOT NULL,
    "name" VARCHAR(160) NOT NULL,
    "display_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "classification_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "item_classifications" (
    "id" SERIAL NOT NULL,
    "item_id" INTEGER NOT NULL,
    "category_id" INTEGER NOT NULL,

    CONSTRAINT "item_classifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "knowledge_item_progress" (
    "id" SERIAL NOT NULL,
    "item_id" INTEGER NOT NULL,
    "total_attempts" INTEGER NOT NULL DEFAULT 0,
    "correct_attempts" INTEGER NOT NULL DEFAULT 0,
    "incorrect_attempts" INTEGER NOT NULL DEFAULT 0,
    "consecutive_correct" INTEGER NOT NULL DEFAULT 0,
    "last_result" BOOLEAN,
    "last_answered_at" TIMESTAMP(3),
    "next_review_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "knowledge_item_progress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "knowledge_items_subtopic_id_idx" ON "knowledge_items"("subtopic_id");

-- CreateIndex
CREATE INDEX "classification_groups_subtopic_id_idx" ON "classification_groups"("subtopic_id");

-- CreateIndex
CREATE UNIQUE INDEX "classification_groups_subtopic_id_name_key" ON "classification_groups"("subtopic_id", "name");

-- CreateIndex
CREATE INDEX "classification_categories_group_id_idx" ON "classification_categories"("group_id");

-- CreateIndex
CREATE UNIQUE INDEX "classification_categories_group_id_name_key" ON "classification_categories"("group_id", "name");

-- CreateIndex
CREATE INDEX "item_classifications_item_id_idx" ON "item_classifications"("item_id");

-- CreateIndex
CREATE INDEX "item_classifications_category_id_idx" ON "item_classifications"("category_id");

-- CreateIndex
CREATE UNIQUE INDEX "item_classifications_item_id_category_id_key" ON "item_classifications"("item_id", "category_id");

-- CreateIndex
CREATE UNIQUE INDEX "knowledge_item_progress_item_id_key" ON "knowledge_item_progress"("item_id");

-- CreateIndex
CREATE INDEX "knowledge_item_progress_next_review_at_idx" ON "knowledge_item_progress"("next_review_at");

-- AddForeignKey
ALTER TABLE "knowledge_items" ADD CONSTRAINT "knowledge_items_subtopic_id_fkey" FOREIGN KEY ("subtopic_id") REFERENCES "subtopics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "classification_groups" ADD CONSTRAINT "classification_groups_subtopic_id_fkey" FOREIGN KEY ("subtopic_id") REFERENCES "subtopics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "classification_categories" ADD CONSTRAINT "classification_categories_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "classification_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_classifications" ADD CONSTRAINT "item_classifications_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "knowledge_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_classifications" ADD CONSTRAINT "item_classifications_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "classification_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "knowledge_item_progress" ADD CONSTRAINT "knowledge_item_progress_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "knowledge_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;
