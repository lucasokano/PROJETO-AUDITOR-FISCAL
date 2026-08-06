import { ArrowRight, BookOpenCheck, Boxes, CheckCircle2, Columns3, ListPlus } from "lucide-react";
import { Link } from "react-router-dom";
import { AdminNavigation } from "../components/admin/AdminNavigation";
import { useStudy } from "../contexts/StudyContext";

const exerciseTypes = [
  ["CLASSIFY_ONE", "Classificação individual"],
  ["CLASSIFY_BATCH", "Classificação em lote"],
  ["TRUE_FALSE", "Verdadeiro ou falso"],
  ["SINGLE_CHOICE", "Escolha única"],
  ["MULTIPLE_SELECT", "Seleção múltipla"],
] as const;

export function AdminDashboard() {
  const { disciplines } = useStudy();
  const topicCount = disciplines.reduce((total, discipline) => total + discipline.topics.length, 0);
  const subtopicCount = disciplines.reduce((total, discipline) => total + discipline.topics.reduce((sum, topic) => sum + topic.subtopics.length, 0), 0);

  return (
    <section className="page admin-dashboard-page admin-workspace">
      <AdminNavigation />
      <header className="admin-dashboard-heading admin-workspace-heading">
        <div><span className="admin-dashboard-eyebrow">Administração</span><h2>Central de conteúdo</h2><p>Organize a base de estudos, mantenha os formatos legados e prepare conhecimento para geração dinâmica.</p></div>
        <Link className="admin-preview-link" to="/exercicios">Testar exercícios <ArrowRight size={15} /></Link>
      </header>

      <section className="admin-overview-strip" aria-label="Resumo da estrutura">
        <div><strong>{disciplines.length}</strong><span>disciplinas</span></div>
        <div><strong>{topicCount}</strong><span>tópicos</span></div>
        <div><strong>{subtopicCount}</strong><span>subtópicos</span></div>
        <div><strong>5</strong><span>formatos dinâmicos</span></div>
      </section>

      <div className="admin-dashboard-grid">
        <Link className="admin-dashboard-card" to="/admin/structure"><span className="admin-dashboard-card-icon"><BookOpenCheck size={20} /></span><div><h3>Estrutura de conteúdo</h3><p>Disciplinas, tópicos e subtópicos que organizam todo o estudo.</p></div><span className="admin-dashboard-card-action">Gerenciar <ArrowRight size={14} /></span></Link>
        <Link className="admin-dashboard-card" to="/admin/statements"><span className="admin-dashboard-card-icon"><ListPlus size={20} /></span><div><h3>Afirmações V/F</h3><p>Conteúdo legado para estudo livre e revisão espaçada.</p></div><span className="admin-dashboard-card-action">Gerenciar <ArrowRight size={14} /></span></Link>
        <Link className="admin-dashboard-card admin-dashboard-card-featured" to="/admin/knowledge"><span className="admin-dashboard-card-icon"><Boxes size={20} /></span><div><h3>Conhecimento estruturado</h3><p>Itens, dimensões e categorias usados pelo gerador de exercícios.</p></div><span className="admin-dashboard-card-action">Gerenciar <ArrowRight size={14} /></span></Link>
      </div>

      <section className="admin-capabilities-section">
        <header>
          <div><span className="admin-dashboard-eyebrow">Motor de exercícios</span><h3>Formatos disponíveis</h3></div>
          <Link className="admin-batch-action" to="/exercicios?type=CLASSIFY_BATCH"><Columns3 size={15} /> Praticar classificação em colunas <ArrowRight size={14} /></Link>
        </header>
        <div className="admin-capabilities-grid">{exerciseTypes.map(([code, label]) => <div key={code}><CheckCircle2 size={15} /><span><strong>{label}</strong><small>{code}</small></span></div>)}</div>
      </section>
    </section>
  );
}
