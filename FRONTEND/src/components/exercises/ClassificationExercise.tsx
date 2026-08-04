import type {
  ExerciseResult,
  PresentedExercise,
} from "../../types/exercise";

interface ClassificationExerciseProps {
  exercise: PresentedExercise;
  result: ExerciseResult | null;
  selectedCategoryId: number | null;
  isSubmitting: boolean;
  onSelect: (categoryId: number) => void;
  onSubmit: () => void;
  onNext: () => void;
}

export function ClassificationExercise({
  exercise,
  result,
  selectedCategoryId,
  isSubmitting,
  onSelect,
  onSubmit,
  onNext,
}: ClassificationExerciseProps) {
  return (
    <article className="exercise-card">
      <header className="exercise-card-heading">
        <span>{exercise.payload.groupName}</span>
        <h3>{exercise.payload.prompt}</h3>
        {exercise.payload.instruction && (
          <p>{exercise.payload.instruction}</p>
        )}
      </header>

      <div className="exercise-options">
        {exercise.payload.options.map((option) => {
          const isSelected = selectedCategoryId === option.id;
          const isCorrect = result?.correctAnswer.id === option.id;

          return (
            <label
              key={option.id}
              className={`exercise-option ${
                isSelected ? "exercise-option-selected" : ""
              } ${
                result && isCorrect ? "exercise-option-correct" : ""
              }`}
            >
              <input
                type="radio"
                name="exercise-category"
                value={option.id}
                checked={isSelected}
                disabled={isSubmitting || result !== null}
                onChange={() => onSelect(option.id)}
              />
              <span>{option.label}</span>
            </label>
          );
        })}
      </div>

      {!result ? (
        <button
          type="button"
          className="exercise-primary-button"
          disabled={selectedCategoryId === null || isSubmitting}
          onClick={onSubmit}
        >
          {isSubmitting ? "Enviando..." : "Responder"}
        </button>
      ) : (
        <section
          className={`exercise-feedback ${
            result.isCorrect
              ? "exercise-feedback-correct"
              : "exercise-feedback-incorrect"
          }`}
        >
          <strong>
            {result.isCorrect ? "Correto" : "Incorreto"}
          </strong>

          {!result.isCorrect && (
            <p>
              Resposta correta: {result.correctAnswer.label}
            </p>
          )}

          {result.explanation && <p>{result.explanation}</p>}
          {result.reference && (
            <p className="exercise-reference">
              Referência: {result.reference}
            </p>
          )}

          <button
            type="button"
            className="exercise-primary-button"
            onClick={onNext}
          >
            Próximo exercício
          </button>
        </section>
      )}
    </article>
  );
}
