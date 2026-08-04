import { Check, X } from "lucide-react";

interface StatementCardProps {
  text: string;
  disabled?: boolean;
  onAnswer: (answer: boolean) => void;
}

export function StatementCard({
  text,
  disabled = false,
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
          disabled={disabled}
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
          disabled={disabled}
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
