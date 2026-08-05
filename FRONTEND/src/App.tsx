import {
  BrowserRouter,
  Route,
  Routes,
} from "react-router-dom";

import { Layout } from "./components/Layout";
import { AdminDashboard } from "./pages/AdminDashboard";
import { AdminKnowledge } from "./pages/AdminKnowledge";
import { AdminStatements } from "./pages/AdminStatements";
import { AdminStructure } from "./pages/AdminStructure";
import { Discipline } from "./pages/Discipline";
import { Home } from "./pages/Home";
import { ExerciseSession } from "./pages/ExerciseSession";
import { Review } from "./pages/Review";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
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
            element={<AdminDashboard />}
          />

          <Route
            path="/admin/statements"
            element={<AdminStatements />}
          />

          <Route
            path="/admin/structure"
            element={<AdminStructure />}
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
