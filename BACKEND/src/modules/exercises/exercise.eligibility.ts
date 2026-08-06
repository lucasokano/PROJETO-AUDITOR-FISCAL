import { ExerciseType, type ExerciseSource, type SourceItem } from "./exercise.types.js";

export function getClassifiableItems(source: ExerciseSource) {
  return source.subtopic.knowledgeItems.filter((item) => item.classifications.length === 1);
}

export function groupItemsByCategory(items: SourceItem[]) {
  const groups = new Map<number, SourceItem[]>();
  for (const item of items) {
    const categoryId = item.classifications[0]?.category.id;
    if (!categoryId) continue;
    groups.set(categoryId, [...(groups.get(categoryId) ?? []), item]);
  }
  return groups;
}

export function getEligibleTypes(source: ExerciseSource): ExerciseType[] {
  const items = getClassifiableItems(source);
  const byCategory = groupItemsByCategory(items);
  const populatedCategories = [...byCategory.values()].filter((values) => values.length > 0);
  const hasTwoCategories = source.categories.length >= 2;
  const eligible: ExerciseType[] = [];

  if (hasTwoCategories && items.length >= 1) eligible.push(ExerciseType.CLASSIFY_ONE, ExerciseType.TRUE_FALSE);
  if (hasTwoCategories && items.length >= 1) eligible.push(ExerciseType.CLASSIFY_BATCH);
  if (hasTwoCategories && items.length >= 3 && populatedCategories.length >= 2 && populatedCategories.some((values) => items.length - values.length >= 2)) eligible.push(ExerciseType.SINGLE_CHOICE);
  if (hasTwoCategories && items.length >= 4 && populatedCategories.some((values) => values.length >= 2 && items.length - values.length >= 1)) eligible.push(ExerciseType.MULTIPLE_SELECT);
  return eligible;
}
