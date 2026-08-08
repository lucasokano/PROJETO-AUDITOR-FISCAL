import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import { ProtectedLayout } from "./components/ProtectedLayout";
import { AdminKnowledge } from "./pages/AdminKnowledge";
import { AdminTrueFalse } from "./pages/AdminTrueFalse";
import { AdminStructure } from "./pages/AdminStructure";
import { AdminQuestionSearch } from "./pages/AdminQuestionSearch";
import { AdminExamTool } from "./pages/AdminExamTool";
import { Discipline } from "./pages/Discipline";
import { Home } from "./pages/Home";
import { ExerciseSession } from "./pages/ExerciseSession";
import { Review } from "./pages/Review";
import { Login } from "./pages/Login";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<ProtectedLayout />}>
          <Route
            path="/"
            element={<Home />}
          />

          <Route
            path="/revisao"
            element={<Review />}
          />

          <Route
            path="/exercicios"
            element={<ExerciseSession />}
          />

          <Route
            path="/admin"
            element={<Navigate to="/admin/structure" replace />}
          />

          <Route
            path="/admin/statements"
            element={<Navigate to="/admin/questions/true-false" replace />}
          />

          <Route
            path="/admin/questions/true-false"
            element={<AdminTrueFalse />}
          />

          <Route
            path="/admin/questions/multiple-choice"
            element={<AdminExamTool mode="questions" title="Adicionar múltipla escolha" description="Cadastre questões avulsas com até cinco alternativas." />}
          />

          <Route
            path="/admin/exams/new"
            element={<AdminExamTool mode="exams" title="Adicionar prova" description="Cadastre uma prova e associe-a a uma banca existente." />}
          />

          <Route
            path="/admin/boards/new"
            element={<AdminExamTool mode="boards" title="Cadastrar banca" description="Mantenha as bancas disponíveis para provas e questões." />}
          />

          <Route
            path="/admin/structure"
            element={<AdminStructure />}
          />

          <Route
            path="/admin/questions/search"
            element={<AdminQuestionSearch />}
          />

          <Route
            path="/admin/knowledge"
            element={<AdminKnowledge />}
          />

          <Route
            path="/disciplina/:disciplineId/topico/:topicId"
            element={<Discipline />}
          />

          <Route
            path="/disciplina/:disciplineId/topico/:topicId/subtopico/:subtopicId"
            element={<Discipline />}
          />

          <Route
            path="/disciplina/:disciplineId/topico/:topicId/subtopico/:subtopicId/exercicios"
            element={<ExerciseSession />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
