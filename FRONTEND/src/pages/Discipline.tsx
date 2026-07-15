import { useParams } from "react-router-dom";

const disciplineNames: Record<string, string> = {
  portugues: "Português",
  informatica: "Informática",
  legislacao: "Legislação",
  "raciocinio-logico": "Raciocínio Lógico",
  criminalistica: "Criminalística",
};

export function Discipline() {
  const { disciplineId } = useParams();

  const disciplineName =
    disciplineNames[disciplineId ?? ""] ?? "Disciplina não encontrada";

  return (
    <section className="page">
      <h2>{disciplineName}</h2>

      <p>
        Esta será a página de estudos da disciplina de {disciplineName}.
      </p>
    </section>
  );
}