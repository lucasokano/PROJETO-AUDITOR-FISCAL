import { useState, type DragEvent } from "react";
import type { ClassifyBatchExercise, ClassifyBatchResult } from "../../types/exercise";

interface Props {
  exercise: ClassifyBatchExercise;
  result: ClassifyBatchResult | null;
  isSubmitting: boolean;
  onSubmit: (answer: { assignments: Array<{ itemId: number; categoryId: number }> }) => void;
  onNext: () => void;
}

export function ClassificationBatchExercise({ exercise, result, isSubmitting, onSubmit, onNext }: Props) {
  const [assignments, setAssignments] = useState<Record<number, number>>({});

  function assign(itemId: number, categoryId: number) {
    if (!result) setAssignments((current) => ({ ...current, [itemId]: categoryId }));
  }

  function drop(event: DragEvent, categoryId: number) {
    event.preventDefault();
    const itemId = Number(event.dataTransfer.getData("text/plain"));
    if (itemId) assign(itemId, categoryId);
  }

  function startDragging(event: DragEvent, itemId: number) {
    event.dataTransfer.setData("text/plain", String(itemId));
  }

  const unassigned = exercise.payload.items.filter((item) => assignments[item.itemId] === undefined);
  const complete = Object.keys(assignments).length === exercise.payload.items.length;

  function getAttemptResultClass(itemId: number) {
    const itemResult = result?.items.find((item) => item.itemId === itemId);
    if (!itemResult) return "";
    return itemResult.isCorrect ? "batch-attempt-correct" : "batch-attempt-incorrect";
  }

  return (
    <article className="exercise-card exercise-batch">
      <header className="exercise-card-heading">
        <span>{exercise.payload.groupName}</span>
        <h3>{exercise.payload.prompt}</h3>
      </header>

      <section className="batch-item-source">
        <h4>Itens para classificar</h4>
        <div className="batch-item-pool">
          {unassigned.map((item) => (
            <div
              key={item.itemId}
              className="batch-item"
              draggable={!result}
              onDragStart={(event) => startDragging(event, item.itemId)}
            >
              <span>{item.label}</span>
            </div>
          ))}
          {!unassigned.length && <span className="batch-source-empty">Todos os itens foram distribuídos.</span>}
        </div>
      </section>

      <div className="batch-board">
        {exercise.payload.categories.map((category) => (
          <section
            key={category.id}
            className="batch-column"
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => drop(event, category.id)}
          >
            <h4>{category.label}</h4>
            {exercise.payload.items
              .filter((item) => assignments[item.itemId] === category.id)
              .map((item) => (
                <div
                  key={item.itemId}
                  className={`batch-item ${getAttemptResultClass(item.itemId)}`}
                  draggable={!result}
                  onDragStart={(event) => startDragging(event, item.itemId)}
                >
                  <span>{item.label}</span>
                </div>
              ))}
          </section>
        ))}
      </div>

      {!result ? (
        <button
          type="button"
          className="exercise-primary-button"
          disabled={!complete || isSubmitting}
          onClick={() => onSubmit({
            assignments: exercise.payload.items.map((item) => ({
              itemId: item.itemId,
              categoryId: assignments[item.itemId]!,
            })),
          })}
        >
          Responder
        </button>
      ) : (
        <div className="exercise-feedback">
          <section className="batch-answer-key">
            <h4>Gabarito</h4>
            <div className="batch-board batch-answer-board">
              {exercise.payload.categories.map((category) => (
                <section key={category.id} className="batch-column">
                  <h4>{category.label}</h4>
                  {result.items
                    .filter((item) => item.correctCategory.id === category.id)
                    .map((item) => (
                      <div key={item.itemId} className="batch-item batch-answer-item">
                        <span>{item.label}</span>
                      </div>
                    ))}
                </section>
              ))}
            </div>
          </section>
          <button type="button" className="exercise-primary-button" onClick={onNext}>Próximo exercício</button>
        </div>
      )}
    </article>
  );
}
