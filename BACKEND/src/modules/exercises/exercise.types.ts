export enum ExerciseType {
  CLASSIFY_ONE = "CLASSIFY_ONE",
}

export interface ExerciseOption {
  id: number;
  label: string;
}

export interface ClassifyOnePayload {
  prompt: string;
  itemText: string;
  groupName: string;
  instruction: string | null;
  options: ExerciseOption[];
}

export interface PresentedExercise {
  exerciseId: string;
  type: ExerciseType.CLASSIFY_ONE;
  payload: ClassifyOnePayload;
}

export interface SubmittedAnswer {
  exerciseId: string;
  type: ExerciseType.CLASSIFY_ONE;
  answer: {
    categoryId: number;
  };
}

export interface ExerciseResult {
  exerciseId: string;
  type: ExerciseType.CLASSIFY_ONE;
  isCorrect: boolean;
  correctAnswer: ExerciseOption;
  explanation: string | null;
  reference: string | null;
}
