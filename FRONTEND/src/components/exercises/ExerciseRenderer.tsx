import { ExerciseType, type ExerciseAnswerPayload, type ExerciseResult, type PresentedExercise } from "../../types/exercise";
import { ClassificationBatchExercise } from "./ClassificationBatchExercise";
import { ClassificationExercise } from "./ClassificationExercise";
import { MultipleSelectExercise } from "./MultipleSelectExercise";
import { SingleChoiceExercise } from "./SingleChoiceExercise";
import { TrueFalseExercise } from "./TrueFalseExercise";

interface Props { exercise: PresentedExercise; result: ExerciseResult | null; isSubmitting: boolean; onSubmit: (answer: ExerciseAnswerPayload) => void; onNext: () => void }
export function ExerciseRenderer({ exercise, result, ...shared }: Props) {
  switch (exercise.type) {
    case ExerciseType.CLASSIFY_ONE: return <ClassificationExercise exercise={exercise} result={result?.type === exercise.type ? result : null} {...shared} />;
    case ExerciseType.CLASSIFY_BATCH: return <ClassificationBatchExercise exercise={exercise} result={result?.type === exercise.type ? result : null} {...shared} />;
    case ExerciseType.TRUE_FALSE: return <TrueFalseExercise exercise={exercise} result={result?.type === exercise.type ? result : null} {...shared} />;
    case ExerciseType.SINGLE_CHOICE: return <SingleChoiceExercise exercise={exercise} result={result?.type === exercise.type ? result : null} {...shared} />;
    case ExerciseType.MULTIPLE_SELECT: return <MultipleSelectExercise exercise={exercise} result={result?.type === exercise.type ? result : null} {...shared} />;
    default: { const exhaustive: never = exercise; return exhaustive; }
  }
}
