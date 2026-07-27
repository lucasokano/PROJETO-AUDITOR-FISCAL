import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { StatementCard } from "../components/StatementCard";
import {
  findDiscipline,
  findTopic,
} from "../data/studyStructure";

interface Statement {
  id: number;
  text: string;
  correctAnswer: boolean;
  subtopicId: string;
}

interface AnswerResult {
  statementId: number;
  isCorrect: boolean;
}

const statements: Statement[] = [
  {
    id: 1,
    text: "O modelo OSI possui sete camadas.",
    correctAnswer: true,
    subtopicId: "modelo-osi",
  },
  {
    id: 2,
    text: "A camada de transporte é responsável pelo endereçamento IP.",
    correctAnswer: false,
    subtopicId: "modelo-osi",
  },
  {
    id: 3,
    text: "O TCP é um protocolo orientado à conexão.",
    correctAnswer: true,
    subtopicId: "tcp-ip",
  },
  {
    id: 4,
    text: "O UDP garante a entrega de todos os pacotes.",
    correctAnswer: false,
    subtopicId: "tcp-ip",
  },
  {
    id: 5,
    text: "O DNS converte nomes de domínio em endereços IP.",
    correctAnswer: true,
    subtopicId: "dns",
  },
  {
    id: 6,
    text: "Uma chave primária pode identificar registros de forma única.",
    correctAnswer: true,
    subtopicId: "modelo-relacional",
  },
  {
    id: 7,
    text: "A normalização busca reduzir redundâncias nos dados.",
    correctAnswer: true,
    subtopicId: "normalizacao",
  },
];

export function Discipline() {
  const { disciplineId, topicId, subtopicId } = useParams();

  const [answers, setAnswers] = useState<AnswerResult[]>([]);

  const discipline = findDiscipline(disciplineId);
  const topic = findTopic(disciplineId, topicId);

  const subtopic = topic?.subtopics.find(
    (item) => item.id === subtopicId,
  );

  const currentStatements = useMemo(
    () =>
      statements.filter(
        (statement) => statement.subtopicId === subtopicId,
      ),
    [subtopicId],
  );

  const currentStatementIds = useMemo(
    () => new Set(currentStatements.map((statement) => statement.id)),
    [currentStatements],
  );

  const currentAnswers = answers.filter((answer) =>
    currentStatementIds.has(answer.statementId),
  );

  const unansweredStatements = currentStatements.filter(
    (statement) =>
      !currentAnswers.some(
        (answer) => answer.statementId === statement.id,
      ),
  );

  const total = currentStatements.length;
  const answered = currentAnswers.length;
  const correct = currentAnswers.filter(
    (answer) => answer.isCorrect,
  ).length;
  const incorrect = answered - correct;

  const percentage =
    total > 0 ? Math.round((correct / total) * 100) : 0;

  function handleAnswer(
    statementId: number,
    selectedAnswer: boolean,
  ) {
    const statement = currentStatements.find(
      (item) => item.id === statementId,
    );

    if (!statement) {
      return;
    }

    setAnswers((current) => [
      ...current,
      {
        statementId,
        isCorrect: selectedAnswer === statement.correctAnswer,
      },
    ]);
  }

  function handleRestart() {
    setAnswers((current) =>
      current.filter(
        (answer) => !currentStatementIds.has(answer.statementId),
      ),
    );
  }

  if (!discipline || !topic) {
    return (
      <section className="page">
        <h2>Conteúdo não encontrado</h2>
      </section>
    );
  }

  return (
    <section className="page discipline-page">
      <div className="discipline-heading">
        <span>{discipline.name}</span>
        <span>/</span>
        <span>{topic.name}</span>

        {subtopic && (
          <>
            <span>/</span>
            <strong>{subtopic.name}</strong>
          </>
        )}
      </div>

      <h2>{subtopic?.name ?? topic.name}</h2>

      <div className="discipline-content">
        <div className="statements-area">
          <div className="statements-table">
            <div className="statements-header">
              <div>Afirmação</div>
              <div>Verdadeiro</div>
              <div>Falso</div>
            </div>

            <div className="statement-list">
              {unansweredStatements.map((statement) => (
                <StatementCard
                  key={statement.id}
                  text={statement.text}
                  onAnswer={(answer) =>
                    handleAnswer(statement.id, answer)
                  }
                />
              ))}

              {!subtopic && (
                <div className="empty-statements">
                  Selecione um subtópico no menu lateral.
                </div>
              )}

              {subtopic && total === 0 && (
                <div className="empty-statements">
                  Nenhuma afirmação cadastrada neste subtópico.
                </div>
              )}

              {total > 0 && unansweredStatements.length === 0 && (
                <div className="statements-finished">
                  <h3>Subtópico concluído</h3>

                  <p>
                    Você respondeu todas as afirmações deste subtópico.
                  </p>

                  <button
                    type="button"
                    className="restart-button"
                    onClick={handleRestart}
                  >
                    Responder novamente
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <aside className="performance-panel">
          <h3>Desempenho</h3>

          <div className="performance-item">
            <span>Total</span>
            <strong>{total}</strong>
          </div>

          <div className="performance-item">
            <span>Respondidas</span>
            <strong>{answered}</strong>
          </div>

          <div className="performance-item performance-correct">
            <span>Certas</span>
            <strong>{correct}</strong>
          </div>

          <div className="performance-item performance-incorrect">
            <span>Erradas</span>
            <strong>{incorrect}</strong>
          </div>

          <div className="performance-percentage">
            <span>Certas sobre o total</span>
            <strong>{percentage}%</strong>
          </div>

          <div className="performance-progress">
            <div
              className="performance-progress-bar"
              style={{ width: `${percentage}%` }}
            />
          </div>

          {answered > 0 && (
            <button
              type="button"
              className="restart-button"
              onClick={handleRestart}
            >
              Reiniciar subtópico
            </button>
          )}
        </aside>
      </div>
    </section>
  );
}