import { ExamQuestionAdmin, type ExamAdminMode } from "../components/admin/ExamQuestionAdmin";

interface AdminExamToolProps {
  mode: ExamAdminMode;
  title: string;
  description: string;
}

export function AdminExamTool({ mode, title, description }: AdminExamToolProps) {
  return (
    <section className="page admin-tool-page exam-tool-page">
      <header className="admin-tool-heading exam-tool-heading">
        <div>
          <span>Questões de bancas</span>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
      </header>

      <ExamQuestionAdmin mode={mode} />
    </section>
  );
}
