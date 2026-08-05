export const ExerciseType = {
  CLASSIFY_ONE: "CLASSIFY_ONE",
  CLASSIFY_BATCH: "CLASSIFY_BATCH",
  TRUE_FALSE: "TRUE_FALSE",
  SINGLE_CHOICE: "SINGLE_CHOICE",
  MULTIPLE_SELECT: "MULTIPLE_SELECT",
} as const;
export type ExerciseType = (typeof ExerciseType)[keyof typeof ExerciseType];
export interface ExerciseOption { id: number; label: string }
export interface ExerciseItemOption { itemId: number; label: string }
interface Base<T extends ExerciseType, P> { exerciseId: string; type: T; payload: P }
export type ClassifyOneExercise = Base<typeof ExerciseType.CLASSIFY_ONE, { prompt: string; itemText: string; groupName: string; instruction: string | null; options: ExerciseOption[] }>;
export type ClassifyBatchExercise = Base<typeof ExerciseType.CLASSIFY_BATCH, { prompt: string; groupName: string; instruction: string | null; items: ExerciseItemOption[]; categories: ExerciseOption[] }>;
export type TrueFalseExercise = Base<typeof ExerciseType.TRUE_FALSE, { statement: string; groupName: string; instruction: string | null }>;
export type SingleChoiceExercise = Base<typeof ExerciseType.SINGLE_CHOICE, { prompt: string; groupName: string; category: ExerciseOption; options: ExerciseItemOption[] }>;
export type MultipleSelectExercise = Base<typeof ExerciseType.MULTIPLE_SELECT, { prompt: string; groupName: string; category: ExerciseOption; options: ExerciseItemOption[] }>;
export type PresentedExercise = ClassifyOneExercise | ClassifyBatchExercise | TrueFalseExercise | SingleChoiceExercise | MultipleSelectExercise;
export type SubmittedAnswer =
  | { exerciseId: string; type: typeof ExerciseType.CLASSIFY_ONE; answer: { categoryId: number } }
  | { exerciseId: string; type: typeof ExerciseType.CLASSIFY_BATCH; answer: { assignments: Array<{ itemId: number; categoryId: number }> } }
  | { exerciseId: string; type: typeof ExerciseType.TRUE_FALSE; answer: { value: boolean } }
  | { exerciseId: string; type: typeof ExerciseType.SINGLE_CHOICE; answer: { itemId: number } }
  | { exerciseId: string; type: typeof ExerciseType.MULTIPLE_SELECT; answer: { selectedItemIds: number[] } };
interface ResultBase<T extends ExerciseType> { exerciseId: string; type: T; isCorrect: boolean }
export type ClassifyOneResult = ResultBase<typeof ExerciseType.CLASSIFY_ONE> & { correctAnswer: ExerciseOption; explanation: string | null; reference: string | null };
export type ClassifyBatchResult = ResultBase<typeof ExerciseType.CLASSIFY_BATCH> & { correctCount: number; totalCount: number; score: number; items: Array<{ itemId: number; label: string; selectedCategory: ExerciseOption; correctCategory: ExerciseOption; isCorrect: boolean; explanation: string | null; reference: string | null }> };
export type TrueFalseResult = ResultBase<typeof ExerciseType.TRUE_FALSE> & { correctAnswer: boolean; explanation: string | null; reference: string | null };
export type SingleChoiceResult = ResultBase<typeof ExerciseType.SINGLE_CHOICE> & { selectedAnswer: ExerciseItemOption; correctAnswer: ExerciseItemOption; explanation: string | null; reference: string | null };
export type MultipleSelectResult = ResultBase<typeof ExerciseType.MULTIPLE_SELECT> & { score: number; selectedItemIds: number[]; correctItemIds: number[]; incorrectlySelectedItemIds: number[]; missedItemIds: number[]; items: Array<{ itemId: number; label: string; shouldBeSelected: boolean; wasSelected: boolean; isCorrect: boolean; explanation: string | null; reference: string | null }> };
export type ExerciseResult = ClassifyOneResult | ClassifyBatchResult | TrueFalseResult | SingleChoiceResult | MultipleSelectResult;
export interface ExerciseGroup { id: number; name: string; instruction: string | null; eligibleTypes: ExerciseType[] }
export type ExerciseAnswerPayload = SubmittedAnswer["answer"];
