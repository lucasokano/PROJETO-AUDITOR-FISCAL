import { ClassificationExercise } from "./ClassificationExercise";
import {
  ExerciseType,
  type ExerciseResult,
  type PresentedExercise,
} from "../../types/exercise";

interface ExerciseRendererProps {
  exercise: PresentedExercise;
  result: ExerciseResult | null;
  selectedCategoryId: number | null;
  isSubmitting: boolean;
  onSelect: (categoryId: number) => void;
  onSubmit: () => void;
  onNext: () => void;
}

export function ExerciseRenderer(props: ExerciseRendererProps) {
  switch (props.exercise.type) {
    case ExerciseType.CLASSIFY_ONE:
      return <ClassificationExercise {...props} />;
  }
}
