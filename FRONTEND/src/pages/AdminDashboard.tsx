import {
  BookOpenCheck,
  Boxes,
  ListPlus,
} from "lucide-react";
import { Link } from "react-router-dom";

export function AdminDashboard() {
  return (
    <section className="page admin-dashboard-page">
      <header className="admin-dashboard-heading">
        <span className="admin-dashboard-eyebrow">
          Administração
        </span>

        <h2>Central administrativa</h2>

        <p>
          Organize a estrutura e mantenha o
          conteúdo usado nas sessões de estudo.
        </p>
      </header>

      <div className="admin-dashboard-grid">
        <Link
          className="admin-dashboard-card"
          to="/admin/structure"
        >
          <span className="admin-dashboard-card-icon">
            <BookOpenCheck size={22} />
          </span>

          <div>
            <h3>Estrutura de conteúdo</h3>
            <p>
              Gerenciar disciplinas, tópicos e
              subtópicos.
            </p>
          </div>

          <span className="admin-dashboard-card-action">
            Acessar
          </span>
        </Link>

        <Link
          className="admin-dashboard-card"
          to="/admin/statements"
        >
          <span className="admin-dashboard-card-icon">
            <ListPlus size={22} />
          </span>

          <div>
            <h3>Afirmações V/F</h3>
            <p>
              Cadastrar, editar, excluir e importar
              afirmações.
            </p>
          </div>

          <span className="admin-dashboard-card-action">
            Acessar
          </span>
        </Link>

        <Link
          className="admin-dashboard-card"
          to="/admin/knowledge"
        >
          <span className="admin-dashboard-card-icon">
            <Boxes size={22} />
          </span>

          <div>
            <h3>Conhecimento estruturado</h3>
            <p>
              Grupos, categorias e itens usados para
              gerar exercícios.
            </p>
          </div>

          <span className="admin-dashboard-card-action">
            Acessar
          </span>
        </Link>
      </div>
    </section>
  );
}
