export const ExerciseType = {
  CLASSIFY_ONE: "CLASSIFY_ONE",
} as const;

export type ExerciseType =
  (typeof ExerciseType)[keyof typeof ExerciseType];

type ClassifyOneExerciseType =
  (typeof ExerciseType)["CLASSIFY_ONE"];

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
  type: ClassifyOneExerciseType;
  payload: ClassifyOnePayload;
}

export interface SubmittedAnswer {
  exerciseId: string;
  type: ClassifyOneExerciseType;
  answer: {
    categoryId: number;
  };
}

export interface ExerciseResult {
  exerciseId: string;
  type: ClassifyOneExerciseType;
  isCorrect: boolean;
  correctAnswer: ExerciseOption;
  explanation: string | null;
  reference: string | null;
}

export interface ExerciseGroup {
  id: number;
  name: string;
  instruction: string | null;
}
