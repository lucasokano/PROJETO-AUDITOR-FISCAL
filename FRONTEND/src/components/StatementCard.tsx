import { Check, X } from "lucide-react";

interface StatementCardProps {
  text: string;
  onAnswer: (answer: boolean) => void;
}

export function StatementCard({
  text,
  onAnswer,
}: StatementCardProps) {
  return (
    <article className="statement-row">
      <div className="statement-text">
        {text}
      </div>

      <div className="statement-answer-cell">
        <button
          type="button"
          className="answer-button answer-true"
          onClick={() => onAnswer(true)}
          aria-label="Marcar como verdadeiro"
          title="Verdadeiro"
        >
          <Check size={21} />
        </button>
      </div>

      <div className="statement-answer-cell">
        <button
          type="button"
          className="answer-button answer-false"
          onClick={() => onAnswer(false)}
          aria-label="Marcar como falso"
          title="Falso"
        >
          <X size={21} />
        </button>
      </div>
    </article>
  );
}