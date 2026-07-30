import {
  BrowserRouter,
  Route,
  Routes,
} from "react-router-dom";

import { Layout } from "./components/Layout";
import { AdminStatements } from "./pages/AdminStatements";
import { AdminStructure } from "./pages/AdminStructure";
import { Discipline } from "./pages/Discipline";
import { Home } from "./pages/Home";

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
            path="/admin/statements"
            element={<AdminStatements />}
          />

          <Route
  path="/admin/structure"
  element={<AdminStructure />}
/>

          <Route
            path="/disciplina/:disciplineId/topico/:topicId"
            element={<Discipline />}
          />

          <Route
            path="/disciplina/:disciplineId/topico/:topicId/subtopico/:subtopicId"
            element={<Discipline />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;