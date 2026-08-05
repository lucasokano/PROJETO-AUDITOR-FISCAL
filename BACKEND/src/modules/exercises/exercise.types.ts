export enum ExerciseType {
  CLASSIFY_ONE = "CLASSIFY_ONE",
  CLASSIFY_BATCH = "CLASSIFY_BATCH",
  TRUE_FALSE = "TRUE_FALSE",
  SINGLE_CHOICE = "SINGLE_CHOICE",
  MULTIPLE_SELECT = "MULTIPLE_SELECT",
}

export interface ExerciseOption { id: number; label: string }
export interface ExerciseItemOption { itemId: number; label: string }

interface ExerciseBase<T extends ExerciseType, P> {
  exerciseId: string;
  type: T;
  payload: P;
}

export type ClassifyOneExercise = ExerciseBase<ExerciseType.CLASSIFY_ONE, {
  prompt: string; itemText: string; groupName: string;
  instruction: string | null; options: ExerciseOption[];
}>;
export type ClassifyBatchExercise = ExerciseBase<ExerciseType.CLASSIFY_BATCH, {
  prompt: string; groupName: string; instruction: string | null;
  items: ExerciseItemOption[]; categories: ExerciseOption[];
}>;
export type TrueFalseExercise = ExerciseBase<ExerciseType.TRUE_FALSE, {
  statement: string; groupName: string; instruction: string | null;
}>;
export type SingleChoiceExercise = ExerciseBase<ExerciseType.SINGLE_CHOICE, {
  prompt: string; groupName: string; category: ExerciseOption;
  options: ExerciseItemOption[];
}>;
export type MultipleSelectExercise = ExerciseBase<ExerciseType.MULTIPLE_SELECT, {
  prompt: string; groupName: string; category: ExerciseOption;
  options: ExerciseItemOption[];
}>;

export type PresentedExercise = ClassifyOneExercise | ClassifyBatchExercise |
  TrueFalseExercise | SingleChoiceExercise | MultipleSelectExercise;

export type SubmittedAnswer =
  | { exerciseId: string; type: ExerciseType.CLASSIFY_ONE; answer: { categoryId: number } }
  | { exerciseId: string; type: ExerciseType.CLASSIFY_BATCH; answer: { assignments: Array<{ itemId: number; categoryId: number }> } }
  | { exerciseId: string; type: ExerciseType.TRUE_FALSE; answer: { value: boolean } }
  | { exerciseId: string; type: ExerciseType.SINGLE_CHOICE; answer: { itemId: number } }
  | { exerciseId: string; type: ExerciseType.MULTIPLE_SELECT; answer: { selectedItemIds: number[] } };

interface ResultBase<T extends ExerciseType> { exerciseId: string; type: T; isCorrect: boolean }
export type ClassifyOneResult = ResultBase<ExerciseType.CLASSIFY_ONE> & {
  correctAnswer: ExerciseOption; explanation: string | null; reference: string | null;
};
export interface BatchItemResult {
  itemId: number; label: string; selectedCategory: ExerciseOption;
  correctCategory: ExerciseOption; isCorrect: boolean;
  explanation: string | null; reference: string | null;
}
export type ClassifyBatchResult = ResultBase<ExerciseType.CLASSIFY_BATCH> & {
  correctCount: number; totalCount: number; score: number; items: BatchItemResult[];
};
export type TrueFalseResult = ResultBase<ExerciseType.TRUE_FALSE> & {
  correctAnswer: boolean; explanation: string | null; reference: string | null;
};
export type SingleChoiceResult = ResultBase<ExerciseType.SINGLE_CHOICE> & {
  selectedAnswer: ExerciseItemOption; correctAnswer: ExerciseItemOption;
  explanation: string | null; reference: string | null;
};
export interface MultipleSelectItemResult {
  itemId: number; label: string; shouldBeSelected: boolean; wasSelected: boolean;
  isCorrect: boolean; explanation: string | null; reference: string | null;
}
export type MultipleSelectResult = ResultBase<ExerciseType.MULTIPLE_SELECT> & {
  score: number; selectedItemIds: number[]; correctItemIds: number[];
  incorrectlySelectedItemIds: number[]; missedItemIds: number[];
  items: MultipleSelectItemResult[];
};
export type ExerciseResult = ClassifyOneResult | ClassifyBatchResult |
  TrueFalseResult | SingleChoiceResult | MultipleSelectResult;

export interface SourceCategory { id: number; name: string }
export interface SourceItem {
  id: number; text: string; explanation: string | null; reference: string | null;
  classifications: Array<{ category: SourceCategory }>;
}
export interface ExerciseSource {
  id: number; name: string; instruction: string | null;
  categories: SourceCategory[]; subtopic: { knowledgeItems: SourceItem[] };
}

interface PendingBase<T extends ExerciseType, P, K> {
  exerciseId: string; type: T; subtopicId: number; groupId: number;
  knowledgeItemIds: number[]; payload: P; answerKey: K;
  createdAt: number; expiresAt: number; snapshotVersion: 1;
}
export type PendingExercise =
  | PendingBase<ExerciseType.CLASSIFY_ONE, ClassifyOneExercise["payload"], { correctAnswer: ExerciseOption; optionIds: number[]; explanation: string | null; reference: string | null }>
  | PendingBase<ExerciseType.CLASSIFY_BATCH, ClassifyBatchExercise["payload"], { items: Array<SourceItem & { correctCategory: ExerciseOption }>; categoryIds: number[] }>
  | PendingBase<ExerciseType.TRUE_FALSE, TrueFalseExercise["payload"], { correctAnswer: boolean; explanation: string | null; reference: string | null }>
  | PendingBase<ExerciseType.SINGLE_CHOICE, SingleChoiceExercise["payload"], { correctItem: ExerciseItemOption; optionIds: number[]; explanation: string | null; reference: string | null }>
  | PendingBase<ExerciseType.MULTIPLE_SELECT, MultipleSelectExercise["payload"], { correctItemIds: number[]; items: SourceItem[]; optionIds: number[] }>;

export interface GeneratedExercise { presented: PresentedExercise; pending: PendingExercise }
export interface ExerciseGroupAvailability { id: number; name: string; instruction: string | null; eligibleTypes: ExerciseType[] }
